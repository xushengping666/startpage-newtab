/* 随浏览器启动：通过原生消息（Native Messaging）拉起 PclBridge，浏览器关闭时由 Chrome 结束它 */
var nativePort = null;
var lastPclId = null;
var nativeErr = "";
function pushThreads() {
  if (!nativePort) return;
  try {
    chrome.storage.local.get("spDownloader", function (r) {
      var th = (r && r.spDownloader && r.spDownloader.threads) || 8;
      try { nativePort.postMessage({ threads: th }); } catch (e) {}
    });
  } catch (e) {}
}

function pushDir() {
  if (!nativePort) return;
  try {
    chrome.storage.local.get("spDownloader", function (r) {
      var d = (r && r.spDownloader && r.spDownloader.dir) || "";
      try { nativePort.postMessage({ dir: d }); } catch (e) {}
    });
  } catch (e) {}
}

function openDownloadFolder() {
  ensureNativeHost();
  setTimeout(function () {
    if (nativePort) {
      try { nativePort.postMessage({ openFolder: true }); return; } catch (e) {}
    }
    try { chrome.downloads.showDefaultFolder(); } catch (e) {}
  }, 500);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // 强制启动
  if (msg && msg.type === "sp-force-start") {
    nativePort = null;
    nativeErr = "";
    var okStart = ensureNativeHost();
    setTimeout(function () {
      fetch("http://127.0.0.1:6806/ping", { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (j) { sendResponse({ ok: true, info: j.threads + " 线程 · " + j.dir }); })
        .catch(function () { sendResponse({ ok: false, err: nativeErr || (okStart ? "宿主已连接但无响应" : "connectNative 失败") }); });
    }, 1500);
    return true;
  }
  // 页面加载时确保宿主在线
  if (msg && msg.type === "sp-ensure-host") {
    var ok0 = ensureNativeHost();
    setTimeout(function () { sendResponse({ ok: !!nativePort, err: nativeErr, started: ok0 }); }, 900);
    return true;
  }
  // 自检
  if (msg && msg.type === "sp-self-check") {
    ensureNativeHost();
    setTimeout(function () { sendResponse({ ok: !!nativePort, err: nativeErr || "无错误信息" }); }, 900);
    return true;
  }
});

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg && msg.type === "sp-open-dl-folder") openDownloadFolder();
});

/* 清理浏览器里残留的“已取消/中断”下载记录：否则浏览器重启或扩展重载时，
   Chrome 可能重试这些条目，扩展又会把它们转发给下载器，表现为“疯狂下载” */
function purgeInterruptedDownloads() {
  try {
    chrome.downloads.search({ state: "interrupted" }, function (items) {
      (items || []).forEach(function (it) {
        try { chrome.downloads.erase({ id: it.id }); } catch (e) {}
      });
      if (items && items.length) console.log("[下载接管] 清理中断记录:", items.length);
    });
  } catch (e) {}
}
chrome.runtime.onStartup.addListener(purgeInterruptedDownloads);
chrome.runtime.onInstalled.addListener(purgeInterruptedDownloads);
purgeInterruptedDownloads();

function ensureNativeHost() {
  if (nativePort) return true;
  try {
    nativePort = chrome.runtime.connectNative("com.pclbridge.bridge");
    if (chrome.runtime.lastError) { nativeErr = chrome.runtime.lastError.message || ""; }
    nativePort.onDisconnect.addListener(function () {
      nativeErr = (chrome.runtime.lastError && chrome.runtime.lastError.message) || "连接已断开";
      nativePort = null;
    });
    setTimeout(function () { pushThreads(); pushDir(); }, 300);
    return true;
  } catch (e) { nativeErr = e.message || String(e); return false; }
}
chrome.storage.onChanged.addListener(function (ch, area) {
  if (area === "local" && ch.spDownloader) pushThreads();
});
function cleanOldNotifications() {
  try {
    chrome.notifications.getAll(function (all) {
      Object.keys(all || {}).forEach(function (id) {
        if (id.indexOf("pcl") === 0) { try { chrome.notifications.clear(id); } catch (e) {} }
      });
    });
  } catch (e) {}
}
chrome.runtime.onStartup.addListener(ensureNativeHost);
chrome.runtime.onStartup.addListener(cleanOldNotifications);
chrome.runtime.onInstalled.addListener(cleanOldNotifications);
try {
  chrome.tabs.onCreated.addListener(function () { ensureNativeHost(); });
  chrome.tabs.onActivated.addListener(function () { ensureNativeHost(); });
  chrome.windows.onFocusChanged.addListener(function () { ensureNativeHost(); });
} catch (e) {}
chrome.runtime.onInstalled.addListener(ensureNativeHost);

