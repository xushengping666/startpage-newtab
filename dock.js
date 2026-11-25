/* 全局浮动 Dock：任意网页按 Alt+Shift+D 或鼠标移到屏幕底部唤出 */
(function () {
  if (location.protocol === "chrome-extension:") return;   // 新标签页自己已经有 Dock
  if (window.__spGlobalDock) return;
  window.__spGlobalDock = true;

  var host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none";
  var root = host.attachShadow({ mode: "open" });
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("dock.css");
  root.appendChild(link);

  var hot = document.createElement("div"); hot.className = "hot";
  var wrap = document.createElement("div"); wrap.className = "wrap";
  var dock = document.createElement("div"); dock.className = "dock";
  wrap.appendChild(dock);
  root.appendChild(hot); root.appendChild(wrap);
  document.documentElement.appendChild(host);

  var hideTimer = null, shown = false;

  function paint(items) {
    dock.innerHTML = "";
    if (!items || !items.length) {
      var t = document.createElement("div"); t.className = "tip";
      t.textContent = "还没有快捷方式";
      dock.appendChild(t);
      return;
    }
    items.slice(0, 12).forEach(function (s) {
      var a = document.createElement("a");
      a.className = "it"; a.href = s.url; a.target = "_blank"; a.rel = "noreferrer";
      a.title = s.name || s.url;
      var fav = "";
      try { fav = "https://" + new URL(s.url).hostname + "/favicon.ico"; } catch (e) {}
      var ic = s.icon || fav;
      if (ic) {
        var img = document.createElement("img"); img.src = ic; img.alt = "";
        img.onerror = function () {
          if (ic !== fav && fav) { ic = fav; img.src = fav; return; }   // 退一步用 favicon
          img.style.display = "none";
          a.appendChild(fallback(s.name));
        };
        a.appendChild(img);
      } else {
        a.appendChild(fallback(s.name));
      }
      dock.appendChild(a);
    });
  }
  function fallback(name) {
    var sp = document.createElement("span");
    sp.textContent = (name || "?").trim().charAt(0).toUpperCase();
    return sp;
  }

  var cfg = { enabled: true, handle: true };
  function loadCfg(cb) {
    try {
      chrome.storage.local.get("spDock", function (r) {
        var d = r && r.spDock ? r.spDock : {};
        cfg.enabled = d.enabled !== false;
        cfg.handle = d.handle !== false;
        handle.style.display = cfg.handle ? "" : "none";
        if (cb) cb();
      });
    } catch (e) { if (cb) cb(); }
  }
  loadCfg();
  try { chrome.storage.onChanged.addListener(function (ch) { if (ch.spDock) loadCfg(function () { if (shown) show(); }); }); } catch (e) {}

  function show() {
    if (!cfg.enabled) return;
    clearTimeout(hideTimer);
    if (shown) return;
    shown = true;
    wrap.classList.add("on");
    chrome.storage.local.get("spDock", function (r) {
      var d = r && r.spDock ? r.spDock : {};
      dock.classList.toggle("light", !!d.light);
      var items = (d.items || []).slice(0, d.limit || 8);
      paint(items);
    });
  }
  function hide(delay) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { shown = false; wrap.classList.remove("on"); }, delay == null ? 600 : delay);
  }
  function toggle() { shown ? hide(0) : show(); }

  hot.addEventListener("mouseenter", show);

  // 兼容：任何页面只要鼠标进到底部 8px 就唤出（不依赖 hover 目标）
  var lastMove = 0;
  document.addEventListener("mousemove", function (e) {
    var now = Date.now();
    if (now - lastMove < 60) return;
    lastMove = now;
    if (e.clientY >= window.innerHeight - 10) show();
    else if (shown && e.clientY < window.innerHeight - 90) hide(500);
  }, true);

  // 底部常驻一个小把手，点一下也能开
  var handle = document.createElement("div");
  handle.className = "handle";
  handle.title = "点击打开 Dock（Alt+Shift+D）";
  handle.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
  root.appendChild(handle);
  wrap.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  wrap.addEventListener("mouseleave", function () { hide(700); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
      e.preventDefault(); toggle();
    }
    if (e.key === "Escape") hide(0);
  }, true);
  chrome.runtime.onMessage.addListener(function (m) {
    if (m && m.type === "sp-toggle-dock") toggle();
  });
  window.addEventListener("blur", function () { hide(0); });
})();