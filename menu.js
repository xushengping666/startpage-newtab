/* 兜底：当前页没有新版 dock.js 时，注入这个脚本提供 Alt+M 菜单 */
(function () {
  if (window.__spMenuScript) return;
  window.__spMenuScript = true;
  if (location.protocol === "chrome-extension:" || location.protocol === "edge:") return;

  var host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
  var root = document.createElement("div");
  host.attachShadow({ mode: "open" });
  var sh = host.shadowRoot;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("dock.css");
  sh.appendChild(link);

  host.style.visibility = "hidden";
  link.onload = function () { host.style.visibility = ""; if (window.__spMenuPending) { window.__spMenuPending = false; try { show(); } catch (e) {} } };
  link.onerror = function () { host.style.visibility = ""; };

  var mask = document.createElement("div");
  mask.className = "menu-mask";
  mask.innerHTML = '<div class="menu-panel"><div class="menu-head"><input class="menu-search" placeholder="搜索收藏" autocomplete="off"><button class="menu-x" title="关闭">×</button></div><div class="menu-tabs"></div><div class="menu-body"></div><div class="menu-foot"><div class="menu-sec">Dock 快捷方式</div><div class="menu-dock"></div></div></div>';
  sh.appendChild(mask);
  document.documentElement.appendChild(host);

  var panel = mask.querySelector(".menu-panel");
  var input = mask.querySelector(".menu-search");
  var tabs = mask.querySelector(".menu-tabs");
  var body = mask.querySelector(".menu-body");
  var dockRow = mask.querySelector(".menu-dock");
  var data = null, tab = "收藏夹栏";

  function hostOf(u) { try { return new URL(u).hostname; } catch (e) { return ""; } }
  function loadIcons(el) {
    if (!el) return;
    var imgs = Array.prototype.slice.call(el.querySelectorAll("img[data-u]"));
    if (!imgs.length) return;
    var urls = imgs.map(function (i) { return i.getAttribute("data-u"); });
    try {
      chrome.runtime.sendMessage({ type: "sp-icons", urls: urls }, function (res) {
        var icons = (res && res.icons) || {};
        imgs.forEach(function (img) {
          var u = img.getAttribute("data-u");
          if (icons[u]) { img.onerror = null; img.src = icons[u]; }
        });
      });
    } catch (e) {}
  }
  function label(d) { if (d === "收藏夹栏") return "收藏夹栏"; if (d.indexOf("收藏夹栏 / ") === 0) return d.slice(7); return d; }
  function render() {
    var q = (input.value || "").trim().toLowerCase();
    var list = data || [];
    var dirs = [], seen = {};
    list.forEach(function (it) { if (!seen[it.dir]) { seen[it.dir] = 1; dirs.push(it.dir); } });
    var bi = dirs.indexOf("收藏夹栏"); if (bi > 0) { dirs.splice(bi, 1); dirs.unshift("收藏夹栏"); }
    if (dirs.indexOf(tab) < 0) tab = dirs[0] || "收藏夹栏";
    tabs.innerHTML = "";
    dirs.forEach(function (d) {
      var n = list.filter(function (it) { return it.dir === d; }).length;
      var b = document.createElement("button");
      b.className = "menu-tab" + (!q && d === tab ? " on" : "");
      b.textContent = label(d) + " " + n;
      b.style.setProperty("--i", String(dirs.indexOf(d)));
      b.onclick = function (ev) { ev.stopPropagation(); tab = d; render(); };
      tabs.appendChild(b);
    });
    var items = list.filter(function (it) {
      if (q && (it.name + " " + it.url).toLowerCase().indexOf(q) < 0) return false;
      return q ? true : it.dir === tab;
    });
    body.innerHTML = "";
    if (!items.length) { var e = document.createElement("div"); e.className = "menu-empty"; e.textContent = "没有匹配的收藏"; body.appendChild(e); }
    items.slice(0, 120).forEach(function (it, idx) {
      var a = document.createElement("div");
      a.className = "menu-item"; a.setAttribute("role", "link"); a.tabIndex = 0;
      a.style.setProperty("--i", String(Math.min(idx, 24))); a.title = it.name + "  " + it.url;
      var img = document.createElement("img");
      img.setAttribute("data-u", it.url);
      img.src = hostOf(it.url) ? "https://" + hostOf(it.url) + "/favicon.ico" : "";
      img.onerror = function () { var d = document.createElement("div"); d.className = "ph"; d.textContent = (it.name || "?").slice(0, 1); this.replaceWith(d); };
      var sp = document.createElement("span"); sp.textContent = it.name || hostOf(it.url);
      a.appendChild(img); a.appendChild(sp);
      a.onclick = function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        window.open(it.url, "_blank", "noopener");
      };
      a.onkeydown = function (ev) { if (ev.key === "Enter") a.onclick(ev); };
      body.appendChild(a);
    });
    loadIcons(body);
  }
  function show() {
    if (host.style.visibility === "hidden") { window.__spMenuPending = true; return; }
    try {
      chrome.storage.local.get("spUi", function (r) {
        var light = (!r || !r.spUi) ? true : !!r.spUi.light;
        mask.classList.toggle("light", light);
      });
    } catch (e) {}
    mask.classList.add("on");
    if (data) { render(); }
    else {
      chrome.runtime.sendMessage({ type: "sp-get-bookmarks" }, function (res) { data = (res && res.items) || []; render(); });
    }
    try {
      chrome.storage.local.get("spDock", function (r) {
        var items = ((r && r.spDock && r.spDock.items) || []).slice(0, 12);
        dockRow.innerHTML = "";
        items.forEach(function (s) {
          var a = document.createElement("div"); a.className = "menu-it-sm"; a.title = s.name; a.setAttribute("role", "link");
          var im = document.createElement("img"); im.src = s.icon || ("https://" + hostOf(s.url) + "/favicon.ico");
          im.onerror = function () { this.style.display = "none"; };
          a.appendChild(im);
          a.onclick = function (ev) { ev.preventDefault(); window.open(s.url, "_blank", "noopener"); };
          dockRow.appendChild(a);
        });
      });
    } catch (e) {}
    setTimeout(function () { input.focus(); }, 60);
  }
  function hide() { mask.classList.remove("on"); }
  mask.addEventListener("click", function (e) { if (e.target === mask) hide(); });
  document.addEventListener("pointerdown", function (e) {
    if (!mask.classList.contains("on")) return;
    var path = e.composedPath ? e.composedPath() : [];
    if (path.indexOf(panel) >= 0) return;
    if (panel.contains(e.target)) return;
    hide();
  }, true);
  mask.querySelector(".menu-x").onclick = hide;
  input.addEventListener("input", render);
  input.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); }, true);
  chrome.runtime.onMessage.addListener(function (m, sender, sendResponse) {
  if (m && m.type === "sp-open-menu") { try { show(); } catch (e) {} try { sendResponse({ ok: true }); } catch (e) {} return true; }
});
  show();
})();