/* 下载进度通知 */
function fmtSize(n) {
  n = Number(n) || 0;
  if (n <= 0) return "未知大小";
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(0) + " KB";
  return n + " B";
}

var __doneQ = [], __doneTimer = null;
function notifyDone(name, sizeText) {
  __doneQ.push({ name: name, size: sizeText });
  if (__doneTimer) return;
  __doneTimer = setTimeout(function () {
    var items = __doneQ; __doneQ = []; __doneTimer = null;
    if (!items.length) return;
    try { chrome.notifications.clear("pcl-done"); } catch (e) {}
    try {
      if (items.length === 1) {
        chrome.notifications.create("pcl-done", {
          type: "basic", iconUrl: "icon128.png",
          title: "下载完成",
          message: items[0].name + "  ·  " + items[0].size,
          priority: 1
        });
      } else {
        chrome.notifications.create("pcl-done", {
          type: "basic", iconUrl: "icon128.png",
          title: "下载完成 · " + items.length + " 个文件",
          message: items[0].name + " 等",
          priority: 1
        });
      }
    } catch (e) {}
  }, 1500);
}

function trackDownload(id, fallbackName, mode) {
  mode = mode || "done";   // done=仅完成 / steps=每25% / steps10=每10%
  if (!id) return;
  var tries = 0, lastPct = -1, lastBucket = -1, lastDone = -1, lastTs = Date.now(), speed = 0;
  var timer = setInterval(function () {
    tries++;
    if (tries > 3600) { clearInterval(timer); return; }
    fetch("http://127.0.0.1:6806/status", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var t = (j.tasks || []).filter(function (x) { return x.id === id; })[0];
        if (!t) { if (tries > 4) clearInterval(timer); return; }

        var name = String(t.file || fallbackName || "下载").split(/[\\/]/).pop();
        if (name.length > 46) name = name.slice(0, 43) + "…";
        var pct = Math.max(0, Math.min(100, Math.round(t.percent || 0)));
        var done = Number(t.done) || 0, total = Number(t.total) || 0;
        var now = Date.now();
        if (lastDone >= 0 && now > lastTs) {
          var inst = (done - lastDone) / ((now - lastTs) / 1000);
          speed = speed ? (speed * 0.6 + inst * 0.4) : inst;
        }
        lastDone = done; lastTs = now;

        var isDone = (t.state && String(t.state).indexOf("done") === 0) || (total > 0 && pct >= 100);
        var isErr = t.state && /失败|错误|fail|error/i.test(String(t.state));

        if (isDone) {
          clearInterval(timer);
          try { chrome.notifications.clear("pcl-" + id); } catch (e) {}
          notifyDone(name, fmtSize(total || done));
          return;
        }

        if (isErr) {
          clearInterval(timer);
          try {
            chrome.notifications.clear("pcl-" + id);
            chrome.notifications.create("pcl-err-" + id, {
              type: "basic", iconUrl: "icon128.png",
              title: "下载失败", message: name + "  ·  " + t.state,
              priority: 2
            }, function () {
              setTimeout(function () { try { chrome.notifications.clear("pcl-err-" + id); } catch (e) {} }, 6000);
            });
          } catch (e) {}
          return;
        }

        var active = (j.tasks || []).filter(function (x) { return x.state === "downloading"; }).length;
        var step = mode === "steps10" ? 10 : 25;
        var bucket = Math.floor(pct / step);
        if (active > 2) return;   // 多个任务并行时只保留完成通知
        if (mode !== "done" && bucket !== lastBucket) {
          lastBucket = bucket;
          lastPct = pct;
          var line = fmtSize(done) + " / " + fmtSize(total) + (speed > 0 ? ("  ·  " + fmtSize(speed) + "/s") : "") + "  ·  " + (t.threads || "?") + " 线程";
          try {
            chrome.notifications.create("pcl-" + id, {
              type: "basic",
              iconUrl: "icon128.png",
              title: "下载中  " + pct + "%",
              message: name,
              contextMessage: line,
              priority: 0,
              requireInteraction: false
            });
          } catch (e) {}
        }
      })
      .catch(function () { if (tries > 6) clearInterval(timer); });
  }, 700);
}

