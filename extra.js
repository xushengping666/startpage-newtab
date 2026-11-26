
(function () {
  var SP = window.__sp;
  if (!SP) return;
  var S = SP.S;
  var $ = function (id) { return document.getElementById(id); };

  var D = {
    overlay: 18, bgBlur: 0, glass: 15,
    showSeconds: true, blinkColon: true, showLunar: true,
    showWeather: true, city: "", wcache: null, fgWeather: "", memSave: true, glassMode: "blur", searchStyle: "glass", searchBorder: 2, searchWeight: 400, globalDock: true, globalDockCount: 8, dockHandle: true, dlEnabled: false, dlType: "pcl", dlDir: "", dlFollowBrowser: true, dlThreads: 8, dlEndpoint: "http://127.0.0.1:6800/jsonrpc", dlToken: "",
    showNotes: true, notes: "", notesPinned: false,
    ctxMenu: true, prefix: true, hotkeys: true, intro: true, dockLimit: 11, dockMenu: true, menuLinks: [],
    slideshow: false, slideSec: 60,
    freeLayout: false, layout: {}
  };
  function ensureDefaults() {
    Object.keys(D).forEach(function (k) { if (S[k] === undefined) S[k] = D[k]; });
  }
  ensureDefaults();
  SP.save();

  var syncers = [];
  function persist() {
    SP.save();
    try { SP.syncGlobalDock && SP.syncGlobalDock(); } catch (e) {}
  }
  var DEFAULT_EP = {
    pcl: "http://127.0.0.1:6806",
    aria2: "http://127.0.0.1:6800/jsonrpc",
    qb: "http://127.0.0.1:8080"
  };
  function syncDlEndpoint() {
    var ep = DEFAULT_EP[S.dlType] || DEFAULT_EP.aria2;
    S.dlEndpoint = ep;
    persist();
    try {
      var inputs = document.querySelectorAll(".panel input.txt");
      Array.prototype.forEach.call(inputs, function (el) {
        if ((el.value || "").indexOf("http") === 0) el.value = ep;
      });
    } catch (e) {}
  }

  function onChange(key) {
    if (key === "dlType") { syncDlEndpoint(); try { window.__spApplyDlType && window.__spApplyDlType(); } catch (e) {} }
    applyVars();
    if (key === "showWeather" || key === "city") loadWeather(true);
    if (key === "showNotes") renderNotes();
    if (key === "showSeconds" || key === "blinkColon" || key === "showLunar") SP.paintClock();
    if (key === "slideshow" || key === "slideSec") startSlideshow();
    if (key === "dockLimit" || key === "dockMenu") applyOverflow();
  }

  /* ---------------- 变量 ---------------- */
  function hexLum(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return 1;
    var r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  var body = document.body;
  function applyVars() {
    var r = document.documentElement.style;
    r.setProperty("--overlay", String(S.overlay / 100));
    r.setProperty("--bg-blur", S.bgBlur + "px");
    r.setProperty("--glass", S.glass + "px");
    if (S.fgWeather) {
      r.setProperty("--fg-weather", S.fgWeather);
      r.setProperty("--fg-weather-shadow", hexLum(S.fgWeather) > 0.6
        ? "0 2px 14px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.35)"
        : "0 2px 16px rgba(255,255,255,.85), 0 1px 3px rgba(255,255,255,.6)");
      body.classList.add("weather-fg");
    } else {
      r.removeProperty("--fg-weather");
      r.removeProperty("--fg-weather-shadow");
      body.classList.remove("weather-fg");
    }
    body.classList.toggle("glass-flat", S.glassMode === "flat");
    body.classList.toggle("search-outline", S.searchStyle === "outline");
    body.classList.toggle("notes-pinned", !!S.notesPinned);
    var pinBtn = $("notePin");
    if (pinBtn) {
      pinBtn.classList.toggle("on", !!S.notesPinned);
      pinBtn.title = S.notesPinned ? "已固定置顶（点击取消）" : "固定置顶";
    }
    r.setProperty("--search-bw", (parseInt(S.searchBorder, 10) || 2) + "px");
    r.setProperty("--search-fw", String(S.searchWeight || 400));
    body.classList.toggle("bg-blur", (S.bgBlur || 0) > 0);
    var pn = document.querySelector(".panel");
    if (pn) { pn.style.backdropFilter = "blur(" + S.glass + "px) saturate(150%)"; pn.style.webkitBackdropFilter = "blur(" + S.glass + "px) saturate(150%)"; }
    document.body.classList.toggle("layout-edit", !!S.freeLayout);
    if (S.intro && !body.__introDone) {
      body.classList.add("intro");
      body.__introDone = true;
      setTimeout(function () { body.classList.remove("intro"); }, 1500);
    } else {
      body.classList.remove("intro");
    }
    applyLayout();
    renderNotes();
    syncTimers();
  }

  /* ---------------- 布局拖动 ---------------- */
  var nodes = {
    search: function () { return document.querySelector(".searchwrap"); },
    clock: function () { return document.querySelector(".center"); },   // 时钟+日期+天气 整块
    notes: function () { return $("notes"); }
  };
  function applyLayout() {
    var wEl = $("weather");
    if (wEl) { wEl.style.position = ""; wEl.style.left = ""; wEl.style.top = ""; wEl.style.transform = ""; wEl.style.zIndex = ""; }
    if (S.layout && S.layout.weather) { delete S.layout.weather; persist(); }
    Object.keys(nodes).forEach(function (k) {
      var el = nodes[k]();
      if (!el) return;
      var p = S.layout && S.layout[k];
      // 便签：没有手动摆放时，默认放在右侧垂直居中（与左侧唱片对称）
      if (!p && k === "notes" && !S.freeLayout) p = { x: 90, y: 50 };
      if ((S.freeLayout || k === "notes") && p) {
        el.style.position = "absolute";
        el.style.left = p.x + "%";
        el.style.top = p.y + "%";
        el.style.transform = "translate(-50%,-50%)";
        el.style.zIndex = "4";
      } else {
        el.style.position = ""; el.style.left = ""; el.style.top = "";
        el.style.transform = ""; el.style.zIndex = "";
      }
    });
  }
  function enableDrag() {
    Object.keys(nodes).forEach(function (k) {
      var el = nodes[k]();
      if (!el || el.__dragOn) return;
      el.__dragOn = true;
      el.addEventListener("pointerdown", function (ev) {
        var isNote = (k === "notes");
        if (isNote && S.notesPinned) {
          if (!window.__pinHinted) {
            window.__pinHinted = true;
            setTimeout(function () { window.__pinHinted = false; }, 2500);
            SP.toast("便签已固定，先点 📌 解锁才能移动");
          }
          return;
        }
        if (!S.freeLayout && !isNote) return;
        if (ev.target.closest && ev.target.closest("button,a")) return;
        if (ev.target.closest && ev.target.closest("input,textarea")) {
          if (!S.freeLayout) return;      // 普通模式：只有标题栏能拖
        }
        var rect = el.getBoundingClientRect();
        var sx = ev.clientX, sy = ev.clientY, moved = false;
        function move(e2) {
          if (!moved && Math.abs(e2.clientX - sx) < 6 && Math.abs(e2.clientY - sy) < 6) return;
          moved = true;
          var vw = window.innerWidth, vh = window.innerHeight;
          var cx = rect.left + rect.width / 2 + (e2.clientX - sx);
          var cy = rect.top + rect.height / 2 + (e2.clientY - sy);
          var x = cx / vw * 100;
          var y = cy / vh * 100;
          x = Math.max(5, Math.min(95, x)); y = Math.max(5, Math.min(95, y));
          S.layout = S.layout || {};
          S.layout[k] = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
          applyLayout();
        }
        function up() {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          if (moved) persist();
        }
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      });
    });
  }

  /* ---------------- 控件 ---------------- */
  function mkRow(label) {
    var row = document.createElement("div"); row.className = "row";
    var lab = document.createElement("span"); lab.className = "lab"; lab.textContent = label;
    row.appendChild(lab);
    for (var i = 1; i < arguments.length; i++) row.appendChild(arguments[i]);
    return row;
  }
  function mkToggle(key, text) {
    var b = document.createElement("button");
    b.textContent = text;
    var sync = function () { b.classList.toggle("on", !!S[key]); };
    b.onclick = function () { S[key] = !S[key]; persist(); sync(); onChange(key); };
    sync(); syncers.push(sync);
    return b;
  }
  function mkRange(key, min, max, suffix, w) {
    var wrap = document.createElement("span");
    wrap.style.cssText = "display:inline-flex;align-items:center;gap:8px;flex:1;max-width:300px";
    var r = document.createElement("input");
    r.type = "range"; r.min = min; r.max = max; r.step = 1; r.value = S[key];
    r.style.cssText = "flex:1;accent-color:#2f6fed;cursor:pointer;max-width:" + (w || 200) + "px";
    var v = document.createElement("span");
    v.style.cssText = "font-size:12.5px;color:#8d96a5;width:52px;text-align:right";
    var sync = function () { r.value = S[key]; v.textContent = S[key] + suffix; };
    r.addEventListener("input", function () { S[key] = parseInt(r.value, 10); v.textContent = S[key] + suffix; applyVars(); });
    r.addEventListener("change", function () { persist(); onChange(key); });
    sync(); syncers.push(sync);
    wrap.appendChild(r); wrap.appendChild(v);
    return wrap;
  }

  function mkChoice(key, opts) {
    var wrap = document.createElement("span");
    wrap.style.cssText = "display:inline-flex;gap:6px";
    var btns = [];
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o[1];
      b.onclick = function () { S[key] = o[0]; persist(); btns.forEach(function (x, i) { x.classList.toggle("on", opts[i][0] === S[key]); }); applyVars(); };
      btns.push(b);
      wrap.appendChild(b);
    });
    var sync = function () { btns.forEach(function (x, i) { x.classList.toggle("on", opts[i][0] === S[key]); }); };
    sync(); syncers.push(sync);
    return wrap;
  }

  function mkColor(key, label) {
    var wrap = document.createElement("span");
    wrap.style.cssText = "display:inline-flex;align-items:center;gap:6px";
    var inp = document.createElement("input");
    inp.type = "color"; inp.value = S[key] || "#ffffff";
    inp.title = label;
    inp.style.cssText = "width:38px;height:26px;padding:0;border:1px solid #3c4655;border-radius:7px;background:none;cursor:pointer";
    var auto = document.createElement("button");
    auto.textContent = "自动";
    var sync = function () {
      if (S[key]) inp.value = S[key];
      auto.classList.toggle("on", !S[key]);
    };
    inp.addEventListener("input", function () { S[key] = inp.value; persist(); applyVars(); });
    inp.addEventListener("change", function () { persist(); applyVars(); });
    auto.onclick = function () { S[key] = ""; persist(); applyVars(); sync(); };
    sync(); syncers.push(sync);
    wrap.appendChild(inp); wrap.appendChild(auto);
    return wrap;
  }

  /* ---------------- 天气 ---------------- */
  var WCODE = { 0:"晴",1:"大部晴",2:"多云",3:"阴",45:"雾",48:"雾凇",51:"毛毛雨",53:"毛毛雨",55:"毛毛雨",56:"冻雨",57:"冻雨",61:"小雨",63:"中雨",65:"大雨",66:"冻雨",67:"冻雨",71:"小雪",73:"中雪",75:"大雪",77:"雪粒",80:"阵雨",81:"阵雨",82:"强阵雨",85:"阵雪",86:"阵雪",95:"雷阵雨",96:"雷阵雨",99:"雷阵雨" };
  function wText(c) { return WCODE[c] || "天气"; }

  var wRetry = 0, wTimer = null, wSeq = 0;
  function wFetch(url) {
    var ctl = null, t = null;
    try {
      ctl = new AbortController();
      t = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 8000);
    } catch (e) {}
    return fetch(url, ctl ? { signal: ctl.signal } : undefined)
      .then(function (r) { if (!r.ok) throw new Error("http" + r.status); return r.json(); })
      .finally(function () { if (t) clearTimeout(t); });
  }
  function wFail() {
    var box = $("weather");
    // 有旧数据就先显示旧的，避免整块消失
    if (S.wcache && S.wcache.d) { renderWeather(S.wcache.d); }
    else if (box) { box.classList.remove("on"); }
    wRetry++;
    if (wRetry > 6) wRetry = 6;
    var delay = [4000, 12000, 30000, 120000, 300000, 600000][Math.min(wRetry - 1, 5)];
    clearTimeout(wTimer);
    wTimer = setTimeout(function () { if (!document.hidden) loadWeather(true); }, delay);
  }
  function loadWeather(force) {
    var box = $("weather");
    if (!box) return;
    if (!S.showWeather || !S.city) { box.classList.remove("on"); clearTimeout(wTimer); return; }
    // 缓存新鲜就直接用
    if (!force && S.wcache && S.wcache.d && Date.now() - S.wcache.t < 1800000) { renderWeather(S.wcache.d); return; }
    // 缓存过期但存在 → 先把旧的显示出来，再后台刷新
    if (S.wcache && S.wcache.d) renderWeather(S.wcache.d);
    var mySeq = ++wSeq;
    wFetch("https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&format=json&name=" + encodeURIComponent(S.city))
      .then(function (g) {
        var it = g.results && g.results[0];
        if (!it) throw new Error("city-not-found");
        return wFetch("https://api.open-meteo.com/v1/forecast?latitude=" + it.latitude + "&longitude=" + it.longitude +
          "&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3");
      })
      .then(function (d) {
        if (mySeq !== wSeq) return;                 // 期间又换了城市 → 丢弃旧结果
        if (!d || !d.current) throw new Error("bad-data");
        S.wcache = { t: Date.now(), d: d };
        wRetry = 0;
        persist();
        renderWeather(d);
      })
      .catch(function () { if (mySeq === wSeq) wFail(); });
  }
  function renderWeather(d) {
    var box = $("weather");
    if (!box || !d || !d.current) return;
    var cur = d.current;
    box.innerHTML =
      '<div class="w-main">' + Math.round(cur.temperature_2m) + '° <span style="font-size:15px;opacity:.85">' + wText(cur.weather_code) + '</span></div>' +
      '<div class="w-city">' + (S.city || "") + '</div>' +
      '<div class="w-days">' + (d.daily.time || []).map(function (t, i) {
        var wd = ["日","一","二","三","四","五","六"][new Date(t).getDay()];
        return '<span>周' + wd + ' ' + Math.round(d.daily.temperature_2m_max[i]) + '°/' + Math.round(d.daily.temperature_2m_min[i]) + '°</span>';
      }).join("") + '</div>';
    box.classList.add("on");
  }

  /* ---------------- 便签 ---------------- */
  var noteTimer = null;
  function renderNotes() {
    var box = $("notes");
    if (!box) return;
    box.classList.toggle("on", !!S.showNotes);
    var ta = $("noteBox");
    if (ta && ta.value !== S.notes) ta.value = S.notes || "";
  }
  function bindPin() {
    var b = $("notePin");
    if (!b) return;
    b.onclick = function (e) {
      e.stopPropagation();
      S.notesPinned = !S.notesPinned;
      persist();
      applyVars();
      SP.toast(S.notesPinned ? "便签已固定：始终置顶显示" : "便签已取消固定");
    };
  }

  function bindNotes() {
    var ta = $("noteBox");
    if (!ta) return;
    ta.addEventListener("input", function () {
      S.notes = ta.value;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(persist, 400);
    });
  }

  /* ---------------- 右键菜单 ---------------- */
  function bindCtx() {
    var dock = $("dock"), menu = $("ctxmenu");
    if (!dock || !menu) return;
    var curIdx = -1;
    dock.addEventListener("contextmenu", function (ev) {
      if (!S.ctxMenu) return;
      var a = ev.target.closest(".tile");
      if (!a) return;
      ev.preventDefault();
      var tiles = Array.prototype.slice.call(dock.querySelectorAll(".tile"));
      curIdx = tiles.indexOf(a);
      if (curIdx < 0 || curIdx >= S.shortcuts.length) return;
      var it = S.shortcuts[curIdx];
      menu.innerHTML = "";
      var items = [
        ["打开 " + it.name, function () { location.href = it.url; }],
        ["复制链接", function () { navigator.clipboard.writeText(it.url).then(function () { SP.toast("已复制"); }); }],
        ["放入首位菜单", function () { addToMenu(it.name, it.url); }],
        ["置顶", function () { moveTo(curIdx, 0); }],
        ["上移", function () { moveTo(curIdx, curIdx - 1); }],
        ["下移", function () { moveTo(curIdx, curIdx + 1); }],
        ["换个图标", function () { SP.openPanel(); setTimeout(function () { SP.pickIcon(curIdx); }, 120); }],
        ["删除", function () { S.shortcuts.splice(curIdx, 1); persist(); SP.paintDock(); }, true]
      ];
      items.forEach(function (it2) {
        var b = document.createElement("button");
        b.textContent = it2[0];
        if (it2[2]) b.className = "danger";
        b.onclick = function () { menu.classList.remove("on"); it2[1](); };
        menu.appendChild(b);
      });
      menu.style.left = Math.min(ev.clientX, window.innerWidth - 190) + "px";
      menu.style.top = Math.min(ev.clientY, window.innerHeight - 260) + "px";
      menu.classList.add("on");
    });
    document.addEventListener("pointerdown", function (e) {
      if (!menu.contains(e.target)) menu.classList.remove("on");
    }, true);
  }
  function moveTo(from, to) {
    if (to < 0 || to >= S.shortcuts.length) return;
    var it = S.shortcuts.splice(from, 1)[0];
    S.shortcuts.splice(to, 0, it);
    persist(); SP.paintDock();
  }

  /* ---------------- 快捷键 ---------------- */
  function bindKeys() {
    document.addEventListener("keydown", function (e) {
      if (!S.hotkeys) return;
      var tag = (e.target.tagName || "").toLowerCase();
      var typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var panelOpen = document.getElementById("mask").classList.contains("on");
      if (e.key === "/" && !typing && !panelOpen) { e.preventDefault(); $("q").focus(); return; }
      if (e.key === "Escape") {
        if (document.getElementById("mask").classList.contains("on")) { $("close").click(); return; }
        var q = $("q"); q.value = ""; q.blur(); return;
      }
      if (!typing && !panelOpen && /^[1-9]$/.test(e.key)) {
        var i = parseInt(e.key, 10) - 1;
        if (S.shortcuts[i]) { e.preventDefault(); location.href = S.shortcuts[i].url; }
      }
    });
  }

  /* ---------------- 搜索前缀 ---------------- */
  var PMAP = { g: "google", gg: "google", b: "bing", bd: "baidu", z: "zhihu", tb: "taobao", gh: "github" };
  function bindPrefix() {
    var sf = $("sf");
    if (!sf) return;
    sf.addEventListener("submit", function (e) {
      if (!S.prefix) return;
      var q = $("q");
      var m = /^!([a-z]{1,3})\s+([\s\S]+)$/i.exec(q.value.trim());
      if (!m) return;
      var eng = PMAP[m[1].toLowerCase()];
      if (!eng || !SP.ENG[eng]) { e.preventDefault(); e.stopPropagation(); SP.toast("未知前缀 !" + m[1]); return; }
      var prev = S.engine;
      S.engine = eng;
      q.value = m[2];
      setTimeout(function () { S.engine = prev; persist(); }, 0);
    }, true);
  }

  /* ---------------- 壁纸轮播 ---------------- */
  var slideTimer = null;
  function listOf() { return S._plMeta || []; }
  function savePlaylist(v) {
    S._plMeta = v.map(function () { return 1; });
    v.forEach(function (data, i) { SP.idbPut("pl:" + i, data); });
    SP.idbPut("plCount", v.length);
  }
  function loadPlaylist() {
    SP.idbGet("playlist").then(function (v) {
      if (Array.isArray(v)) { savePlaylist(v); startSlideshow(); }
    }, function () {});
  }
  function startSlideshow() {
    clearInterval(slideTimer);
    if (!S.slideshow || !listOf().length) return;
    if (listOf().length === 1) {                 // 只有一张：直接设为壁纸，不轮换
      SP.idbGet("pl:0").then(function (data) {
        if (!data) return;
        S.slideIdx = 0; S.img = data; S.bgMode = "image"; persist(); SP.applyBackground();
      }, function () {});
      return;
    }
    slideTimer = setInterval(function () {
      if (document.hidden) return;
      var list = listOf();
      if (list.length < 2) return;
      var n = list.length;
      S.slideIdx = ((S.slideIdx || 0) + 1) % n;
      SP.idbGet("pl:" + S.slideIdx).then(function (data) {
        if (!data) return;
        S.img = data;
        S.bgMode = "image";
        persist(); SP.applyBackground();
        data = null;
      }, function () {});
    }, Math.max(10, S.slideSec || 60) * 1000);
  }
  function addToPlaylist(f) {
    var r = new FileReader();
    r.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        var max = 2560, sc = Math.min(1, max / Math.max(img.width, img.height));
        var cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        var idx = listOf().length;
        SP.idbPut("pl:" + idx, cv.toDataURL("image/jpeg", 0.86));
        var arr = listOf().slice();
        arr.push(1);
        savePlaylist(arr);
        startSlideshow();
        SP.toast("已加入轮播（共 " + arr.length + " 张）");
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(f);
  }

  /* ---------------- 书签导入 ---------------- */
  function importBookmarks() {
    if (!(window.chrome && chrome.bookmarks)) { SP.toast("只在扩展模式下可用"); return; }
    chrome.bookmarks.getTree(function (tree) {
      var bar = tree[0].children && tree[0].children[0];
      var list = (bar && bar.children || []).filter(function (n) { return n.url; }).slice(0, 12);
      if (!list.length) { SP.toast("书签栏是空的"); return; }
      var added = 0;
      list.forEach(function (n) {
        if (S.shortcuts.some(function (s) { return s.url === n.url; })) return;
        S.shortcuts.push({ name: (n.title || "书签").slice(0, 10), url: n.url });
        added++;
      });
      persist(); SP.paintDock(); SP.openPanel();
      SP.toast(added ? "已导入 " + added + " 个书签" : "这些书签都已存在");
    });
  }

  /* ---------------- Dock 密度 ---------------- */
  function updateDockDensity() {
    var dock = $("dock");
    if (!dock) return;
    var n = dock.querySelectorAll(".tile:not(.dock-hidden)").length;
    var dense = n > 12;
    if (document.body.classList.contains("dock-dense") !== dense) {
      document.body.classList.toggle("dock-dense", dense);
    }
  }
  function watchDock() {
    var dock = $("dock");
    if (!dock) return;
    updateDockDensity();
    if (window.MutationObserver) {
      new MutationObserver(updateDockDensity).observe(dock, { childList: true });
    }
  }

  /* ---------------- 省内存：后台释放视频（状态机 + 令牌） ---------------- */
  var memState = "idle";        // idle | snapshot | restoring
  var memToken = 0;
  var memTimer = null;
  var resumeAt = 0;
  var snapActive = false;

  function grabFrame() {
    var v = $("bgvideo");
    if (!v || v.readyState < 2 || !v.videoWidth) return null;
    try {
      var w = 1280, h = Math.round(v.videoHeight * (w / v.videoWidth));
      var cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(v, 0, 0, w, h);
      return cv.toDataURL("image/jpeg", 0.82);
    } catch (err) { return null; }
  }
  function setSnapshot(data) {
    var im = $("bgimg");
    if (!im || !data) return false;
    im.src = data;
    im.style.display = "block";
    snapActive = true;
    return true;
  }
  function clearSnapshot() {
    var im = $("bgimg");
    if (im) { im.removeAttribute("src"); im.style.display = "none"; }
    snapActive = false;
  }

  function releaseVideo() {
    if (!S.memSave || S.bgMode !== "video") return;
    if (memState === "snapshot") return;
    var v = $("bgvideo");
    if (!v || !v.getAttribute("src")) return;
    memToken++;                       // 作废所有进行中的回调
    var data = grabFrame();
    if (!data) {                      // 抓不到帧 → 只暂停，绝不黑屏
      try { v.pause(); } catch (err) {}
      return;
    }
    resumeAt = v.currentTime || 0;
    setSnapshot(data);
    try { v.pause(); v.removeAttribute("src"); v.load(); } catch (err) {}
    memState = "snapshot";
  }

  function restoreVideo() {
    memToken++;
    var token = memToken;
    clearTimeout(memTimer);
    var v = $("bgvideo");
    if (!v || S.bgMode !== "video") { clearSnapshot(); memState = "idle"; return; }
    if (memState === "idle" && v.getAttribute("src")) {
      clearSnapshot();
      if (v.paused && !vidUserPaused) {
        var pp = v.play(); if (pp && pp.catch) pp.catch(function () {});
      }
      return;                      // 不重建，避免重设 src 造成的卡顿
    }

    var t = resumeAt || 0;
    memState = "restoring";
    SP.applyBackground();             // 重新挂上视频源
    if (snapActive) v.style.visibility = "hidden";

    var finished = false;
    function finish(force) {
      if (finished) return;
      if (token !== memToken) return; // 已被新的切换取代
      if (!force && v.readyState < 2) return; // 还没就绪，等事件或兜底
      finished = true;
      clearTimeout(memTimer);
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("canplay", onReady);
      try { if (t > 0.2 && Math.abs(v.currentTime - t) > 0.25) v.currentTime = t; } catch (err) {}
      v.style.visibility = "";
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      clearSnapshot();
      memState = "idle";
    }
    function onReady() { finish(false); }
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("canplay", onReady);
    memTimer = setTimeout(function () { finish(true); }, 1600);
  }

  var memBlurTimer = null;
  var memFocusTimer = null;
  function onLeave() {
    clearTimeout(memFocusTimer);
    clearTimeout(memBlurTimer);
    memBlurTimer = setTimeout(releaseVideo, 700);
  }
  function onBack() {
    clearTimeout(memBlurTimer);
    clearTimeout(memFocusTimer);
    memFocusTimer = setTimeout(restoreVideo, 120);
  }
  var tWeather = null, tWatchdog = null, tTheme = null, tFocus = null;

  function themePoll() {
    if ((S.theme || "auto") !== "system") return;
    try {
      var sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (sysDark !== lastSysDark) { lastSysDark = sysDark; SP.applyTheme(); }
    } catch (e) {}
  }

  function memWatchdog() {
    if (document.hidden || !S.memSave || S.bgMode !== "video") return;
    var v = $("bgvideo");
    if (!v) return;
    if (v.style.visibility === "hidden" && memState !== "restoring") v.style.visibility = "";
    if (memState === "snapshot" && !document.hidden) restoreVideo();
    if (memState === "idle" && v.getAttribute("src") && v.paused && !vidUserPaused) {
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  var autoPaused = false;
  // 只用「完全不可见」判断（Chrome/Edge 的原生遮挡检测会置 document.hidden）
  function isFullyHidden() {
    if (document.hidden || document.visibilityState === "hidden") return true;
    try { if (window.outerWidth === 0 || window.outerHeight === 0) return true; } catch (e) {}
    return false;
  }
  var hiddenSince = 0;
  function focusGuard() {
    if (S.bgMode !== "video") return;
    var v = $("bgvideo");
    if (!v || !v.getAttribute("src")) return;
    if (isFullyHidden()) {
      if (!hiddenSince) hiddenSince = Date.now();
      if (Date.now() - hiddenSince >= 1500 && !v.paused) {   // 持续不可见才暂停
        autoPaused = true; try { v.pause(); } catch (e) {}
      }
    } else {
      hiddenSince = 0;
      if (autoPaused && v.paused && memState !== "snapshot") {
        autoPaused = false;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    }
  }

  function syncTimers() {
    var needW = !!(S.showWeather && S.city);
    if (needW && !tWeather) tWeather = setInterval(function () { if (!document.hidden) loadWeather(false); }, 1800000);
    if (!needW && tWeather) { clearInterval(tWeather); tWeather = null; }

    var needD = !!(S.memSave && S.bgMode === "video");
    if (needD && !tWatchdog) tWatchdog = setInterval(memWatchdog, 4000);
    if (!needD && tWatchdog) { clearInterval(tWatchdog); tWatchdog = null; }

    var needF = (S.bgMode === "video");
    if (needF && !tFocus) tFocus = setInterval(focusGuard, 1500);
    if (!needF && tFocus) { clearInterval(tFocus); tFocus = null; }

    var needT = (S.theme || "auto") === "system";
    if (needT && !tTheme) tTheme = setInterval(themePoll, 3000);
    if (!needT && tTheme) { clearInterval(tTheme); tTheme = null; }
  }

  function bindMemory() {
    var hideCheck = null;
    function delayedLeave() {
      if (hideCheck) return;
      hideCheck = setTimeout(function () {
        hideCheck = null;
        if (isFullyHidden()) onLeave();
      }, 1500);                       // 必须持续不可见 1.5s 才真的暂停/释放
    }
    function cancelLeave() {
      if (hideCheck) { clearTimeout(hideCheck); hideCheck = null; }
    }
    document.addEventListener("visibilitychange", function () {
      if (isFullyHidden()) delayedLeave();
      else { cancelLeave(); onBack(); }
    });
    // 失焦本身不暂停（遮挡类应用/悬浮栏会造成瞬时 blur）
    window.addEventListener("blur", function () {
      if (isFullyHidden()) delayedLeave();
    });
    window.addEventListener("focus", function () { cancelLeave(); onBack(); });

  }
  var vidUserPaused = false;
  var lastSysDark = null;

  /* ---------------- Dock 首位菜单 ---------------- */
  var applying = false;
  function dockLimit() {
    return Math.max(4, Math.min(24, parseInt(S.dockLimit, 10) || 11));
  }
  function addToMenu(name, url) {
    S.menuLinks = S.menuLinks || [];
    for (var i = 0; i < S.menuLinks.length; i++) {
      if (S.menuLinks[i].url === url) { SP.toast("已在菜单里：" + name); return false; }
    }
    S.menuLinks.push({ name: name, url: url });
    persist(); applyOverflow();
    SP.toast("已放入菜单：" + name);
    return true;
  }

  var HD_CANDS = ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/favicon.ico"];
  function hdKey(url) { try { return "hi:" + new URL(url).hostname; } catch (e) { return ""; } }
  function blobToDataUrl(b) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = rej;
      fr.readAsDataURL(b);
    });
  }
  function fetchWithTimeout(u, ms) {
    return new Promise(function (res, rej) {
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; rej(new Error("timeout")); } }, ms);
      fetch(u, { cache: "force-cache", credentials: "omit" }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.blob();
      }).then(function (b) {
        if (done) return;
        done = true; clearTimeout(timer); res(b);
      }, function (e) {
        if (done) return;
        done = true; clearTimeout(timer); rej(e);
      });
    });
  }
  function upgradeIcon(img, url) {
    var key = hdKey(url);
    if (!key) return;
    var apply = function (dataUrl) {
      if (!dataUrl) return;
      var probe = new Image();
      probe.onload = function () { if (probe.naturalWidth > (img.naturalWidth || 0)) img.src = dataUrl; };
      probe.src = dataUrl;
    };
    SP.idbGet(key).then(function (cached) { if (cached) { apply(cached); return; } }, function () {});
    (function tryNext(i) {
      if (i >= HD_CANDS.length) return;
      var host = key.slice(3);
      fetchWithTimeout("https://" + host + HD_CANDS[i], 1600).then(blobToDataUrl).then(function (dataUrl) {
        if (!dataUrl) throw new Error("empty");
        SP.idbPut(key, dataUrl);
        apply(dataUrl);
      }).catch(function () { tryNext(i + 1); });
    })(0);
  }

  function iconFor(url) {
    for (var i = 0; i < (S.shortcuts || []).length; i++) {
      if (S.shortcuts[i].url === url && S.shortcuts[i].icon) return S.shortcuts[i].icon;
    }
    // 优先用浏览器自带的收藏夹图标缓存（需要 favicon 权限）
    try {
      if (window.chrome && chrome.runtime && chrome.runtime.getURL && /^https?:/i.test(url)) {
        return chrome.runtime.getURL("/_favicon/?pageUrl=" + encodeURIComponent(url) + "&size=128");
      }
    } catch (e) {}
    var h = SP.hostOf(url);
    return h ? ("https://" + h + "/favicon.ico") : "";
  }

  var dockMO = null;
  function syncIntroDelay() {
    var dock = $("dock");
    if (!dock) return;
    var n = dock.querySelectorAll(".tile").length;
    var add = dock.querySelector(".addbtn");
    if (add) add.style.animationDelay = (n * 0.07).toFixed(3) + "s";
    var more = dock.querySelector(".morebtn");
    if (more) more.style.animationDelay = "0s";
  }
  function applyOverflow() {
    var dock = $("dock");
    if (!dock) return;
    var tiles = [].slice.call(dock.querySelectorAll(".tile"));
    var lim = dockLimit();
    var over = tiles.length > lim;
    var needMenu = !!S.dockMenu || over;
    syncIntroDelay();
    var btn = dock.querySelector(".morebtn");

    var hiddenOk = tiles.every(function (t, i) {
      return t.classList.contains("dock-hidden") === (over && i >= lim);
    });
    // 状态没变就不动 DOM，避免自身触发 MutationObserver 造成重建循环
    if (needMenu && btn && hiddenOk && btn.__lim === lim && btn.__over === over) {
      updateDockDensity();
      return;
    }

    if (dockMO) dockMO.disconnect();
    tiles.forEach(function (t, i) { t.classList.toggle("dock-hidden", over && i >= lim); });
    if (btn) btn.remove();
    if (needMenu) {
      var b = document.createElement("div");
      b.className = "morebtn";
      b.textContent = "";
      b.title = S.dockMenu ? "菜单" : ("还有 " + (tiles.length - lim) + " 个");
      b.__lim = lim;
      b.__over = over;
      b.onclick = function (ev) { ev.stopPropagation(); openAppMenu(); };
      dock.insertBefore(b, dock.firstChild);
    }
    updateDockDensity();
    if (dockMO) dockMO.observe(dock, { childList: true });
  }

  function amItem(name, url, icon) {
    var a = document.createElement("a");
    a.className = "am-item";
    a.href = url;
    a.title = name + "  " + url;
    if (icon) {
      var im = document.createElement("img");
      im.src = icon;
      im.onerror = function () { var d = document.createElement("div"); d.className = "ph"; d.textContent = (name || "?").slice(0, 1); this.replaceWith(d); };
      im.onload = function () { try { if (im.naturalWidth && im.naturalWidth < 64) upgradeIcon(im, url); } catch (e) {} };
      a.appendChild(im);
    } else {
      var ph = document.createElement("div");
      ph.className = "ph";
      ph.textContent = (name || "?").slice(0, 1);
      a.appendChild(ph);
    }
    var sp = document.createElement("span");
    sp.textContent = name;
    a.appendChild(sp);
    return a;
  }

  function fillGrid(gridEl, list, iconOf) {
    gridEl.innerHTML = "";
    list.forEach(function (it, idx) {
      var node = amItem(it.name, it.url, iconOf ? iconOf(it) : "");
      node.dataset.url = it.url;
      node.style.setProperty("--i", idx);
      gridEl.appendChild(node);
    });
    if (!list.length) {
      var d = document.createElement("div");
      d.className = "am-empty";
      d.textContent = "（空）用右键「放入首位菜单」或设置里添加";
      gridEl.appendChild(d);
    }
  }

  var bmInited = false;
  function normU(u) { try { var x = new URL(u); return (x.origin + x.pathname.replace(/\/$/, "") + x.search).toLowerCase(); } catch (e) { return String(u || "").toLowerCase(); } }
  function hasUrl(u) {
    var k = normU(u);
    return (S.shortcuts || []).some(function (s) { return normU(s.url) === k; });
  }
  function hasMenuUrl(u) {
    var k = normU(u);
    return (S.menuLinks || []).some(function (s) { return normU(s.url) === k; });
  }
  function showCtx(ev, items) {
    var menu = $("ctxmenu");
    if (!menu) return;
    ev.preventDefault();
    menu.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.textContent = it[0];
      if (it[2]) b.className = "danger";
      b.onclick = function () { menu.classList.remove("on"); it[1](); };
      menu.appendChild(b);
    });
    menu.style.left = Math.min(ev.clientX, window.innerWidth - 190) + "px";
    menu.style.top = Math.min(ev.clientY, window.innerHeight - 260) + "px";
    menu.style.zIndex = "120";   // 菜单面板 z-index 70，右键菜单要盖在它上面
    menu.classList.add("on");
  }

  // 自动把浏览器书签导入菜单栏；用户删掉的会记进 bmSkip，不再自动加回
  function autoBookmarksIntoMenu(cb) {
    if (!(window.chrome && chrome.bookmarks && chrome.bookmarks.getTree)) { if (cb) cb(0); return; }
    chrome.bookmarks.getTree(function (tree) {
      var out = [];
      function walk(n, path) {
        if (!n) return;
        if (n.url && /^https?:/i.test(n.url)) {
          out.push({ node: n, dir: path.length ? path.join(" / ") : "收藏夹栏" });
          return;
        }
        var p = path;
        if (n.id === "1") p = ["收藏夹栏"];
        else if (n.id === "2") p = ["其他收藏夹"];
        else if (n.title) p = path.concat(n.title);
        (n.children || []).forEach(function (c) { walk(c, p); });
      }
      ((tree && tree[0] && tree[0].children) || []).forEach(function (c) { walk(c, []); });
      S.menuLinks = S.menuLinks || [];
      var skip = S.bmSkip || [];
      var seen = {};
      S.menuLinks.forEach(function (m) { seen[normU(m.url)] = 1; });
      skip.forEach(function (u) { seen[u] = 1; });
      var added = 0, changedDir = 0, cap = 500;
      // 已有条目也要更新所在分类（早期版本导入的没有 dir 或分类已变）
      var byUrl = {};
      S.menuLinks.forEach(function (m) { byUrl[normU(m.url)] = m; });
      out.forEach(function (item) {
        var n = item.node;
        var k = normU(n.url);
        var dir = item.dir || "收藏夹栏";
        if (byUrl[k]) {
          if (byUrl[k].dir !== dir) { byUrl[k].dir = dir; changedDir++; }
          return;
        }
        if (added >= cap) return;
        seen[k] = 1;
        var nm = (n.title || "").trim().slice(0, 40);
        if (!nm) { try { nm = new URL(n.url).hostname.replace(/^www\./, ""); } catch (e) { nm = "书签"; } }
        var obj = { name: nm, url: n.url, fromBookmark: true, dir: dir };
        S.menuLinks.push(obj);
        byUrl[k] = obj;
        added++;
      });
      if (added || changedDir) persist();
      bmInited = true;
      window.__bmStat = { total: out.length, added: added, fixed: changedDir, menu: (S.menuLinks || []).length, gen: Date.now() };
      updateBmStat();
      if (cb) cb(added);
    });
  }
  function updateBmStat() {
    var el = $("amStat");
    if (!el) return;
    var st = window.__bmStat;
    if (!st) { el.textContent = ""; return; }
    el.textContent = "收藏夹 " + st.total + " 条 · 菜单 " + st.menu + " 条";
  }

  function addDockFromMenu(l) {
    if (hasUrl(l.url)) { SP.toast("已经在 Dock 里了"); return; }
    S.shortcuts.push({ name: l.name, url: l.url, fromBookmark: true });
    persist(); SP.paintDock();
    try { SP.syncGlobalDock && SP.syncGlobalDock(); } catch (e) {}
    renderAppMenu(($("amSearch") && $("amSearch").value) || "");
    SP.toast("已加入 Dock：" + l.name);
  }

  function renderAppMenu(filter) {
    var q = (filter || "").trim().toLowerCase();
    var mine = (S.menuLinks || []).filter(function (l) { return !q || (l.name + " " + l.url).toLowerCase().indexOf(q) >= 0; });
    var dock = (S.shortcuts || []).filter(function (s) { return !q || (s.name + " " + s.url).toLowerCase().indexOf(q) >= 0; });
    renderMineGrouped(mine);
    fillGrid($("amGridDock"), dock, function (s) { return s.icon || iconFor(s.url); });
    bindMenuCtx();
  }

  var amTab = "收藏夹栏";
  function renderMineGrouped(list) {
    var wrap = $("amMineWrap");
    if (!wrap) return;
    var q = (($("amSearch") && $("amSearch").value) || "").trim().toLowerCase();
    var filtering = !!q;

    // 所有分类（按路径字符串去重），收藏夹栏排最前
    var dirs = [], seenDir = {};
    list.forEach(function (l) {
      var d = l.dir || "收藏夹栏";
      if (!seenDir[d]) { seenDir[d] = 1; dirs.push(d); }
    });
    // 收藏夹栏置顶，其余保持收藏夹里的原始顺序
    var barIdx = dirs.indexOf("收藏夹栏");
    if (barIdx > 0) { dirs.splice(barIdx, 1); dirs.unshift("收藏夹栏"); }
    if (dirs.indexOf(amTab) < 0) amTab = dirs[0] || "收藏夹栏";

    function tabLabel(d) {
      if (d === "收藏夹栏") return "收藏夹栏";
      if (d.indexOf("收藏夹栏 / ") === 0) return d.slice(7);
      return d;
    }
    wrap.innerHTML = "";

    // 顶部一行分类
    var tabs = document.createElement("div");
    tabs.className = "am-tabs";
    dirs.forEach(function (d) {
      var n = list.filter(function (l) { return (l.dir || "收藏夹栏") === d; }).length;
      var b = document.createElement("button");
      b.className = "am-tab" + (!filtering && d === amTab ? " on" : "");
      b.textContent = tabLabel(d) + " " + n;
      b.onclick = function (ev) {
        ev.stopPropagation();
        amTab = d;
        renderMineGrouped(list);
        bindMenuCtx();
      };
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    // 内容：搜索时跨分类显示，否则只显示当前分类
    var items = list.filter(function (l) {
      var d = l.dir || "收藏夹栏";
      if (filtering) return true;
      return d === amTab;
    });
    if (items.length) {
      var g = document.createElement("div");
      g.className = "am-grid";
      fillGrid(g, items, function (l) { return iconFor(l.url); });
      wrap.appendChild(g);
    } else {
      var empty = document.createElement("div");
      empty.className = "am-empty";
      empty.textContent = "这个分类下没有网站";
      wrap.appendChild(empty);
    }
  }

  function bindMenuCtx() {
    var grid = $("amMineWrap");
    if (!grid) return;
    Array.prototype.forEach.call(grid.querySelectorAll(".am-item"), function (a) {
      if (a.__ctx) return;
      a.__ctx = true;
      a.addEventListener("contextmenu", function (ev) {
        var url = a.dataset.url, l = null, idx = -1;
        (S.menuLinks || []).forEach(function (m, k) { if (m.url === url) { l = m; idx = k; } });
        if (!l) return;
        showCtx(ev, [
          ["打开链接", function () { location.href = l.url; }],
          ["加入 Dock", function () { addDockFromMenu(l); }],
          ["从菜单移除", function () {
            var removed = S.menuLinks.splice(idx, 1)[0];
            S.bmSkip = S.bmSkip || [];
            if (removed && removed.fromBookmark) S.bmSkip.push(normU(removed.url));
            persist();
            renderAppMenu(($("amSearch") && $("amSearch").value) || "");
            SP.toast("已从菜单移除（不会再自动导入）");
          }, true]
        ]);
      });
    });
  }

  // 启动即同步一次，之后书签有增减也自动更新菜单
  setTimeout(function () { try { autoBookmarksIntoMenu(); } catch (e) {} }, 1200);
  try {
    if (window.chrome && chrome.bookmarks && chrome.bookmarks.onCreated) {
      var bmTimer = null;
      var bmSync = function () {
        clearTimeout(bmTimer);
        bmTimer = setTimeout(function () {
          autoBookmarksIntoMenu(function (n) {
            if (n && $("appmenu") && $("appmenu").classList.contains("on")) renderAppMenu(($("amSearch") && $("amSearch").value) || "");
          });
        }, 800);
      };
      chrome.bookmarks.onCreated.addListener(bmSync);
      chrome.bookmarks.onRemoved.addListener(bmSync);
      chrome.bookmarks.onChanged.addListener(bmSync);
      if (chrome.bookmarks.onMoved) chrome.bookmarks.onMoved.addListener(bmSync);
      if (chrome.bookmarks.onImportEnded) chrome.bookmarks.onImportEnded.addListener(bmSync);
      var bmFocusTimer = null;
      var bmFocusSync = function () {
        clearTimeout(bmFocusTimer);
        bmFocusTimer = setTimeout(function () {
          autoBookmarksIntoMenu(function (n) {
            if (n) {
              if ($("appmenu") && $("appmenu").classList.contains("on")) renderAppMenu(($("amSearch") && $("amSearch").value) || "");
              SP.toast("已同步 " + n + " 个新书签");
            }
          });
        }, 1200);
      };
      window.addEventListener("focus", bmFocusSync);
    }
  } catch (e) {}

  function bindSyncBtn() {
    var b = $("amSync");
    if (!b || b.__on) return;
    b.__on = true;
    b.onclick = function (ev) {
      ev.stopPropagation();
      autoBookmarksIntoMenu(function (n) {
        renderAppMenu(($("amSearch") && $("amSearch").value) || "");
        SP.toast(n ? ("已导入 " + n + " 个新书签") : "书签已是最新");
      });
    };
  }

  function openAppMenu() {
    var box = $("appmenu");
    if (!box) return;
    var m = $("moremenu");
    if (m) m.classList.remove("on");
    bindSyncBtn();
    updateBmStat();
    renderAppMenu("");
    autoBookmarksIntoMenu(function (n) { if (n) renderAppMenu(($("amSearch") && $("amSearch").value) || ""); });
    var inp = $("amSearch");
    if (inp) inp.value = "";
    box.classList.add("on");
    setTimeout(function () { if (inp) inp.focus(); }, 60);
  }
  window.__openAppMenu = openAppMenu;
  try {
    if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(function (m) {
        if (m && m.type === "sp-open-menu") { try { openAppMenu(); } catch (e) {} }
      });
    }
  } catch (e) {}
  (function hashMenu() {
    try {
      if (location.hash.indexOf("menu") < 0) return;
      setTimeout(function () { try { openAppMenu(); history.replaceState(null, "", location.pathname); } catch (e) {} }, 900);
    } catch (e) {}
  })();

  function closeAppMenu() {
    var box = $("appmenu");
    if (!box || !box.classList.contains("on") || box.classList.contains("closing")) return;
    box.classList.add("closing");
    setTimeout(function () { box.classList.remove("on"); box.classList.remove("closing"); }, 380);
  }
  function bindAppMenu() {
    var box = $("appmenu");
    if (!box) return;
    var closeBtn = $("amClose");
    if (closeBtn) closeBtn.onclick = closeAppMenu;
    box.addEventListener("click", function (e) { if (e.target === box) closeAppMenu(); });
    var inp = $("amSearch");
    if (inp) inp.addEventListener("input", function () { renderAppMenu(inp.value); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("on")) { closeAppMenu(); e.stopPropagation(); }
    }, true);
  }

  function showMoreMenu(anchor, lim, over) {
    var menu = $("moremenu");
    if (!menu) return;
    if (menu.classList.contains("on")) { menu.classList.remove("on"); return; }
    menu.innerHTML = "";
    function addItem(name, url) {
      var b = document.createElement("button");
      var ic = iconFor(url);
      if (ic) {
        var im = document.createElement("img");
        im.src = ic; im.onerror = function () { this.style.display = "none"; };
        b.appendChild(im);
      }
      var sp = document.createElement("span");
      sp.textContent = name;
      b.appendChild(sp);
      b.onclick = function () { menu.classList.remove("on"); location.href = url; };
      menu.appendChild(b);
    }
    (S.menuLinks || []).forEach(function (l) { addItem(l.name, l.url); });
    if (S.menuLinks && S.menuLinks.length && over) {
      var hr = document.createElement("div");
      hr.style.cssText = "height:1px;margin:5px 6px;background:rgba(255,255,255,.14)";
      menu.appendChild(hr);
    }
    if (over) {
      S.shortcuts.slice(lim).forEach(function (s) {
        var b = document.createElement("button");
        if (s.icon) { var im = document.createElement("img"); im.src = s.icon; b.appendChild(im); }
        var sp = document.createElement("span"); sp.textContent = s.name; b.appendChild(sp);
        b.onclick = function () { menu.classList.remove("on"); location.href = s.url; };
        menu.appendChild(b);
      });
    }
    if (!menu.children.length) {
      var tip = document.createElement("button");
      tip.textContent = "还没有配置链接（设置 → 菜单按钮）";
      tip.style.opacity = ".6";
      tip.onclick = function () { menu.classList.remove("on"); SP.openPanel(); };
      menu.appendChild(tip);
    }
    var r = anchor.getBoundingClientRect();
    menu.classList.add("on");
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.max(10, Math.min(r.left, window.innerWidth - mw - 10)) + "px";
    menu.style.top = Math.max(10, r.top - mh - 12) + "px";
  }

  function parseLinks(text) {
    return String(text || "").split("\n").map(function (line) {
      line = line.trim();
      if (!line) return null;
      var name = "", url = "";
      if (line.indexOf("|") >= 0) {
        var p = line.split("|");
        name = p[0].trim(); url = p.slice(1).join("|").trim();
      } else { url = line; }
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      if (!name) { try { name = new URL(url).hostname.replace(/^www\./, ""); } catch (e2) { name = url; } }
      return { name: name, url: url };
    }).filter(Boolean);
  }

  function watchDock2() {
    var dock = $("dock");
    if (!dock) return;
    applyOverflow();
    bindAppMenu();
    if (window.MutationObserver) {
      dockMO = new MutationObserver(function () { setTimeout(applyOverflow, 0); });
      dockMO.observe(dock, { childList: true });
    }
    document.addEventListener("pointerdown", function (e) {
      var m = $("moremenu");
      if (m && m.classList.contains("on") && !m.contains(e.target)) m.classList.remove("on");
    }, true);
  }

  /* ---------------- 设置面板 ---------------- */
  var panelBuilt = false;
  function buildPanel() {
    if (panelBuilt) return;
    panelBuilt = true;
    var box = $("extras");
    if (box && box.__built) return;
    if (box) box.__built = true;
    var add = function (id, el) {
      var host = document.getElementById(id) || $("#extras");
      if (host && el) host.appendChild(el);
    };
    var btn = function (text, fn) {
      var b = document.createElement("button"); b.textContent = text; b.onclick = fn; return b;
    };

    /* ---- 背景与壁纸 ---- */
    add("ex-bg", mkRow("壁纸遮罩", mkRange("overlay", 0, 80, "%")));
    add("ex-bg", mkRow("壁纸模糊", mkRange("bgBlur", 0, 24, "px")));
    add("ex-bg", mkRow("轮播",
      mkToggle("slideshow", "启用轮播"), mkRange("slideSec", 10, 300, "s"),
      btn("添加图片", function () { $("slideFile").click(); }),
      btn("清空", function () { S._plMeta = []; SP.idbPut("plCount", 0); startSlideshow(); SP.toast("轮播已清空"); }),
      (function () {
        var i = document.createElement("input");
        i.type = "file"; i.accept = "image/*"; i.multiple = true; i.id = "slideFile"; i.style.display = "none";
        i.addEventListener("change", function () {
          Array.prototype.forEach.call(i.files, addToPlaylist);
          i.value = "";
        });
        return i;
      })()
    ));

    /* ---- 搜索 ---- */
    add("ex-search", mkRow("搜索框样式", mkChoice("searchStyle", [["glass", "玻璃（同 Dock）"], ["outline", "描边"]])));
    add("ex-search", mkRow("描边粗细", mkRange("searchBorder", 1, 6, "px", 160)));
    add("ex-search", mkRow("搜索框字重", mkChoice("searchWeight", [[300, "细"], [400, "常规"], [600, "较粗"], [700, "粗"]])));

    /* ---- 外观 ---- */
    add("ex-look", mkRow("玻璃强度", mkRange("glass", 0, 40, "px")));
    add("ex-look", mkRow("玻璃渲染", mkChoice("glassMode", [["blur", "实时模糊"], ["flat", "半透明（省电）"]])));

    /* ---- 组件 ---- */
    add("ex-widget", mkRow("天气", mkToggle("showWeather", "显示天气"),
      mkColor("fgWeather", "天气颜色"),
      (function () {
        var inp = document.createElement("input");
        inp.type = "text"; inp.placeholder = "城市，如 上海";
        inp.value = S.city || "";
        inp.className = "txt";
        inp.style.width = "130px";
        inp.addEventListener("change", function () { S.city = inp.value.trim(); persist(); loadWeather(true); });
        return inp;
      })()
    ));
    add("ex-widget", mkRow("时钟",
      mkToggle("showSeconds", "显示秒数"),
      mkToggle("blinkColon", "冒号呼吸"),
      mkToggle("showLunar", "农历")
    ));
    add("ex-widget", mkRow("便签", mkToggle("showNotes", "显示便签")));

    /* ---- Dock 与菜单 ---- */
    add("ex-dock", mkRow("图标上限", mkRange("dockLimit", 4, 24, " 个"),
      btn("全部显示", function () { S.dockLimit = 24; persist(); syncers.forEach(function (f) { try { f(); } catch (e) {} }); applyOverflow(); })));
    add("ex-dock", mkRow("首位菜单", mkToggle("dockMenu", "显示菜单按钮"),
      btn("编辑链接", function () {
        var ta = document.getElementById("menuLinksBox");
        if (ta) { ta.style.display = ta.style.display === "none" ? "block" : "none"; if (ta.style.display === "block") ta.focus(); }
      })));
    (function () {
      var wrap = document.createElement("div");
      wrap.className = "row";
      wrap.style.cssText = "align-items:stretch;flex-direction:column;gap:8px";
      var tip = document.createElement("div");
      tip.style.cssText = "font-size:12px;color:#8d96a5;line-height:1.6";
      tip.innerHTML = "每行一个链接，格式：<b>名称|网址</b>（省略名称就用域名）";
      var ta = document.createElement("textarea");
      ta.id = "menuLinksBox";
      ta.className = "txt";
      ta.style.cssText = "display:none;width:100%;height:110px;resize:vertical;font-family:Consolas,monospace";
      ta.value = (S.menuLinks || []).map(function (l) { return l.name + "|" + l.url; }).join(String.fromCharCode(10));
      ta.addEventListener("change", function () {
        S.menuLinks = parseLinks(ta.value);
        persist(); applyOverflow();
        SP.toast("菜单已更新（" + S.menuLinks.length + " 项）");
      });
      wrap.appendChild(tip); wrap.appendChild(ta);
      add("ex-dock", wrap);
    })();
    add("ex-dock", mkRow("全局 Dock",
      mkToggle("globalDock", "在任意网页启用"),
      mkRange("globalDockCount", 4, 12, " 个", 150),
      mkToggle("dockHandle", "底部把手")
    ));
    add("ex-dock", mkRow("快捷键",
      (function () {
        var b = document.createElement("button");
        b.textContent = "修改 Alt+J";
        b.onclick = function () { window.open("edge://extensions/shortcuts", "_blank"); };
        return b;
      })()
    ));
    add("ex-dock", mkRow("Dock 行为",
      mkToggle("ctxMenu", "右键菜单"),
      mkToggle("intro", "入场动画")
    ));

    /* ---- 交互 ---- */
    add("ex-input", mkRow("布局",
      mkToggle("freeLayout", "自由拖动组件"),
      btn("重置位置", function () { S.layout = {}; persist(); applyLayout(); SP.toast("位置已重置"); })
    ));
    add("ex-input", mkRow("输入",
      mkToggle("prefix", "搜索前缀 !b !g"),
      mkToggle("hotkeys", "快捷键")
    ));
    add("ex-input", mkRow("性能",
      mkToggle("memSave", "后台释放视频内存")
    ));

    /* ---- 下载接管 ---- */
  function sendBg(msg, cb) {
    try {
      chrome.runtime.sendMessage(msg, function (res) {
        var err = chrome.runtime.lastError;
        if (err) {
          var m = err.message || "";
          if (m.indexOf("Receiving end does not exist") >= 0 || m.indexOf("context invalidated") >= 0 || m.indexOf("Extension context") >= 0) {
            SP.toast("页面是更新前的旧版本：按 Ctrl+R 刷新后再试");
            return;
          }
          SP.toast("后台无响应：" + m);
          return;
        }
        cb(res);
      });
    } catch (e) {
      SP.toast("页面需刷新（Ctrl+R）后才能调用后台");
    }
  }

  (function autoUpdate() {
    try {
      var cur = (document.body.innerHTML.match(/build (\d+)/) || [])[1] || "";
      var last = localStorage.getItem("spBuildReloaded") || "";
      if (cur && cur !== last) {
        localStorage.setItem("spBuildReloaded", cur);
        setTimeout(function () {
          try { chrome.runtime.reload(); } catch (e) {}
        }, 800);
      }
    } catch (e) {}
  })();

  (function ensureHost() {
    var tries = 0;
    function ping() {
      tries++;
      try {
        chrome.runtime.sendMessage({ type: "sp-ensure-host" }, function () { void chrome.runtime.lastError; });
      } catch (e) {}
    }
    ping();
    var t = setInterval(function () { if (tries >= 3) { clearInterval(t); return; } ping(); }, 15000);
  })();

  (function ctxWatch() {
    var warned = false;
    setInterval(function () {
      var ok = false;
      try { ok = !!(chrome && chrome.runtime && chrome.runtime.id); } catch (e) {}
      if (!ok && !warned) {
        warned = true;
        try { window.__spCtxWatch = true; } catch (e) {}
        SP.toast("扩展已更新：请按 Ctrl+R 刷新页面");
      }
    }, 4000);
  })();

  var dlBox = document.getElementById("ex-dl");
  function dlRow() {
    var r = mkRow.apply(null, arguments);
    if (dlBox) dlBox.appendChild(r);
    return r;
  }
  function dlTitle(text) {
    var d = document.createElement("div");
    d.className = "row";
    d.style.cssText = "padding:14px 0 4px;font-size:12px;letter-spacing:1px;color:#8d96a5";
    d.textContent = text;
    if (dlBox) dlBox.appendChild(d);
    return d;
  }

  var dlTypeRow = dlRow("接管下载",
    mkToggle("dlEnabled", "拦截浏览器下载"),
    mkChoice("dlType", [["pcl", "PclBridge"], ["aria2", "aria2"], ["qb", "qBittorrent"]])
  );

  var dlStatusRow = dlRow("当前状态",
    (function () {
      var s = document.createElement("span");
      s.id = "dlStatus";
      s.style.cssText = "font-size:12.5px;color:#e0a04a";
      s.textContent = "检测中…";
      return s;
    })()
  );

  function refreshDlStatus() {
    var el = document.getElementById("dlStatus");
    if (!el) return;
    fetch("http://127.0.0.1:6806/ping", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var on = !!S.dlEnabled;
        el.style.color = on ? "#3ecf8e" : "#e0a04a";
        el.textContent = j.threads + " 线程 · " + (on ? "接管已开启" : "接管未开启");
      })
      .catch(function () {
        el.style.color = "#e06c6c";
        el.textContent = "下载器未运行（双击 tools\\安装下载器.bat 后重启 Edge）";
      });
  }
  if (dlStatusRow) { dlStatusRow.style.cursor = "pointer"; dlStatusRow.title = "点击刷新"; dlStatusRow.addEventListener("click", refreshDlStatus); }
  setTimeout(refreshDlStatus, 600);
  setInterval(refreshDlStatus, 5000);

  var dlPcl = [];

  dlPcl.push(dlRow("线程数", mkRange("dlThreads", 1, 64, " 线程", 170),
    (function () {
      var s = document.createElement("span");
      s.style.cssText = "font-size:12px;color:#8d96a5";
      s.textContent = "1 = 单线程";
      return s;
    })()
  ));

  dlPcl.push(dlRow("保存目录", (function () {
    var inp = document.createElement("input");
    inp.type = "text"; inp.className = "txt"; inp.style.width = "250px";
    inp.value = S.dlDir || "";
    inp.placeholder = "留空 = 下载\\PCL扩展下载";
    inp.addEventListener("change", function () {
      S.dlDir = inp.value.trim(); persist();
      SP.toast(S.dlDir ? ("保存到：" + S.dlDir) : "已恢复默认目录");
    });
    return inp;
  })()));

  dlPcl.push(dlRow("下载通知",
    mkChoice("dlNotify", [["done", "仅完成"], ["steps", "每 25%"], ["steps10", "每 10%"]])
  ));

  dlPcl.push(dlRow("操作",
    (function () {
      var b = document.createElement("button");
      b.textContent = "检查状态";
      b.onclick = function () { refreshDlStatus(); SP.toast("已刷新状态"); };
      return b;
    })(),
    (function () {
      var b = document.createElement("button");
      b.textContent = "强制启动";
      b.onclick = function () {
        SP.toast("正在尝试启动…");
        try {
          chrome.runtime.sendMessage({ type: "sp-force-start" }, function (res) {
            var err = chrome.runtime.lastError;
            if (err) { SP.toast(err.message.indexOf("Receiving end") >= 0 ? "页面是旧版本，按 Ctrl+R" : ("后台无响应：" + err.message)); return; }
            if (res && res.ok) {
              S.dlEnabled = true; S.dlType = "pcl"; persist();
              try { var tg = document.querySelector('[data-k="dlEnabled"]'); if (tg) tg.classList.add("on"); } catch (e) {}
              refreshDlStatus();
              SP.toast("已启动 · " + (res.info || "") + " · 接管已开启");
            } else {
              SP.toast("启动失败：" + ((res && res.err) || "未知"));
            }
          });
        } catch (e) { SP.toast("页面需刷新（Ctrl+R）后再试"); }
      };
      return b;
    })(),
    (function () {
      var b = document.createElement("button");
      b.textContent = "打开目录";
      b.onclick = function () {
        try { chrome.runtime.sendMessage({ type: "sp-open-dl-folder" }, function () { void chrome.runtime.lastError; }); } catch (e) {}
        SP.toast("正在打开下载目录…");
      };
      return b;
    })()
  ));

  var dlExt = [];
  dlExt.push(dlTitle("外部下载器"));
  dlExt.push(dlRow("接口地址", (function () {
    var inp = document.createElement("input");
    inp.type = "text"; inp.className = "txt"; inp.style.width = "250px";
    inp.value = S.dlEndpoint || "http://127.0.0.1:6800/jsonrpc";
    inp.addEventListener("change", function () { S.dlEndpoint = inp.value.trim(); persist(); });
    return inp;
  })()));
  dlExt.push(dlRow("密钥 / Token", (function () {
    var inp = document.createElement("input");
    inp.type = "text"; inp.className = "txt"; inp.style.width = "170px";
    inp.value = S.dlToken || "";
    inp.placeholder = "可留空";
    inp.addEventListener("change", function () { S.dlToken = inp.value.trim(); persist(); });
    return inp;
  })()));

  function applyDlType() {
    var isPcl = (S.dlType || "pcl") === "pcl";
    dlPcl.forEach(function (el) { if (el) el.style.display = isPcl ? "" : "none"; });
    dlExt.forEach(function (el) { if (el) el.style.display = isPcl ? "none" : ""; });
  }
  try { window.__spApplyDlType = applyDlType; } catch (e) {}
  applyDlType();
  syncers.push(applyDlType);
  if (dlTypeRow) {
    dlTypeRow.addEventListener("click", function (ev) {
      if (ev.target && ev.target.tagName === "BUTTON") setTimeout(applyDlType, 0);
    }, false);
  }

  // 教程
  (function () {
    var wrap = document.createElement("div");
    wrap.className = "row";
    wrap.style.cssText = "align-items:stretch;flex-direction:column;gap:5px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)";
    var h = document.createElement("div");
    h.style.cssText = "font-size:12px;letter-spacing:1px;color:#8d96a5";
    h.textContent = "使用说明";
    var body = document.createElement("div");
    body.style.cssText = "font-size:12.5px;line-height:1.8;color:#b9c3d2";
    body.innerHTML = [
      "① 双击扩展目录里 <b>tools\\安装下载器.bat</b>（一次即可）",
      "② 完全退出 Edge 后重新打开",
      "③ 上面「当前状态」显示线程数即为成功",
      "④ 打开「拦截浏览器下载」后，下载自动走多线程"
    ].join("<br>");
    wrap.appendChild(h); wrap.appendChild(body);
    if (dlBox) dlBox.appendChild(wrap);
  })();
