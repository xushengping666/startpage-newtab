using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PclBridge
{
    /// <summary>
    /// 本地中转下载器：多线程 Range 分段下载（PCL 风格），通过 127.0.0.1:6806 供浏览器扩展调用。
    /// </summary>
    internal static class Program
    {
        static int PORT = 6806;
        static int DefaultThreads = 8;

        static string DetectSystemProxy()
        {
            try
            {
                using var k = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings");
                if (k == null) return "";
                var enable = k.GetValue("ProxyEnable");
                if (enable == null || Convert.ToInt32(enable) == 0) return "";
                var server = k.GetValue("ProxyServer") as string;
                if (string.IsNullOrWhiteSpace(server)) return "";
                if (server.Contains("="))
                {
                    foreach (var part in server.Split(';'))
                        if (part.StartsWith("http=", StringComparison.OrdinalIgnoreCase))
                            return "http://" + part.Substring(5).Trim();
                    return "";
                }
                return "http://" + server.Trim();
            }
            catch { return ""; }
        }

        static string _proxy = DetectSystemProxy();

        static HttpClient BuildHttp(string proxy)
        {
            var h = new HttpClientHandler { AllowAutoRedirect = true };
            if (!string.IsNullOrEmpty(proxy))
            {
                h.Proxy = new WebProxy(proxy);
                h.UseProxy = true;
            }
            return new HttpClient(h) { Timeout = TimeSpan.FromMinutes(30) };
        }

        static HttpClient Http = BuildHttp(_proxy);

        static readonly ConcurrentDictionary<string, TaskInfo> Tasks = new();

        /// <summary>修剪任务表：结束超过 60 秒的移除，最多保留 40 条，防止 /status 无限膨胀。</summary>
        static void PruneTasks()
        {
            try
            {
                var now = DateTime.UtcNow;
                foreach (var kv in Tasks.ToArray())
                {
                    var t = kv.Value;
                    var finished = t.State != null && (t.State.StartsWith("done") || t.State.StartsWith("失败") || t.State.StartsWith("探测失败"));
                    if (finished && (now - t.CreatedAt).TotalSeconds > 60) { Tasks.TryRemove(kv.Key, out _); }
                }
                if (Tasks.Count > 40)
                {
                    foreach (var kv in Tasks.OrderBy(k => k.Value.CreatedAt).Take(Tasks.Count - 40).ToArray())
                        Tasks.TryRemove(kv.Key, out _);
                }
            }
            catch { }
        }

        static string _dirOverride = "";
        static bool _lastOpened = false;

        static string DefaultDir
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(_dirOverride)) return _dirOverride;
                var d = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads", "PCL扩展下载");
                try { Directory.CreateDirectory(d); } catch { }
                return d;
            }
        }

        // ===== SPlayer 联动：窗口标题 + 系统媒体会话 + 媒体键 =====
        const byte VK_MEDIA_NEXT_TRACK = 0xB0;
        const byte VK_MEDIA_PREV_TRACK = 0xB1;
        const byte VK_MEDIA_PLAY_PAUSE = 0xB3;

        [DllImport("user32.dll", SetLastError = true)]
        static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

        static void MediaKey(byte vk)
        {
            keybd_event(vk, 0, 0, UIntPtr.Zero);
            keybd_event(vk, 0, 2, UIntPtr.Zero);
        }

        static readonly string[] PlayerNames = { "SPlayer", "splayer" };

        delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        [DllImport("user32.dll")]
        static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);

        [DllImport("user32.dll")]
        static extern bool IsWindowVisible(IntPtr hWnd);

        static string FindWindowTitle(int[] pids)
        {
            string found = "";
            try
            {
                EnumWindows((h, l) =>
                {
                    uint pid;
                    GetWindowThreadProcessId(h, out pid);
                    if (Array.IndexOf(pids, (int)pid) < 0) return true;
                    var sb = new StringBuilder(512);
                    GetWindowText(h, sb, sb.Capacity);
                    var s = sb.ToString().Trim();
                    if (s.Length == 0) return true;
                    if (s.IndexOf("SPlayer", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        found = s;
                        if (IsWindowVisible(h)) return false;
                    }
                    return true;
                }, IntPtr.Zero);
            }
            catch { }
            return found;
        }

        static (string title, string artist, string raw) ReadPlayerTitle()
        {
            try
            {
                foreach (var name in PlayerNames)
                {
                    var procs = System.Diagnostics.Process.GetProcessesByName(name);
                    if (procs.Length == 0) continue;
                    var p = procs.FirstOrDefault(x => x.MainWindowHandle != IntPtr.Zero);
                    var raw = p != null ? (p.MainWindowTitle ?? "").Trim() : "";
                    if (raw.Length == 0)
                    {
                        raw = FindWindowTitle(procs.Select(x => x.Id).ToArray());
                    }
                    if (raw.Length == 0) continue;
                    var s = raw;
                    var bar = s.LastIndexOf(" | ", StringComparison.Ordinal);
                    if (bar > 0) s = s.Substring(0, bar);
                    var dash = s.LastIndexOf(" - ", StringComparison.Ordinal);
                    if (dash > 0) return (s.Substring(0, dash).Trim(), s.Substring(dash + 3).Trim(), raw);
                    return (s.Trim(), "", raw);
                }
            }
            catch { }
            return ("", "", "");
        }

        // ===== 系统媒体会话（WinRT，直接读 SMTC）=====
        static readonly object _npLock = new object();
        static DateTime _npAt = DateTime.MinValue;
        static (string state, string title, string artist, string album, double pos, double dur, string cover) _npCache = ("", "", "", "", 0, 0, "");
        static string _coverPath = Path.Combine(Path.GetTempPath(), "pclbridge-cover.bin");

        static async Task<(string state, string title, string artist, string album, double pos, double dur, string cover)> FetchNowPlayingAsync()
        {
            try
            {
                var mgr = await Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
                var s = mgr.GetSessions().FirstOrDefault(x => (x.SourceAppUserModelId ?? "").IndexOf("splayer", StringComparison.OrdinalIgnoreCase) >= 0);
                if (s == null) return ("", "", "", "", 0, 0, "");
                var st = s.GetPlaybackInfo().PlaybackStatus.ToString().ToLowerInvariant();
                var props = await s.TryGetMediaPropertiesAsync();
                var tl = s.GetTimelineProperties();
                string cover = "";
                try
                {
                    if (props.Thumbnail != null)
                    {
                        using var stream = await props.Thumbnail.OpenReadAsync();
                        using var net = stream.AsStreamForRead();
                        using var fs = File.Create(_coverPath);
                        net.CopyTo(fs);
                        cover = _coverPath;
                    }
                }
                catch { }
                return (st, props.Title ?? "", props.Artist ?? "", props.AlbumTitle ?? "", tl.Position.TotalSeconds, tl.EndTime.TotalSeconds, cover);
            }
            catch { return ("", "", "", "", 0, 0, ""); }
        }

        static async Task<(string state, string title, string artist, string album, double pos, double dur, string cover)> GetNowPlayingAsync()
        {
            lock (_npLock)
            {
                if (_npAt != DateTime.MinValue && (DateTime.UtcNow - _npAt).TotalMilliseconds < 450) return _npCache;
            }
            var r = await FetchNowPlayingAsync();
            lock (_npLock) { _npCache = r; _npAt = DateTime.UtcNow; }
            return r;
        }

        static async Task<bool> TogglePlayAsync()
        {
            try
            {
                var mgr = await Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
                var s = mgr.GetSessions().FirstOrDefault(x => (x.SourceAppUserModelId ?? "").IndexOf("splayer", StringComparison.OrdinalIgnoreCase) >= 0);
                if (s == null) return false;
                var ok = await s.TryTogglePlayPauseAsync();
                _npAt = DateTime.MinValue;
                return ok;
            }
            catch { return false; }
        }

        static async Task<bool> SkipAsync(bool next)
        {
            try
            {
                var mgr = await Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
                var s = mgr.GetSessions().FirstOrDefault(x => (x.SourceAppUserModelId ?? "").IndexOf("splayer", StringComparison.OrdinalIgnoreCase) >= 0);
                if (s == null) return false;
                var ok = next ? await s.TrySkipNextAsync() : await s.TrySkipPreviousAsync();
                _npAt = DateTime.MinValue;
                return ok;
            }
            catch { return false; }
        }
        static async Task<bool> SeekToAsync(double sec)
        {
            try
            {
                var mgr = await Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
                var s = mgr.GetSessions().FirstOrDefault(x => (x.SourceAppUserModelId ?? "").IndexOf("splayer", StringComparison.OrdinalIgnoreCase) >= 0);
                if (s == null) return false;
                return await s.TryChangePlaybackPositionAsync((long)(Math.Max(0, sec) * 10_000_000));
            }
            catch { return false; }
        }

        static string VolScriptPath()
        {
            var path = Path.Combine(Path.GetTempPath(), "pclbridge-vol.ps1");
            if (File.Exists(path)) return path;
            var sb = new StringBuilder();
            sb.AppendLine("$ErrorActionPreference = 'Stop'");
            sb.AppendLine("Add-Type -TypeDefinition @'");
            sb.AppendLine("using System;");
            sb.AppendLine("using System.Runtime.InteropServices;");
            sb.AppendLine("[ComImport, Guid(\"BCDE0395-E52F-467C-8E3D-C4579291692E\")] class MMDeviceEnumerator { }");
            sb.AppendLine("[Guid(\"A95664D2-9614-4F35-A746-DE8DB63617E6\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]");
            sb.AppendLine("interface IMMDeviceEnumerator { int NotImpl1(); int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice); }");
            sb.AppendLine("[Guid(\"D666063F-1587-4E43-81F1-B948E807363F\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]");
            sb.AppendLine("interface IMMDevice { int Activate(ref Guid iid, int clsCtx, IntPtr p, [MarshalAs(UnmanagedType.IUnknown)] out object iface); }");
            sb.AppendLine("[Guid(\"5CDF2C82-841E-4546-9722-0CF74078229A\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]");
            sb.AppendLine("interface IAudioEndpointVolume { int RegisterControlChangeNotify(IntPtr p); int UnregisterControlChangeNotify(IntPtr p); int GetChannelCount(out uint c); int SetMasterVolumeLevel(float level, Guid ctx); int SetMasterVolumeLevelScalar(float level, Guid ctx); int GetMasterVolumeLevel(out float level); int GetMasterVolumeLevelScalar(out float level); }");
            sb.AppendLine("public static class VolCtl {");
            sb.AppendLine("  static IAudioEndpointVolume Get() { var en=(IMMDeviceEnumerator)(new MMDeviceEnumerator()); IMMDevice dev; en.GetDefaultAudioEndpoint(0,1,out dev); Guid iid=typeof(IAudioEndpointVolume).GUID; object o; dev.Activate(ref iid,23,IntPtr.Zero,out o); return (IAudioEndpointVolume)o; }");
            sb.AppendLine("  public static int GetLevel() { try { float v; Get().GetMasterVolumeLevelScalar(out v); return (int)Math.Round(v*100); } catch { return -1; } }");
            sb.AppendLine("  public static bool SetLevel(int pct) { try { if(pct<0)pct=0; if(pct>100)pct=100; Guid g=Guid.Empty; Get().SetMasterVolumeLevelScalar(pct/100f,g); return true; } catch { return false; } }");
            sb.AppendLine("}");
            sb.AppendLine("'@");
            sb.AppendLine("if ($args.Count -gt 0) { $n=[int]$args[0]; $ok=[VolCtl]::SetLevel($n); \"{`\"ok`\":$($ok.ToString().ToLower()),`\"level`\":$([VolCtl]::GetLevel())}\" } else { \"{`\"ok`\":true,`\"level`\":$([VolCtl]::GetLevel())}\" }");
            try { File.WriteAllText(path, sb.ToString(), new UTF8Encoding(false)); } catch { }
            return path;
        }

        static string RunVol(string arg)
        {
            try
            {
                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + VolScriptPath() + "\"" + (string.IsNullOrEmpty(arg) ? "" : " " + arg),
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    StandardOutputEncoding = Encoding.UTF8
                };
                using var pr = System.Diagnostics.Process.Start(psi);
                if (pr == null) return "";
                var outp = pr.StandardOutput.ReadToEnd();
                pr.WaitForExit(4000);
                return (outp ?? "").Trim();
            }
            catch { return ""; }
        }
        static void Bin(HttpListenerContext ctx, string path, string type)
        {
            try
            {
                var bytes = File.ReadAllBytes(path);
                Cors(ctx);
                ctx.Response.StatusCode = 200;
                ctx.Response.ContentType = type;
                ctx.Response.Headers["Cache-Control"] = "no-store";
                ctx.Response.ContentLength64 = bytes.Length;
                ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                ctx.Response.Close();
            }
            catch { try { Json(ctx, 404, new { ok = false, error = "no cover" }); } catch { } }
        }
        static int Install(string extId, int threads)
        {
            try
            {
                var dir = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
                var exePath = Path.Combine(dir, "PclBridge.exe");
                var manifestPath = Path.Combine(dir, "com.pclbridge.bridge.json");
                var manifest = new
                {
                    name = "com.pclbridge.bridge",
                    description = "PCL 下载中转",
                    path = exePath,
                    type = "stdio",
                    allowed_origins = new[] { "chrome-extension://" + extId + "/" }
                };
                File.WriteAllText(manifestPath, JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true }), new UTF8Encoding(false));
                var subs = new[]
                {
                    @"Software\Microsoft\Edge\NativeMessagingHosts",
                    @"Software\Google\Chrome\NativeMessagingHosts",
                    @"Software\Chromium\NativeMessagingHosts"
                };
                foreach (var sub in subs)
                {
                    using var k = Microsoft.Win32.Registry.CurrentUser.CreateSubKey(sub + @"\com.pclbridge.bridge");
                    k?.SetValue(null, manifestPath);
                }
                try { File.WriteAllText(Path.Combine(dir, "threads.txt"), threads.ToString()); } catch { }
                Console.WriteLine("已注册原生宿主: " + manifestPath);
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("安装失败: " + ex.Message);
                return 1;
            }
        }
        static async Task<int> Main(string[] args)
        {
            int installIdx = Array.IndexOf(args, "--install");
            if (installIdx >= 0 && installIdx + 1 < args.Length)
            {
                int th = 8;
                int ti = Array.IndexOf(args, "--threads");
                if (ti >= 0 && ti + 1 < args.Length && int.TryParse(args[ti + 1], out var tv0)) th = tv0;
                return Install(args[installIdx + 1], th);
            }
            Console.OutputEncoding = Encoding.UTF8;
            int port = PORT;
            if (args.Length > 0 && int.TryParse(args[0], out var p)) port = p;
            for (int i = 0; i < args.Length - 1; i++)
                if (args[i] == "--threads" && int.TryParse(args[i + 1], out var th)) DefaultThreads = Math.Clamp(th, 1, 64);

            bool nativeHost = args.Contains("--native-host") ||
                              args.Any(a => a != null && a.StartsWith("chrome-extension://", StringComparison.OrdinalIgnoreCase));

            if (nativeHost)
            {
                // 原生消息协议占用 stdout，所有日志改到 stderr，否则 Chrome 会判定通信失败
                Console.SetOut(Console.Error);
            }

            var listener = new HttpListener();
            listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            try { listener.Start(); }
            catch (Exception ex) { Console.WriteLine("端口占用或无法监听: " + ex.Message); return 1; }

            Console.WriteLine("PclBridge 已启动: http://127.0.0.1:" + port + "/");
            Console.WriteLine("保存目录: " + DefaultDir);
            Console.WriteLine("默认线程数: " + DefaultThreads);
            Console.WriteLine(string.IsNullOrEmpty(_proxy) ? "代理: 未使用" : ("代理: " + _proxy));
            if (!nativeHost) Console.WriteLine("按 Ctrl+C 退出");

            // HTTP 服务常驻（后台）
            _ = Task.Run(async () =>
            {
                while (true)
                {
                    var ctx = await listener.GetContextAsync();
                    _ = Task.Run(() => Handle(ctx));
                }
            });

            if (nativeHost)
            {
                Console.WriteLine("原生主机模式：随浏览器启停，可接收线程数");
                // 兜底：浏览器全部退出后（即使 stdin 没断开）也自行结束
                _ = Task.Run(async () =>
                {
                    while (true)
                    {
                        await Task.Delay(4000);
                        try
                        {
                            if (System.Diagnostics.Process.GetProcessesByName("msedge").Length == 0 &&
                                System.Diagnostics.Process.GetProcessesByName("chrome").Length == 0)
                            {
                                Console.WriteLine("未检测到浏览器，退出");
                                Environment.Exit(0);
                            }
                        }
                        catch { }
                    }
                });
                var stdin = Console.OpenStandardInput();
                var stdout = Console.OpenStandardOutput();
                var lenBuf = new byte[4];
                while (true)
                {
                    int read = 0;
                    bool eof = false;
                    while (read < 4)
                    {
                        int n = stdin.Read(lenBuf, read, 4 - read);
                        if (n <= 0) { eof = true; break; }
                        read += n;
                    }
                    if (eof) break;
                    int len = BitConverter.ToInt32(lenBuf, 0);
                    if (len <= 0 || len > 1024 * 1024) continue;
                    var body = new byte[len];
                    int got = 0;
                    while (got < len)
                    {
                        int n = stdin.Read(body, got, len - got);
                        if (n <= 0) break;
                        got += n;
                    }
                    if (got < len) break;
                    try
                    {
                        using var doc = JsonDocument.Parse(body);
                        if (doc.RootElement.TryGetProperty("threads", out var tEl) && tEl.TryGetInt32(out var tv))
                        {
                            DefaultThreads = Math.Clamp(tv, 1, 64);
                            Console.WriteLine("线程数更新为 " + DefaultThreads);
                        }
                        if (doc.RootElement.TryGetProperty("dir", out var dEl) && dEl.ValueKind == JsonValueKind.String)
                        {
                            _dirOverride = dEl.GetString() ?? "";
                            Console.WriteLine("保存目录设为 " + DefaultDir);
                        }
                        if (doc.RootElement.TryGetProperty("openFolder", out var oEl) && oEl.ValueKind == JsonValueKind.True)
                        {
                            try
                            {
                                Directory.CreateDirectory(DefaultDir);
                                System.Diagnostics.Process.Start("explorer.exe", "\"" + DefaultDir + "\"");
                                _lastOpened = true;
                                Console.WriteLine("已打开目录: " + DefaultDir);
                            }
                            catch (Exception ex) { _lastOpened = false; Console.WriteLine("打开目录失败: " + ex.Message); }
                        }
                    }
                    catch { }
                    var reply = Encoding.UTF8.GetBytes("{\"ok\":true,\"threads\":" + DefaultThreads + ",\"dir\":\"" + DefaultDir.Replace("\\", "\\\\") + "\",\"opened\":" + (_lastOpened ? "true" : "false") + "}");
                    _lastOpened = false;
                    var rl = BitConverter.GetBytes(reply.Length);
                    try { stdout.Write(rl, 0, 4); stdout.Write(reply, 0, reply.Length); stdout.Flush(); } catch { }
                }
                Console.WriteLine("浏览器已关闭，退出");
                return 0;
            }

            while (true) { await Task.Delay(1000); }
        }

        static void Cors(HttpListenerContext ctx)
        {
            ctx.Response.Headers["Access-Control-Allow-Origin"] = "*";
            ctx.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
            ctx.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
        }

        static void Json(HttpListenerContext ctx, int code, object obj)
        {
            Cors(ctx);
            ctx.Response.StatusCode = code;
            ctx.Response.ContentType = "application/json; charset=utf-8";
            var buf = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(obj));
            ctx.Response.ContentLength64 = buf.Length;
            ctx.Response.OutputStream.Write(buf, 0, buf.Length);
            ctx.Response.Close();
        }

        static async Task Handle(HttpListenerContext ctx)
        {
            try
            {
                if (ctx.Request.HttpMethod == "OPTIONS") { Cors(ctx); ctx.Response.StatusCode = 204; ctx.Response.Close(); return; }
                var path = ctx.Request.Url!.AbsolutePath.TrimEnd('/').ToLowerInvariant();
                var q = ctx.Request.QueryString;

                if (path == "/add" || path == "/api/add")
                {
                    var url = q["url"];
                    if (string.IsNullOrWhiteSpace(url)) { Json(ctx, 400, new { ok = false, error = "缺少 url 参数" }); return; }
                    var dir = q["dir"];
                    var name = q["name"];
                    int threads = DefaultThreads;
                    if (int.TryParse(q["threads"], out var tq)) threads = Math.Clamp(tq, 1, 64);
                    var info = Start(url, string.IsNullOrWhiteSpace(dir) ? DefaultDir : dir, name, threads);
                    Json(ctx, 200, new { ok = true, id = info.Id, file = info.File, size = info.Total });
                    return;
                }
                if (path == "/status" || path == "/api/status")
                {
                    PruneTasks();
                    Json(ctx, 200, new { ok = true, tasks = Tasks.Values.Select(t => new { id = t.Id, file = t.File, state = t.State, done = t.Done, total = t.Total, percent = t.Percent, threads = t.Threads }).ToArray() });
                    return;
                }
                if (path == "/ping")
                {
                    Json(ctx, 200, new { ok = true, name = "PclBridge", version = "1.2", dir = DefaultDir, threads = DefaultThreads });
                    return;
                }
                if (path == "/nowplaying" || path == "/api/nowplaying")
                {
                    if (q["fresh"] == "1") _npAt = DateTime.MinValue;
                    var (state, psTitle, psArtist, psAlbum, pos, dur, cover) = await GetNowPlayingAsync();
                    var (wtTitle, wtArtist, raw) = ReadPlayerTitle();
                    var title = psTitle.Length > 0 ? psTitle : wtTitle;
                    var artist = psArtist.Length > 0 ? psArtist : wtArtist;
                    Json(ctx, 200, new
                    {
                        ok = true,
                        app = "SPlayer",
                        running = raw.Length > 0 || title.Length > 0,
                        title,
                        artist,
                        album = psAlbum,
                        state,
                        playing = state == "playing",
                        pos,
                        dur,
                        cover = File.Exists(cover) ? 1 : 0,
                        raw
                    });
                    return;
                }
                if (path == "/cover" || path == "/api/cover")
                {
                    var (_, _, _, _, _, _, coverPath) = await GetNowPlayingAsync();
                    if (!string.IsNullOrEmpty(coverPath) && File.Exists(coverPath)) Bin(ctx, coverPath, "image/jpeg");
                    else Json(ctx, 404, new { ok = false, error = "no cover" });
                    return;
                }
                if (path == "/volume" || path == "/api/volume")
                {
                    var set = q["set"] ?? q["level"];
                    var outStr = RunVol(string.IsNullOrEmpty(set) ? "" : set.Trim());
                    if (string.IsNullOrEmpty(outStr)) { Json(ctx, 500, new { ok = false, error = "volume unavailable" }); return; }
                    try
                    {
                        using var doc = JsonDocument.Parse(outStr);
                        var lv = doc.RootElement.TryGetProperty("level", out var v) ? v.GetInt32() : -1;
                        Json(ctx, 200, new { ok = true, level = lv, action = string.IsNullOrEmpty(set) ? "get" : "set" });
                    }
                    catch { Json(ctx, 200, new { ok = true, level = -1 }); }
                    return;
                }
                if (path == "/media" || path == "/api/media")
                {
                    var act = (q["action"] ?? "").Trim().ToLowerInvariant();
                    if (act == "playpause" || act == "toggle" || act == "play" || act == "pause")
                    {
                        var okT = await TogglePlayAsync();
                        if (!okT) MediaKey(VK_MEDIA_PLAY_PAUSE);
                        Json(ctx, 200, new { ok = true, action = "playpause", via = okT ? "smtc" : "key" });
                        return;
                    }
                    if (act == "next" || act == "prev")
                    {
                        var okS = await SkipAsync(act == "next");
                        if (!okS) MediaKey(act == "next" ? VK_MEDIA_NEXT_TRACK : VK_MEDIA_PREV_TRACK);
                        Json(ctx, 200, new { ok = true, action = act, via = okS ? "smtc" : "key" });
                        return;
                    }
                    if (act == "seek")
                    {
                        double posSec = 0;
                        double.TryParse(q["pos"] ?? "0", out posSec);
                        var okSeek = await SeekToAsync(Math.Max(0, posSec));
                        Json(ctx, 200, new { ok = okSeek, action = "seek", pos = posSec });
                        return;
                    }
                    byte vk = act switch
                    {
                        "next" => VK_MEDIA_NEXT_TRACK,
                        "prev" => VK_MEDIA_PREV_TRACK,
                        "playpause" or "play" or "pause" or "toggle" => VK_MEDIA_PLAY_PAUSE,
                        _ => (byte)0
                    };
                    if (vk == 0) { Json(ctx, 400, new { ok = false, error = "action 需为 prev / playpause / next" }); return; }
                    MediaKey(vk);
                    Json(ctx, 200, new { ok = true, action = act });
                    return;
                }
                if (path == "/clipboard/history" || path == "/api/clipboard/history")
                {
                    try
                    {
                        var res = await Windows.ApplicationModel.DataTransfer.Clipboard.GetHistoryItemsAsync();
                        var items = new List<object>();
                        foreach (var it in res.Items)
                        {
                            try
                            {
                                var view = it.Content;
                                if (!view.Contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.Text)) continue;
                                var txt = await view.GetTextAsync();
                                if (string.IsNullOrWhiteSpace(txt)) continue;
                                items.Add(new { text = txt.Length > 2000 ? txt.Substring(0, 2000) : txt, at = it.Timestamp.ToUnixTimeMilliseconds() });
                            }
                            catch { }
                        }
                        items.Sort((a, b) => 0);
                        Json(ctx, 200, new { ok = true, status = res.Status.ToString(), items = items.ToArray() });
                    }
                    catch (Exception ex) { Json(ctx, 500, new { ok = false, error = ex.Message }); }
                    return;
                }
                Json(ctx, 404, new { ok = false, error = "unknown" });
            }
            catch (Exception ex) { try { Json(ctx, 500, new { ok = false, error = ex.Message }); } catch { } }
        }

        class TaskInfo
        {
            public int Threads = 1;
            public DateTime CreatedAt = DateTime.UtcNow;
            public string Id = Guid.NewGuid().ToString("N")[..8];
            public string Url = "";
            public string File = "";
            public long Total;
            public long Done;
            public string State = "pending";
            public double Percent => Total > 0 ? Math.Round(Done * 100.0 / Total, 1) : 0;
        }

        static TaskInfo Start(string url, string dir, string name, int threads)
        {
            var info = new TaskInfo { Url = url };
            Tasks[info.Id] = info;
            _ = Task.Run(async () => await Download(info, url, dir, name, threads));
            return info;
        }

        static string CleanName(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return "";
            try { s = Uri.UnescapeDataString(s); } catch { }
            s = s.Trim().Trim('"');
            if (s == "download.bin" || s == "down" || s.Length <= 2) return "";
            return s;
        }

        static async Task Download(TaskInfo info, string url, string dir, string name, int threads)
        {
            try
            {
                Directory.CreateDirectory(dir);
                using var head = new HttpRequestMessage(HttpMethod.Head, url);
                head.Headers.UserAgent.ParseAdd("Mozilla/5.0 PclBridge");
                HttpResponseMessage? resp = null;
                try { resp = await Http.SendAsync(head); } catch { }

                long total = -1;
                bool ranges = false;

                if (resp != null && resp.IsSuccessStatusCode)
                {
                    total = resp.Content.Headers.ContentLength ?? -1;
                    ranges = resp.Headers.AcceptRanges.Contains("bytes");
                }
                else
                {
                    // 服务器不支持 HEAD：用 GET + Range: bytes=0-0 探测大小与分段能力
                    try
                    {
                        using var probe = new HttpRequestMessage(HttpMethod.Get, url);
                        probe.Headers.UserAgent.ParseAdd("Mozilla/5.0 PclBridge");
                        probe.Headers.Range = new System.Net.Http.Headers.RangeHeaderValue(0, 0);
                        using var pr = await Http.SendAsync(probe, HttpCompletionOption.ResponseHeadersRead);
                        if (pr.StatusCode == System.Net.HttpStatusCode.PartialContent)
                        {
                            ranges = true;
                            var cr = pr.Content.Headers.ContentRange;
                            if (cr != null && cr.Length.HasValue) total = cr.Length.Value;
                        }
                        else if (pr.IsSuccessStatusCode)
                        {
                            total = pr.Content.Headers.ContentLength ?? -1;
                        }
                        else { info.State = "探测失败:" + (int)pr.StatusCode; return; }
                    }
                    catch (Exception ex) { info.State = "探测失败:" + ex.Message; return; }
                }
                string fileName = name;
                if (string.IsNullOrWhiteSpace(fileName))
                {
                    fileName = resp?.Content.Headers.ContentDisposition?.FileName?.Trim('"');
                    if (string.IsNullOrWhiteSpace(fileName))
                    {
                        try { fileName = Path.GetFileName(new Uri(url).AbsolutePath); } catch { }
                    }
                    if (string.IsNullOrWhiteSpace(fileName)) fileName = "download.bin";
                    fileName = string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
                }
                fileName = CleanName(fileName);
                if (string.IsNullOrWhiteSpace(fileName)) fileName = "download-" + DateTime.Now.ToString("HHmmss") + ".bin";
                info.File = Path.Combine(dir, fileName);
                info.Total = total;
                info.State = "downloading";

                if (ranges && total > 1024 * 1024)
                {
                    await ParallelRanges(info, url, total, threads);
                }
                else
                {
                    using var fs = new FileStream(info.File, FileMode.Create, FileAccess.Write, FileShare.None, 1 << 20, true);
                    using var r = await Http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
                    using var s = await r.Content.ReadAsStreamAsync();
                    var buf = new byte[1 << 20];
                    int n;
                    while ((n = await s.ReadAsync(buf)) > 0) { await fs.WriteAsync(buf.AsMemory(0, n)); info.Done += n; }
                }
                info.State = "done";
                Console.WriteLine($"[完成] {fileName}  {info.Done / 1024.0 / 1024.0:F1} MB  ({info.Threads} 线程)");
            }
            catch (Exception ex)
            {
                info.State = "失败: " + ex.Message;
                Console.WriteLine("[失败] " + info.Url + " → " + ex.Message);
            }
        }

        static async Task SingleStream(TaskInfo info, string url)
        {
            info.Threads = 1;
            using var fs = new FileStream(info.File, FileMode.Create, FileAccess.Write, FileShare.None, 1 << 20, true);
            using var r = await Http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            using var s = await r.Content.ReadAsStreamAsync();
            var buf = new byte[1 << 20];
            int n;
            while ((n = await s.ReadAsync(buf)) > 0) { await fs.WriteAsync(buf.AsMemory(0, n)); info.Done += n; }
        }

        static async Task ParallelRanges(TaskInfo info, string url, long total, int threads)
        {
            threads = Math.Clamp(threads, 1, 64);
            if (threads == 1) { await SingleStream(info, url); return; }
            var partSize = total / threads;
            var ranges = new List<(long Start, long End)>();
            for (int i = 0; i < threads; i++)
            {
                long start = i * partSize;
                long end = (i == threads - 1) ? total - 1 : (start + partSize - 1);
                ranges.Add((start, end));
            }
            info.Threads = threads;
            var parts = new byte[ranges.Count][];
            await Parallel.ForEachAsync(Enumerable.Range(0, ranges.Count), new ParallelOptions { MaxDegreeOfParallelism = threads }, async (idx, ct) =>
            {
                using var req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Range = new System.Net.Http.Headers.RangeHeaderValue(ranges[idx].Start, ranges[idx].End);
                req.Headers.UserAgent.ParseAdd("Mozilla/5.0 PclBridge");
                using var r = await Http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
                using var ms = new MemoryStream();
                using var s = await r.Content.ReadAsStreamAsync(ct);
                var buf = new byte[1 << 20];
                int n;
                while ((n = await s.ReadAsync(buf, ct)) > 0)
                {
                    await ms.WriteAsync(buf.AsMemory(0, n), ct);
                    Interlocked.Add(ref info.Done, n);
                }
                parts[idx] = ms.ToArray();
            });

            using var fs = new FileStream(info.File, FileMode.Create, FileAccess.Write, FileShare.None, 1 << 20, false);
            foreach (var p in parts) await fs.WriteAsync(p);
        }
    }
}