/* 下载接管：把浏览器下载转发给本地下载器（aria2 / qBittorrent） */

function getCfg() {
  return new Promise(function (res) {
    try {
      chrome.storage.local.get("spDownloader", function (r) {
        res((r && r.spDownloader) || { enabled: false, type: "aria2", endpoint: "http://127.0.0.1:6800/jsonrpc", token: "" });
      });
    } catch (e) { res({ enabled: false }); }
  });
}

function sendToAria2(cfg, url) {
  var body = { jsonrpc: "2.0", id: "sp", method: "aria2.addUri", params: [cfg.token ? ["token:" + cfg.token] : [], [url]] };
  return fetch(cfg.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(function (r) { return r.json(); });
}

function sendToPcl(cfg, url) {
  var base = "http://127.0.0.1:6806";   // 内置下载器固定端口
  var th = Math.max(1, Math.min(64, cfg.threads || 8));
  var dirPart = cfg.dir ? ("&dir=" + encodeURIComponent(cfg.dir)) : "";
  return fetch(base + "/add?url=" + encodeURIComponent(url) + "&threads=" + th + dirPart)
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.id) lastPclId = j.id; return j; });
}

function sendToQB(cfg, url) {
  return fetch(cfg.endpoint + "/api/v2/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "username=admin&password=" + encodeURIComponent(cfg.token || ""),
  }).then(function () {
    var fd = new FormData();
    fd.append("urls", url);
    return fetch(cfg.endpoint + "/api/v2/torrents/add", { method: "POST", body: fd });
  });
}

async function handleDownload(item, cfg) {
  var url = item.finalUrl || item.url || "";
  if (cfg.type === "pcl") { ensureNativeHost(); pushThreads(); pushDir(); }
  if (!url || url.indexOf("data:") === 0 || url.indexOf("blob:") === 0) return false;
  try {
    if (cfg.type === "pcl") await sendToPcl(cfg, url);
    else if (cfg.type === "qb") await sendToQB(cfg, url);
    else await sendToAria2(cfg, url);
    try { chrome.downloads.cancel(item.id); } catch (e) {}
    try { chrome.downloads.erase({ id: item.id }); } catch (e) {}
    console.log("[下载接管] 已转发:", url);
    var guessed = String(url).split("?")[0].split("/").pop();
    trackDownload(lastPclId, guessed, cfg.notify);
    return true;
  } catch (e) {
    console.warn("[下载接管] 转发失败，保留浏览器下载:", e && e.message);
    return false;
  }
}

var recentUrls = Object.create(null);
var recentStamps = [];
function urlThrottled(url) {
  var now = Date.now();
  var last = recentUrls[url];
  if (last && now - last < 8000) return true;         // 同一 URL 8 秒内只转发一次
  recentUrls[url] = now;
  recentStamps.push(now);
  while (recentStamps.length && now - recentStamps[0] > 5000) recentStamps.shift();
  if (recentStamps.length > 6) return true;            // 5 秒内超过 6 个，直接放行给浏览器
  return false;
}

chrome.downloads.onCreated.addListener(function (item) {
  try {
    if (!item || !item.id) return;
    if (item.state && item.state !== "in_progress") return;
    if (item.byExtensionId) return;                    // 扩展自己产生的下载不接管
  } catch (e) {}
  var u = item.finalUrl || item.url || "";
  getCfg().then(function (cfg) {
    if (!cfg || !cfg.enabled) return;
    if (u && urlThrottled(u)) { console.log("[下载接管] 限流跳过:", u.slice(0, 80)); return; }
    handleDownload(item, cfg);
  });
});