/* ---- 数据 ---- */
    add("ex-data", mkRow("书签", btn("从书签栏导入", importBookmarks)));
  }

  function bindPanelNav() {
    var nav = document.getElementById("pnlNav");
    var main = document.getElementById("pnlMain");
    if (!nav || !main || nav.__on) return;
    nav.__on = true;

    // 按 .grp 切分内容区
    var groups = [];
    var cur = null;
    [].slice.call(main.children).forEach(function (el) {
      if (el.classList && el.classList.contains("grp")) {
        cur = { id: el.id, els: [el] };
        groups.push(cur);
      } else if (cur) {
        cur.els.push(el);
      } else {
        if (!groups.length) { groups.push({ id: "", els: [] }); cur = groups[0]; }
        groups[0].els.push(el);
      }
    });

    function show(id) {
      groups.forEach(function (g) {
        g.els.forEach(function (el) { el.style.display = (g.id === id) ? "" : "none"; });
      });
      [].slice.call(nav.querySelectorAll("a")).forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("data-t") === id);
      });
      main.scrollTop = 0;
    }

    nav.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[data-t]") : null;
      if (!a) return;
      e.preventDefault();
      show(a.getAttribute("data-t"));
    });

    // 侧栏搜索过滤
    var box = document.getElementById("pnlFilter");
    if (box && !box.__on) {
      box.__on = true;
      box.addEventListener("input", function () {
        var q = (box.value || "").trim().toLowerCase();
        [].slice.call(nav.querySelectorAll("a")).forEach(function (a) {
          a.style.display = (!q || a.textContent.toLowerCase().indexOf(q) >= 0) ? "" : "none";
        });
      });
    }

    // 右上角关闭
    var x = document.getElementById("pnlClose");
    if (x && !x.__on) {
      x.__on = true;
      x.addEventListener("click", function () {
        var c = document.getElementById("close");
        if (c) c.click();
      });
    }

    var first = (nav.querySelector("a.on") || nav.querySelector("a"));
    if (first) show(first.getAttribute("data-t"));
  }

  function restoreDlConfig() {
    try {
      if (!window.chrome || !chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get("spDownloader", function (r) {
        var d = r && r.spDownloader;
        if (!d) return;
        var S = window.__sp && window.__sp.S;
        if (!S) return;
        if (typeof d.enabled === "boolean") S.dlEnabled = d.enabled;
        if (d.type) S.dlType = d.type;
        if (d.notify) S.dlNotify = d.notify;
        if (d.threads) S.dlThreads = d.threads;
        if (typeof d.dir === "string") S.dlDir = d.dir;
        try {
          var tg = document.querySelector('[data-k="dlEnabled"]');
          if (tg) tg.classList.toggle("on", !!S.dlEnabled);
        } catch (e) {}
        try { window.__spRefreshDl && window.__spRefreshDl(); } catch (e) {}
      });
    } catch (e) {}
  }

  function boot() {
    restoreDlConfig();
    buildPanel();
    bindPanelNav();
    applyVars();
    watchDock();
    watchDock2();
    bindMemory();
    ["mGrad", "mAnim", "mImg", "mVid", "useBgFile"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener("click", function () { setTimeout(syncTimers, 50); });
    });
    bindNotes();
    bindPin();
    window.addEventListener("online", function () { wRetry = 0; loadWeather(true); });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && S.showWeather && S.city) {
        var stale = !S.wcache || !S.wcache.d || (Date.now() - S.wcache.t > 1800000);
        if (stale) loadWeather(true);
      }
    });
    bindCtx();
    bindKeys();
    bindPrefix();
    enableDrag();
    loadWeather(false);
    if (S.playlist && S.playlist.length) { savePlaylist(S.playlist); delete S.playlist; persist(); }
    loadPlaylist();
    setTimeout(function () { enableDrag(); applyVars(); }, 600);

    var maskEl = $("mask");
    if (maskEl && window.MutationObserver) {
      new MutationObserver(function () {
        if (maskEl.classList.contains("on")) {
          setTimeout(function () {
            ensureDefaults();
            buildPanel();
            syncers.forEach(function (f) { try { f(); } catch (e) {} });
            applyVars();
          }, 20);
        }
      }).observe(maskEl, { attributes: true, attributeFilter: ["class"] });
    }

    // 设置列表每行加「→菜单」按钮
    var listEl = $("list");
    if (listEl && window.MutationObserver) {
      new MutationObserver(function () {
        var rows = listEl.querySelectorAll(".item");
        Array.prototype.forEach.call(rows, function (row, i) {
          if (row.querySelector(".to-menu")) return;
          var del = row.querySelector(".del");
          if (!del || !del.parentNode) return;
          var b = document.createElement("button");
          b.className = "to-menu";
          b.textContent = "→菜单";
          b.style.cssText = "background:none;border:0;color:#8fb4ff;cursor:pointer;font-size:12.5px;padding:0 6px";
          b.onclick = function () {
            var s = S.shortcuts[i];
            if (s) addToMenu(s.name, s.url);
          };
          del.parentNode.insertBefore(b, del);
        });
      }).observe(listEl, { childList: true });
    }

    // 面板打开时同步状态
    var gear = $("gear");
    if (gear) gear.addEventListener("click", function () {
      setTimeout(function () {
        ensureDefaults();
        buildPanel();
        syncers.forEach(function (f) { try { f(); } catch (e) {} });
        applyVars();
      }, 30);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ===== 正在播放（SPlayer 联动，A 胶囊 / B 卡片 两态） ===== */
(function () {
  var SP = window.__sp; if (!SP) return;
  var S = SP.S;
  var HOST = "http://127.0.0.1:6806";
  var ICON_PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>';
  if (S.showNowPlaying === undefined) { S.showNowPlaying = true; try { SP.save(); } catch (e) {} }

  /* ---------- 工具 ---------- */
  function fixMojibake(s) {
    if (!s) return "";
    for (var i = 0; i < s.length; i++) { if (s.charCodeAt(i) > 255) return s; }
    try {
      var bytes = new Uint8Array(s.length);
      for (var j = 0; j < s.length; j++) bytes[j] = s.charCodeAt(j);
      var out = new TextDecoder("gbk").decode(bytes);
      return /[\u4e00-\u9fff\u3040-\u30ff]/.test(out) ? out : s;
    } catch (e) { return s; }
  }
  var accentKey = "";
  function pickAccent(src, key) {
    if (accentKey === key) return;
    accentKey = key;
    var im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function () {
      try {
        var c = document.createElement("canvas");
        c.width = 12; c.height = 12;
        var ctx = c.getContext("2d");
        ctx.drawImage(im, 0, 0, 12, 12);
        var d = ctx.getImageData(0, 0, 12, 12).data;
        var r = 0, g = 0, b = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        // 提亮一点，避免太暗
        r = Math.min(255, Math.round(r * 1.25)); g = Math.min(255, Math.round(g * 1.25)); b = Math.min(255, Math.round(b * 1.25));
        el.style.setProperty("--np-accent", r + "," + g + "," + b);
      } catch (e) {}
    };
    im.src = src;
  }
  function fmt(t) {
    t = Math.max(0, Math.round(t || 0));
    var m = Math.floor(t / 60), s = t % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------- 样式 ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".npwrap{position:fixed;left:var(--np-l,-42px);bottom:var(--np-b,104px);z-index:60;display:block}.np{position:absolute;left:calc(var(--np-size,120px) + 40px);bottom:0;width:288px;box-sizing:border-box;",
    "padding:10px 10px 12px;border-radius:18px;background:rgba(20,20,24,.88);color:#fff;",
    "backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);",
    "box-shadow:0 12px 34px rgba(0,0,0,.28);font:12.5px/1.45 'Microsoft YaHei',system-ui;",
    "opacity:0;pointer-events:none;transform:translate(-12px,8px) scale(.86);transform-origin:left bottom;transition:opacity .18s ease,transform .32s cubic-bezier(.34,1.56,.64,1);overflow:hidden}",
    "body.light .np{background:rgba(252,252,253,.95);color:#1d2026;box-shadow:0 12px 34px rgba(0,0,0,.14)}",
    ".np.big{opacity:1;pointer-events:auto;transform:none}",
    ".np .row{display:flex;align-items:center;gap:10px}",
    ".np .cv{width:44px;height:44px;flex:0 0 44px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.06));background-size:cover;background-position:center;",
    "display:flex;align-items:center;justify-content:center;font-size:16px;opacity:.9;transition:width .22s ease,height .22s ease,flex-basis .22s ease,border-radius .22s ease}",
    ".np .meta{min-width:0;flex:1}",
    ".np .tt{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".np .ar{font-size:11.5px;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}",
    ".np .al{display:none;font-size:11px;opacity:.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}",
    ".np .btns{display:flex;align-items:center;gap:4px}",
    ".np .btns button{border:0;background:transparent;color:inherit;cursor:pointer;width:26px;height:26px;border-radius:50%;",
    "display:flex;align-items:center;justify-content:center;font-size:13px;opacity:.8;transition:background .15s,opacity .15s}",
    ".np .btns button:hover{background:rgba(255,255,255,.16);opacity:1}",
    "body.light .np .btns button:hover{background:rgba(0,0,0,.07)}",
    ".np .btns button:disabled{opacity:.25;cursor:default}",
    ".np .pbar{height:2px;border-radius:2px;background:rgba(255,255,255,.18);margin-top:9px;overflow:hidden}",
    "body.light .np .pbar{background:rgba(0,0,0,.12)}",
    ".np .pfill{height:100%;width:0;background:currentColor;opacity:.85;border-radius:2px;transition:width .4s linear}",
    ".np .times{display:none;justify-content:space-between;font-size:10.5px;opacity:.5;margin-top:6px}",
    ".np .hit{cursor:pointer}",
    /* 展开态 */
    ".np.big{width:288px;padding:12px 12px 14px}",
    ".np.big .row{flex-direction:column;align-items:stretch;gap:0;width:100%}",
    ".np.big .cv{width:100%;height:184px;flex-basis:auto;border-radius:14px;font-size:34px;margin-bottom:12px;background-size:cover;background-position:center}",
    ".np.big .tt{font-size:15px;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
    ".np.big .ar{font-size:12px;margin-top:3px}",
    ".np.big .al{display:block}",
    ".np.big .btns{width:100%;max-width:100%;justify-content:center;gap:16px;margin-top:12px;order:2}",
    ".np.big .btns button{width:36px;height:36px;font-size:15px}",
    ".np.big .btns button[data-a=playpause]{width:44px;height:44px;font-size:17px;background:rgba(255,255,255,.16)}",
    "body.light .np.big .btns button[data-a=playpause]{background:rgba(0,0,0,.08)}",
    ".np.big .times{display:flex}",
    ".np.big .pbar{margin-top:4px}",
    /* 唱片 */
    ".disc{position:relative;width:120px;height:120px;flex:0 0 120px;cursor:grab;user-select:none;touch-action:none;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))}",
    ".vinyl{width:120px;height:120px;border-radius:50%;position:relative;overflow:hidden;",
"background:",
"repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.11) 0 .55px,rgba(255,255,255,.03) .55px 1.1px,rgba(0,0,0,0) 1.1px 2.1px),",
"repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.05) 0 1.2px,rgba(0,0,0,.42) 1.2px 2.9px),",
"repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.16) 0 .8px,rgba(0,0,0,0) .8px 21px),",
"radial-gradient(circle at 50% 50%,#26272b 0 17%,#18191c 26%,#121316 46%,#0d0e11 70%,#08090b 100%);",
"box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),inset 0 0 24px rgba(0,0,0,.8);",
    "animation:np-spin 6s linear infinite;animation-play-state:paused}",
    ".disc.playing .vinyl{animation-play-state:running}",
    ".disc{transform:rotate(-45deg)}",
    ".label{position:absolute;inset:0;margin:auto;transform:rotate(45deg);width:41px;height:41px;border-radius:50%;",
    "display:flex;align-items:center;justify-content:center;font-size:16px;color:#111;",
    "background:linear-gradient(135deg,#f2c14e,#e0a33a);background-size:cover;background-position:center;",
    "box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);overflow:hidden;text-align:center}",
    ".base{position:absolute;top:10px;right:-26px;width:18px;height:18px;border-radius:50%;",
    "background:radial-gradient(circle at 50% 35%,#fafafc 0 38%,#23242a 39% 100%);",
    "box-shadow:0 3px 8px rgba(0,0,0,.45);pointer-events:none}",
    ".arm{position:absolute;top:18px;right:-26px;width:54px;height:3px;border-radius:2px;background:linear-gradient(90deg,#dfe0e6,#9a9ba4);transform-origin:100% 50%;transform:rotate(36deg);transition:transform .55s cubic-bezier(.34,.9,.26,1);filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}",
    ".arm::before{content:\"\";position:absolute;right:-9px;top:-7px;width:17px;height:17px;border-radius:50%;",
    "background:transparent;box-shadow:none}",
    ".head{position:absolute;left:-4px;top:-1px;width:18px;height:4px;border-radius:2px;transform-origin:100% 50%;transform:rotate(34deg);",
    "background:linear-gradient(180deg,#eef0f5,#b3b4bd);box-shadow:0 2px 5px rgba(0,0,0,.35)}",
    ".head::after{content:\"\";position:absolute;left:-11px;top:-3px;width:14px;height:10px;border-radius:2px;",
    "background:linear-gradient(180deg,#f0f1f6,#b7b8c2);box-shadow:0 3px 7px rgba(0,0,0,.45);border:1px solid rgba(0,0,0,.12)}",
    ".disc.playing .arm{transform:rotate(-52deg)}",
    ".deck{position:absolute;left:-13px;top:-20px;width:200px;height:186px;pointer-events:none;overflow:visible}",
    ".armg{transform-box:view-box;transform-origin:100px 20px;transition:transform .55s cubic-bezier(.34,.9,.26,1)}",
    ".disc:not(.playing) .armg{transform:rotate(-40deg)}",
        ".np .btns button{border:0;background:transparent;color:inherit;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:.7;transition:background .16s,opacity .16s,transform .16s}",
    ".np .btns button:hover{background:rgba(255,255,255,.14);opacity:1}",
    "body.light .np .btns button:hover{background:rgba(0,0,0,.06)}",
    ".np .btns button:active{transform:scale(.92)}",
    ".np .divider{display:none;height:1px;background:rgba(255,255,255,.1);margin:12px 0 10px}",
    "body.light .np .divider{background:rgba(0,0,0,.07)}",
    ".np.big .divider{display:block}",
    ".np .times{display:none;justify-content:space-between;font-size:10.5px;opacity:.5;margin-top:7px;font-variant-numeric:tabular-nums}",
    ".np .pbar{position:relative;height:3px;border-radius:3px;background:rgba(255,255,255,.16);margin-top:10px;overflow:visible;cursor:pointer}",
    "body.light .np .pbar{background:rgba(0,0,0,.1)}",
    ".np .pfill{position:relative;height:100%;width:0;background:currentColor;border-radius:3px;transition:width .4s linear}",
    ".np .pfill::after{content:'';position:absolute;right:-4px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;background:currentColor;opacity:0;transition:opacity .16s}",
    ".np.big .pbar:hover .pfill::after{opacity:1}",
    ".np .tt{letter-spacing:.2px}",
    ".np .ar{letter-spacing:.1px}",
        ".np{border-radius:20px;box-shadow:0 22px 54px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.06)}",
    "body.light .np{box-shadow:0 18px 44px rgba(0,0,0,.16),inset 0 0 0 1px rgba(0,0,0,.04)}",
    ".np.big .cv{border-radius:16px;box-shadow:0 10px 26px rgba(0,0,0,.35)}",
    "body.light .np.big .cv{box-shadow:0 10px 26px rgba(0,0,0,.14)}",
    ".np .btns button{opacity:.75}",
    ".np.big .btns button[data-a=playpause]{width:46px;height:46px;background:#fff;color:#12141a;box-shadow:0 8px 20px rgba(0,0,0,.32);opacity:1}",
    ".np.big .btns button[data-a=playpause]:hover{background:#fff;transform:scale(1.04)}",
    "body.light .np.big .btns button[data-a=playpause]{background:#1c1f26;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,.22)}",
    ".np .pbar{background:rgba(255,255,255,.14)}",
    ".np .pfill{box-shadow:0 0 10px rgba(255,255,255,.18)}",
    ".np .pfill::after{width:10px;height:10px;margin-top:-5px;right:-5px;box-shadow:0 1px 4px rgba(0,0,0,.35)}",
    ".np.big .pbar{margin-top:12px}",
    ".np.big .times{margin-top:8px;letter-spacing:.2px}",
        ".np{--np-accent:255,255,255}",
    ".np.big{background:linear-gradient(165deg,rgba(var(--np-accent),.18) 0%,rgba(20,20,24,.92) 42%,rgba(18,18,22,.94) 100%)}",
    "body.light .np.big{background:linear-gradient(165deg,rgba(var(--np-accent),.14) 0%,rgba(252,252,253,.97) 45%,rgba(250,250,252,.98) 100%)}",
    ".np.big.playing .cv{animation:np-breathe 7s ease-in-out infinite}",
    "@keyframes np-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}",
    ".np .pfill{background:rgb(var(--np-accent))}",
    ".np.big .btns button[data-a=playpause]{background:rgb(var(--np-accent));color:#101216;box-shadow:0 8px 22px rgba(var(--np-accent),.35)}",
    "body.light .np.big .btns button[data-a=playpause]{color:#fff}",
        ".np .vol{display:none;align-items:center;gap:9px;margin-top:9px;opacity:.85}",
    ".np.big .vol{display:flex}",
    ".np .vol svg{opacity:.6;flex:0 0 14px}",
    ".np .vol input[type=range]{-webkit-appearance:none;flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.16);outline:none}",
    "body.light .np .vol input[type=range]{background:rgba(0,0,0,.12)}",
    ".np .vol input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:currentColor;box-shadow:0 1px 3px rgba(0,0,0,.35)}",
    ".np .vol .vlab{font-size:10.5px;opacity:.55;min-width:20px;text-align:right;font-variant-numeric:tabular-nums}",
        ".np .btns button{width:34px;height:34px}",
    ".np .btns svg{width:19px;height:19px}",
    ".np.big .btns button{width:38px;height:38px}",
    ".np.big .btns button[data-a=playpause]{width:52px;height:52px}",
    ".np.big .btns button[data-a=playpause] svg{width:22px;height:22px}",
    ".np .vol svg{width:16px;height:16px;flex:0 0 16px}",
    ".np.big .cv{font-size:44px}",
        ".np .btns button{width:38px;height:38px;outline:none;-webkit-tap-highlight-color:transparent}",
    ".np .btns button:focus,.np .btns button:focus-visible{outline:none;box-shadow:none}",
    ".np .btns svg{width:22px;height:22px}",
    ".np.big .btns button{width:44px;height:44px}",
    ".np.big .btns button[data-a=playpause]{width:56px;height:56px}",
    ".np.big .btns button[data-a=playpause] svg{width:24px;height:24px}",
        ".np.flip{left:auto;right:calc(var(--np-size,120px) + 40px);transform-origin:right bottom;transform:translate(12px,8px) scale(.86)}",
    ".np.big.flip{transform:none}",
        ".disc::after{content:'';position:absolute;inset:0;border-radius:50%;pointer-events:none;mix-blend-mode:screen;opacity:.95;background:linear-gradient(122deg,rgba(255,255,255,0) 34%,rgba(255,255,255,.20) 45%,rgba(255,255,255,.06) 51%,rgba(255,255,255,0) 60%),linear-gradient(302deg,rgba(255,255,255,0) 66%,rgba(255,255,255,.10) 75%,rgba(255,255,255,0) 84%),conic-gradient(from 205deg at 50% 50%,rgba(255,255,255,0) 0deg,rgba(255,255,255,.08) 42deg,rgba(255,255,255,0) 92deg,rgba(255,255,255,0) 245deg,rgba(255,255,255,.06) 300deg,rgba(255,255,255,0) 360deg),radial-gradient(120% 95% at 24% 10%,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 46%)}",
    ".disc::before{content:'';position:absolute;inset:-1px;border-radius:50%;pointer-events:none;box-shadow:0 0 0 1px rgba(255,255,255,.05),inset 0 0 20px rgba(0,0,0,.6)}",
    "@keyframes np-spin{to{transform:rotate(360deg)}}",
    ".np.big .pbar{height:3px}",
    ".npdim{position:fixed;inset:0;z-index:59;background:rgba(6,8,12,.45);backdrop-filter:blur(10px) saturate(120%);-webkit-backdrop-filter:blur(10px) saturate(120%);opacity:0;pointer-events:none;transition:opacity .22s ease}",
    ".npdim.on{opacity:1;pointer-events:auto}",
    ".npwrap.snap{transition:left .18s cubic-bezier(.2,.8,.2,1),bottom .18s cubic-bezier(.2,.8,.2,1)}"
  ].join("");
  document.head.appendChild(css);

  /* ---------- DOM ---------- */
  var el = document.createElement("div");
  el.className = "np";
  el.innerHTML =
    '<div class="row">' +
      '<div class="cv">♪</div>' +
      '<div class="meta">' +
        '<div class="tt">未在播放</div>' +
        '<div class="ar"></div>' +
        '<div class="al"></div>' +
      '</div>' +
      '<div class="btns">' +
        '<button data-a="prev" title="上一首"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M7 5h2v14H7zM20 5v14l-10-7z"/></svg></button>' +
        '<button data-a="playpause" title="播放/暂停"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>' +
        '<button data-a="next" title="下一首"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M15 5h2v14h-2zM4 5v14l10-7z"/></svg></button>' +
      '</div>' +
    '</div>' +
    '<div class="divider"></div>' +
    '<div class="pbar hit"><div class="pfill"></div></div>' +
    '<div class="times"><span class="tcur">0:00</span><span class="tdur">0:00</span></div>' +
    '<div class="vol">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>' +
      '<input type="range" min="0" max="100" value="30" aria-label="音量">' +
      '<span class="vlab">30</span>' +
    '</div>';
  var wrap = document.createElement("div");
  wrap.className = "npwrap";
  var disc = document.createElement("div");
  disc.className = "disc";
  disc.title = "展开 / 收起";
  disc.innerHTML = '<div class="vinyl"><div class="label">♪</div></div>' +
    '<svg class="deck" viewBox="-10 -20 140 130">' +
      '<defs>' +
        '<linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#f2f3f7"/><stop offset="55%" stop-color="#cfd1da"/><stop offset="100%" stop-color="#9a9ca6"/>' +
        '</linearGradient>' +
        '<linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#fbfbfd"/><stop offset="100%" stop-color="#c2c4ce"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="armg">' +
        '<path d="M95 24 C 97 40, 90 52, 78 55 C 73 56.5, 69 57, 66 57" fill="none" stroke="url(#ag)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect x="57" y="52" width="18" height="9.5" rx="2.5" transform="rotate(-20 66 56.7)" fill="url(#hg)" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>' +
      '</g>' +
      '<circle cx="95" cy="20" r="8" fill="#f3eee3" stroke="rgba(0,0,0,.22)" stroke-width=".8"/>' +
      '<circle cx="95" cy="20" r="4.8" fill="#1e1f24"/>' +
      '<rect x="92.2" y="7" width="5.6" height="8" rx="2.8" fill="#c9a86a" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>' +
    '</svg>';
  wrap.appendChild(disc);
  wrap.appendChild(el);
  (document.querySelector(".ui") || document.body).appendChild(wrap);

  var dim = document.createElement("div");
  dim.className = "npdim";
  (wrap.parentNode || document.body).appendChild(dim);
  function applyBig(v) {
    big = !!v;
    if (big) {
      setTimeout(loadVolume, 60);
      var r = disc.getBoundingClientRect();
      var cardW = el.offsetWidth || 288;
      var spaceRight = window.innerWidth - r.right;
      el.classList.toggle("flip", spaceRight < cardW + 56);
    }
    el.classList.toggle("big", big);
    dim.classList.toggle("on", big);
    clearTimeout(collapseTimer);
  }
  dim.addEventListener("click", function () { applyBig(false); });
  var label = disc.querySelector(".label");
  var svgDeck = disc.querySelector(".deck");
  var vin = disc.querySelector(".vinyl");

  /* ---- 可调尺寸 ---- */
  var SIZE = Math.max(80, Math.min(220, parseInt(S.npSize, 10) || 120));
  function applySize(px, persistIt) {
    px = Math.max(80, Math.min(220, Math.round(px)));
    SIZE = px;
    var labelPx = Math.round(px * 0.34);
    var deckW = Math.round(px * 140 / 84);
    var deckH = Math.round(px * 130 / 84);
    wrap.style.setProperty("--np-size", px + "px");
    disc.style.width = px + "px";
    disc.style.height = px + "px";
    disc.style.flexBasis = px + "px";
    vin.style.width = px + "px";
    vin.style.height = px + "px";
    label.style.width = labelPx + "px";
    label.style.height = labelPx + "px";
    label.style.fontSize = Math.round(px * 0.133) + "px";
    if (svgDeck) {
      svgDeck.style.width = deckW + "px";
      svgDeck.style.height = deckH + "px";
      svgDeck.style.left = Math.round(-px * 0.108) + "px";
      svgDeck.style.top = Math.round(-px * 0.17) + "px";
    }
    if (persistIt) { S.npSize = px; try { SP.save(); } catch (e) {} }
  }
  applySize(SIZE, false);

  var cv = el.querySelector(".cv"), tt = el.querySelector(".tt"), ar = el.querySelector(".ar"), al = el.querySelector(".al");
  var pfill = el.querySelector(".pfill"), pbar = el.querySelector(".pbar");
  var tcur = el.querySelector(".tcur"), tdur = el.querySelector(".tdur");
  var btns = el.querySelectorAll(".btns button");

  /* ---------- 状态 ---------- */
  var data = null, hostDown = false, big = false, coverBg = "", collapseTimer = 0, coverKey = "";

  function ensureHost() {
    try { chrome.runtime.sendMessage({ type: "sp-ensure-host" }, function () { void chrome.runtime.lastError; }); } catch (e) {}
  }

  function render() {
    if (!S.showNowPlaying) { wrap.style.display = "none"; return; }
    wrap.style.display = "flex";
    el.classList.add("show");
    var d = data;
    var has = !!(d && (d.running || d.title));
    var title = has ? (d.title || "未知曲目") : "";
    var artist = has ? (d.artist || "") : "";
    var album = has ? (d.album || "") : "";

    if (hostDown) {
      tt.textContent = "桥接未连接";
      ar.textContent = "正在尝试启动…";
      el.classList.remove("show");
      el.classList.add("show");
    } else if (!has) {
      tt.textContent = "未在播放";
      ar.textContent = "";
    } else {
      tt.textContent = title;
      ar.textContent = artist;
      al.textContent = album;
    }

    btns.forEach(function (b) { b.disabled = !has; });

    el.classList.toggle("playing", !!(d && d.playing));
    if (has && d.cover) {
      var key = (title + artist).slice(0, 46);
      if (coverKey !== key) {
        coverKey = key;
        var probe = new Image();
        var src = HOST + "/cover?k=" + encodeURIComponent(key.length + String(key.charCodeAt(0) || 0) + String(key.charCodeAt(1) || 0));
        probe.onload = function () {
          cv.style.backgroundImage = "url(\"" + src + "\")";
          cv.textContent = "";
          coverBg = "url(\"" + src + "\")";
          label.style.backgroundImage = coverBg;
          pickAccent(src, key);
        };
        probe.onerror = function () {
          cv.style.backgroundImage = "";
          cv.textContent = (album || title || "♪").slice(0, 1);
        };
        cv.textContent = (album || title || "♪").slice(0, 1);
        probe.src = src;
      }
    } else if (coverKey || !has) {
      coverKey = "";
      cv.style.backgroundImage = "";
      cv.textContent = has ? (album || title || "♪").slice(0, 1) : "♪";
    }

    disc.classList.toggle("playing", !!(d && d.playing && has));
    var ppBtn = el.querySelector('.btns button[data-a=playpause]');
    if (ppBtn) ppBtn.innerHTML = (d && d.playing) ? ICON_PAUSE : ICON_PLAY;
    if (!coverBg) label.textContent = has ? (album || title || "♪").slice(0, 1) : "♪";
    if (coverBg) label.style.backgroundImage = coverBg; else label.style.backgroundImage = "";

    var pos = has ? (d.pos || 0) : 0, dur = has ? (d.dur || 0) : 0;
    var pct = dur > 0 ? Math.min(100, pos / dur * 100) : 0;
    pfill.style.width = pct + "%";
    tcur.textContent = fmt(pos);
    tdur.textContent = fmt(dur);
  }

  function refresh(force) {
    fetch(HOST + "/nowplaying" + (force ? "?fresh=1" : ""), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        hostDown = false;
        data = {
          title: fixMojibake(d.title || ""),
          artist: fixMojibake(d.artist || ""),
          album: fixMojibake(d.album || ""),
          state: d.state || "",
          playing: !!d.playing,
          running: !!d.running,
          pos: Number(d.pos) || 0,
          dur: Number(d.dur) || 0,
          cover: !!d.cover
        };
        render();
      })
      .catch(function () {
        data = null;
        var was = hostDown;
        hostDown = true;
        if (!was) ensureHost();
        render();
      });
  }

  /* 本地推进进度，避免 2 秒一跳 */
  setInterval(function () {
    if (!data || !data.playing || !data.dur) return;
    data.pos = Math.min(data.dur, data.pos + 0.5);
    var pct = data.dur > 0 ? (data.pos / data.dur * 100) : 0;
    pfill.style.width = Math.min(100, pct) + "%";
    tcur.textContent = fmt(data.pos);
  }, 500);

  function loop() { refresh(); setTimeout(loop, 1200); }
  setTimeout(loop, 600);
  ensureHost();

  /* ---------- 交互 ---------- */
  btns.forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var act = b.dataset.a;
      if (act === "playpause" && data) { data.playing = !data.playing; render(); }   // 乐观更新
      fetch(HOST + "/media?action=" + act, { cache: "no-store" }).catch(function () {});
      setTimeout(function () { refresh(true); }, 110);
      setTimeout(function () { refresh(true); }, 380);
      setTimeout(function () { refresh(true); }, 850);
    });
  });

  var volInp = el.querySelector(".vol input");
  var volLab = el.querySelector(".vol .vlab");
  var volTimer = 0;
  function loadVolume() {
    if (!volInp) return;
    fetch(HOST + "/volume", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && typeof j.level === "number" && j.level >= 0) {
          volInp.value = j.level;
          if (volLab) volLab.textContent = j.level;
        }
      }).catch(function () {});
  }
  if (volInp) {
    volInp.addEventListener("input", function () {
      if (volLab) volLab.textContent = volInp.value;
      clearTimeout(volTimer);
      var v = volInp.value;
      volTimer = setTimeout(function () {
        fetch(HOST + "/volume?set=" + v).catch(function () {});
      }, 120);
    });
  }
  pbar.addEventListener("click", function (ev) {
    if (!data || !data.dur) return;
    ev.stopPropagation();
    var r = pbar.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
    fetch(HOST + "/media?action=seek&pos=" + Math.round(data.dur * ratio)).catch(function () {});
    data.pos = data.dur * ratio;
    render();
  });

  /* --- 拖动调整位置 --- */
  // 旧默认值迁移：左下 → 左侧垂直居中
  if (S.npPos && S.npPos.l === -42 && S.npPos.b === 104) S.npPos = { l: -60, centerY: true };
  if (S.npPos && S.npPos.l === -60 && S.npPos.b === 104) S.npPos = { l: -60, centerY: true };
  var pos = S.npPos && typeof S.npPos.l === "number" ? S.npPos : { l: -60, centerY: true };
  function applyNpPos() {
    wrap.style.setProperty("--np-l", pos.l + "px");
    if (pos.centerY) {
      wrap.style.setProperty("--np-b", "calc(50vh - " + (SIZE / 2) + "px)");
    } else {
      wrap.style.setProperty("--np-b", pos.b + "px");
    }
  }
  applyNpPos();

  var drag = null;
  disc.addEventListener("pointerdown", function (ev) {
    if (ev.button !== 0) return;
    if (pos.centerY) {
      var wr = wrap.getBoundingClientRect();
      pos.b = Math.round(window.innerHeight - wr.bottom);
      pos.centerY = false;
      applyNpPos();
    }
    drag = { x: ev.clientX, y: ev.clientY, l: pos.l, b: pos.b, moved: 0 };
    disc.classList.add("dragging");
    try { disc.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });
  disc.addEventListener("pointermove", function (ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
    var nl = drag.l + dx;
    var nb = drag.b - dy;
    var maxL = window.innerWidth - SIZE * 0.6;
    var maxB = window.innerHeight - 120;
    pos.l = Math.max(-70, Math.min(maxL, nl));
    pos.b = Math.max(40, Math.min(maxB, nb));
    pos.centerY = false;
    applyNpPos();
  });
  function endDrag(ev) {
    if (!drag) return;
    var wasDrag = drag.moved > 5;
    drag = null;
    disc.classList.remove("dragging");
    try { disc.releasePointerCapture(ev.pointerId); } catch (e) {}
    if (wasDrag) {
      var W = window.innerWidth, H = window.innerHeight, SZ = SIZE, half = SZ / 2, T = Math.max(48, SZ * 0.56);
      var snapped = false;
      if (pos.l < T) { pos.l = -half; snapped = true; }                        // 贴左
      else if (pos.l + SZ > W - T) { pos.l = W - SZ + half; snapped = true; }  // 贴右
      if (pos.b < T) { pos.b = 40; snapped = true; }                           // 贴底
      else if (pos.b + SZ > H - T) { pos.b = H - SZ; snapped = true; }         // 贴顶
      applyNpPos();
      if (snapped) {
        wrap.classList.add("snap");
        setTimeout(function () { wrap.classList.remove("snap"); }, 240);
      }
      S.npPos = { l: Math.round(pos.l), b: Math.round(pos.b), centerY: false };
      try { SP.save(); } catch (e) {}
    } else {
      applyBig(!big);
    }
  }
  disc.addEventListener("pointerup", endDrag);
  disc.addEventListener("pointercancel", function (ev) { drag = null; disc.classList.remove("dragging"); });

  el.addEventListener("click", function (ev) {
    if (ev.target.closest("button")) return;
    applyBig(!big);
  });
  el.addEventListener("mouseenter", function () { clearTimeout(collapseTimer); });
  el.addEventListener("mouseleave", function () {
    clearTimeout(collapseTimer);
    if (!big) return;
    collapseTimer = setTimeout(function () { applyBig(false); }, 2500);
  });

  /* ---------- 设置项 ---------- */
  function mkRow() {
    var r = document.createElement("div"); r.className = "row";
    var lab = document.createElement("span"); lab.className = "lab"; lab.textContent = "正在播放";
    var b = document.createElement("button"); b.textContent = "显示 SPlayer 卡片";
    var sync = function () { b.classList.toggle("on", !!S.showNowPlaying); };
    b.onclick = function () { S.showNowPlaying = !S.showNowPlaying; try { SP.save(); } catch (e) {} sync(); render(); };
    sync(); r.appendChild(lab); r.appendChild(b);
    return r;
  }
  function mkSizeRow() {
    var r = document.createElement("div"); r.className = "row";
    var lab = document.createElement("span"); lab.className = "lab"; lab.textContent = "唱片尺寸";
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = 80; inp.max = 220; inp.step = 4; inp.value = SIZE;
    inp.style.width = "150px";
    var out = document.createElement("span");
    out.style.cssText = "font-size:12px;opacity:.7;min-width:44px";
    out.textContent = SIZE + "px";
    inp.addEventListener("input", function () { out.textContent = inp.value + "px"; applySize(parseInt(inp.value, 10), false); });
    inp.addEventListener("change", function () {
      applySize(parseInt(inp.value, 10), true);
      var half = SIZE / 2;
      if (pos.l > -half && pos.l < 0) { pos.l = -half; wrap.style.setProperty("--np-l", pos.l + "px"); S.npPos = { l: Math.round(pos.l), b: Math.round(pos.b) }; try { SP.save(); } catch (e) {} }
    });
    var reset = document.createElement("button");
    reset.textContent = "重置位置";
    reset.style.marginLeft = "6px";
    reset.onclick = function () {
      S.npPos = { l: -60, b: 104 };
      S.npSize = 120;
      applySize(120, false);
      pos.l = -60; pos.b = 104;
      wrap.style.setProperty("--np-l", "-60px");
      wrap.style.setProperty("--np-b", "104px");
      inp.value = 120; out.textContent = "120px";
      try { SP.save(); } catch (e) {}
      SP.toast && SP.toast("唱片位置与尺寸已重置");
    };
    r.appendChild(lab); r.appendChild(inp); r.appendChild(out); r.appendChild(reset);
    return r;
  }
  function mount() {
    var box = document.getElementById("ex-widget");
    if (!box) return false;
    box.appendChild(mkRow());
    box.appendChild(mkSizeRow());
    return true;
  }
  if (!mount()) setTimeout(mount, 700);
})();