chrome.commands.onCommand.addListener(function (cmd) {
  function openFallbackTab() {
    try { chrome.tabs.create({ url: chrome.runtime.getURL("index.html") + "#menu" }); } catch (e) {}
  }
  if (cmd === "open-menu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var t = tabs && tabs[0];
      if (!t) return;
      var extBase = chrome.runtime.getURL("");
      function isOwnPage(u) {
        u = u || "";
        return u.indexOf(extBase) === 0 || /^(chrome|edge):\/\/newtab/i.test(u) || /^(chrome|edge):\/\/start/i.test(u);
      }
      function retryOwn(times) {
        chrome.tabs.sendMessage(t.id, { type: "sp-open-menu" }, function () {
          if (!chrome.runtime.lastError) return;
          if (times > 0) setTimeout(function () { retryOwn(times - 1); }, 700);
        });
      }
      // 1) 页面里已有菜单 → 直接显示
      chrome.tabs.sendMessage(t.id, { type: "sp-open-menu" }, function () {
        if (!chrome.runtime.lastError) return;
        // 2) 新标签页 / 自己页面：等加载完再试，绝不跳转
        if (isOwnPage(t.url) || isOwnPage(t.pendingUrl)) { retryOwn(3); return; }
        // 3) 普通网页：注入 menu.js，它注入后会自己弹出，不需要再发消息
        chrome.scripting.executeScript({ target: { tabId: t.id }, files: ["menu.js"] }, function () {
          // 注入失败（edge:// 等）就什么也不做，不新开标签
          void chrome.runtime.lastError;
        });
      });
    });
    return;
  }
  if (cmd !== "toggle-dock") return;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: "sp-toggle-dock" }, function () { void chrome.runtime.lastError; });
  });
});
// 供内容脚本（全局 Dock / 菜单）读取收藏夹
try {
  chrome.runtime.onMessage.addListener(function (m, sender, sendResponse) {
    if (!m || m.type !== "sp-get-bookmarks") return;
    try {
      chrome.bookmarks.getTree(function (tree) {
        var out = [];
        function walk(n, path) {
          if (!n) return;
          if (n.url && /^https?:/i.test(n.url)) { out.push({ name: (n.title || "").trim().slice(0, 60), url: n.url, dir: path.length ? path.join(" / ") : "收藏夹栏" }); return; }
          var p = path;
          if (n.id === "1") p = ["收藏夹栏"];
          else if (n.id === "2") p = ["其他收藏夹"];
          else if (n.title) p = path.concat(n.title);
          (n.children || []).forEach(function (c) { walk(c, p); });
        }
        ((tree && tree[0] && tree[0].children) || []).forEach(function (c) { walk(c, []); });
        sendResponse({ ok: true, items: out.slice(0, 500) });
      });
    } catch (e) { sendResponse({ ok: false, error: String(e), items: [] }); }
    return true;
  });
} catch (e) {}

// 供内容脚本批量取收藏图标（走浏览器图标缓存，转成 dataURL）
try {
  chrome.runtime.onMessage.addListener(function (m, sender, sendResponse) {
    if (!m || m.type !== "sp-icons" || !m.urls) return;
    var urls = m.urls.slice(0, 80);
    var out = {}, left = urls.length;
    if (!left) { sendResponse({ icons: out }); return true; }
    urls.forEach(function (u) {
      var fu = chrome.runtime.getURL("/_favicon/?pageUrl=" + encodeURIComponent(u) + "&size=32");
      fetch(fu).then(function (r) { return r.ok ? r.blob() : Promise.reject(); }).then(function (b) {
        return b.arrayBuffer().then(function (buf) {
          var bytes = new Uint8Array(buf), bin = "";
          for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          out[u] = "data:" + (b.type || "image/png") + ";base64," + btoa(bin);
        });
      }).catch(function () {}).then(function () {
        if (--left === 0) sendResponse({ icons: out });
      });
    });
    return true;
  });
} catch (e) {}
