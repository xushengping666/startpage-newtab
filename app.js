
(function () {
  var KEY = "startpage.v2";
  var DEF = { engine: "bing", bgMode: "video", img: "", clock24: true, theme: "auto", dockAlpha: 40, font: "system", clockWeight: 400, historyLimit: 12, fgSearch: "", fgClock: "", fgBorder: "", history: [], shortcuts: [
    { name: "哔哩哔哩", url: "https://www.bilibili.com", icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAALYElEQVR42u2de4wdVR3HP+fM3Mfe3XbbbbvdR1va8pA2FZEGiLVUjRAEDQSMggYND41Ro+AjIJgYjUKUPzSIJvyhPCKt/5AQREGIFJrykEIrhAI+Srel++52u7vs3r33zsz5+cfM3L3bpXS3O3fvtJ1JbtJt75455/f4/t6nSkSI6IlsoRPkUVEsYidEj+Tsai4ZcCoTPXJm6IT4VWVGZBqQEP74mKCi0ICE+FXUBp0Qv7ZM0Anxa8sEnRC/tkzQCfFrywSd0KS2j06kv7ZaoBPi15YJCQTFDIKSp0YMSOCnRjCUaEACQQkDEvipIQwlGpBAUG1UUBIGgAh4IqiAIN4cUMULmhBU8OdaM0JJhG0RM5XAsFzkGCGl/Z+MgFbVL1FV6z3McVfErIjfM+7y03/183z/OEuyNt9es5AvnDYfLyCOqgLx73lrkM17hyl6wjWr5vPDdYuwtUIR3ftirQHhy8Zdw0VP7WdX5yhkLB9/RLjrwlZu//AiPBG0UrMmiqkg7E0vdPPAm4NgK1AKii43nbOEP2xoxQTvO+ltQIj5W3vz7OoZI12fQlsKO21hZSzueLmXn7x2EEspjMzOWBrxiW8EvrStkwfeGiSVs7FSGstWWLkUD74zTMeogw7ed0pAEEDJE1AKExDI4DPGzmh+/mofRU/41frm44ajEONLRrh2WyeP7hnGrrNxzIQRVgqMCKOOOXW8IAuFABua61jUkMJ1PCw1AU+ugJ2xuXtXPzfv6MVSvrckx0H8cU+4ausBHt0zTKrOxq0QcUsrTMHj3KYMH2pM+3ZJnQIM8KUOWupstlzUTtbSeK5MOrwrgp21+e3rA3zjpR60AkHwRHxt+YCPK4JWMOoaPvfMuzzRMUKqQvIBtFK4RY8VCzJs3thOSitETgEjHEKNRpVdwFcOFbjqmXfpyrto7UNSGR+Vwi24XL+2ifs3tE1bQgeLHlduPcDzXaPY2cmSrxUY17B+cR1/vWQFLVn7qHs7aRgQQkjlwUYdw4G8gwKe68vzvZd7KcrUKDVkwnVnL+SWtYv8dT7Au/JEuOWVPl7qHMU+AnaU8t2i5qzF/RvbWFGfwlawLJeiIaUnG281NxpRdQZ4Qhnj3xwq8si+EV44mOfNoRIDRY+SZ8jYGlfAO4ob4kttxULH8nONoG2NOcrR0tq3Q44R0lqxOGuxrjHDxuYcn185j7WNmSl7PyEZEB6ge9zlxzv72bJ3mFLJ88XLUhNiJseOgnRgO6Zl2I713crITMo5ERAhk7G4bnUjd65vZmnWrjoTqsYAV/x457ED7/GtF3voHilBxsLWChHxsV5mlhxTESbZ1BE/aBRK4UNW0WN5Y4b7Pt7K5e0N5bOcMAxwRbCV4qG9w1z/XBcosFMaz8iURnpV43zMkS6uClxU1zEo4KFPtPOV1Y1V04TIGRBu9OnuMS57er9PYT0ZEiylEAQThrpSwyEjBVorFKqcKQ1hDONz6O+XnsYlrfVVYUKkDAjzLr3jLuf+ZS/9eRdtT4T44d6lZEBDQ9amKWNV3dB9kLAMFj1GCy4IqLSGCo0IjX9Lzua1K1bTnLURFW3wZEerzn5C62evD9A/UprkBioFEuQdvnhmI189fQHnLcrSmNZoasMBgzBcMuw8VOChPUM80jEC2rcFgTOFndL0jpT4xRsD3HtBi+9ZRYibkWlAGP53jjmc/dhe8o4BNeHgKIGUggc3tXPtyvnE8dnSMcyN27txBKRi74jQkLL471Wn01JnEyUPdJTSBPB45yhjeQcr8LV96VcYz/C7Da1cu3I+jpFyNSoOH08ExwhfXtXIvR9rxbgGFVBYAK017+Udnuga9aErQqOlox6a3do7NglQLAXG8bigJcfXzljge0haYamJIkitP5ZS2FrhivD1MxdwXksOU5EkDL+3tWcsnsk4CQ7hCfx7pIRoVdYIhR8VXVMBO4p4T11fc9p8MEJYDhIE0Yr/jJSQID0Sy2zouGsYGPegAn4MvnEIw3sFsR99X7cwA4GrPNFDqOgreBRcE2lXhY46ACuYyRk1CbJwOVtPW/6FmdcAolnL31uDrcGacJ9DN2XUMRQjLpvFrjErLCOGaSJvFk5aWP4M15ot7eRk7w2tTFn35B3yrmDNAm8tpci7Qk/eKQdWcevDtOMk+VrBtr48P9jRy54Rh4VpzTfXNHHrukWYGUhL+N1f7j7EfW8PcrhkOGt+irvPb+FTLbnY9ATFpzUxCGy68g5XP9vJzr48w55h35jDbS92s3nvMHqacOSKoIE/vTPM7S92s3/MYcQzvNqX5+pnD9Cdd8tl0YQBIVYHHRFPdo0x+F6JdDaFAlK2xrI0mztGpm3Aw7TGwx3DWJYmZft/k86mGBpzeKrbj1NMTMAoNhAEMOKYcquIn4sRPGAscP2mAxuhySh4/u9SsZYCDpc8ku7oGQ4rHA9cq6MZeZL29Gm1EXJE1TCqtUzCgKM/y3N+plEr/2MrjYjQWhe2jhybFeF3lmZtRARb6fJ6AqxsSCUMeD9/XYDLljWwbmmO0piD8YRiwUXZmu+uaZoBGPnfuXnNQpSlKRZcjCeUxhw+srSeS9vqy7mrxAgfAQ0NtuZvn17OHTv72TlYoCVr8f11i9mwpA4zzXKgFbiYG5tzPHrxcn69+xD9RY/zm7Lcub6ZelvPKKY4Zbyg0ACvqE/x8KZ2SkHPThgnzCRw0kE/6ZXL53Hl8nmT14oZ7tpxy0aGdfp00K9pOL5CuFKUO6vT2k+VK+ITAceSAZW+vgREtGZlWyrrFZBMSc71tbQQ+xpEMid8sjFAnQSX0B0t3FBxZ0BGKxqCJsrQzdaBNRwqeUEXQnxZIcHuBh0PPFMe2gvP0pDSZCK24joqqRcga2tac6mgoF0hNSLsGCjEGosrz7Lj4LjfKVd5BiO052yytp5OM/fca0BY/lu3IIOq6CgwCFiaLR3DFDyDQsUmFz+lIIQi7xr+3DEMlp7U2aGM+GebZZm06jbg4tZcuassPJhlK/YdLvCjXQexgryMawTvGPNec/HxxN9LmC+6dWc/+4eKWBU9rYLfKXdpW31844Awt/LZZfNonZ+hd8xBB50FnoCVsrjnjQE0cNd5zWTj5Jgrxbgr3LGrn9/vPoSVssr3VmgFxjO0N2b4TFtD5HmkSLujPfGL6HfvPsRtL/VMnU4ETMmwdkmWG85YwIWL62jL2TWZUA8zp115l38eHOfBPUO8PVBAp/WklHVKK5xxl99sbOOWNU3lM8aSARJ0SDsGLnyig9f789iZI+ZzlcJzDXgGbE0mpWtmnAUoOgZcA5bGsvUkfLe1P856fkuOFy5b6bdTRjy8F/mARthxsHuoyCef3MehcQ87raeMiupgIEKk5ujjX4uATHIObK1wS4bmnMX2y1dx1vx0VbopqjKiFG5012CBK/7xLl0jDnbWwohM8YBUzC6L8o2xwi14tM9L8fglK/hoU7ZqrSxVG9ILsfKd0RI3bO9me+co2BptK3RwXUFcgjIVOM0egrgCrmHTsgYeuKiN1Q3pyHF/zsdUjcAf/3eYe98+zBuD4/4/qHDWJyZTekHR4ZxFdXxnzUJuPHMhWnHijqnyPjdTeQLb+8bY1pvn1cEC+0cdxlypmSYoFPUpxaqGNOubMmxaWs+mpbnyfueig25urioIXL4j1diIP61eyyHJlJ56N0Q1Iaeml3VIueLlpyriEot5FXvSam5BsWaX9sUpRa1O1ZLkiZAdJamInfwMSASxhiCQaEACQQkDEntYQx8k0YAEghIGJG55DUMgncRGtY0/EwiKoQ1ItGAOsy86SdPUNvWlk1xZbfOOOklY1jbpq5OscW0z7vYMF0r+172ISx06qaHUts5kz/IFiUbMUjDtCF8sCdFn/vwfxH6gxmyYjkgAAAAASUVORK5CYII=" },
    { name: "抖音", url: "https://www.douyin.com", icon: "data:image/png;base64,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" },
    { name: "淘宝", url: "https://www.taobao.com", icon: "data:image/png;base64,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" },
    { name: "知乎", url: "https://www.zhihu.com", icon: "data:image/png;base64,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" },
    { name: "GitHub", url: "https://github.com", icon: "data:image/png;base64,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" },
    { name: "邮箱", url: "https://mail.qq.com", icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAFaElEQVR42u2dT4hVdRTHP7/fvXf+aVP+mbFcidE2KBByF9K4GBICoY3SToiglblo4SZwFwhugtpIi5BctLCICNrJjJqWAyOGNWTK2Dim45jO/fs7Le59M0+LdMY373ffm3PgwfBg7u/e8/2d7zm/8+c+IyK0SFp2oQ4R04qLhKr0ljy7aScAa1npLQfDqvJXFYyWWYAqfmUgmFZYgCp/Fa3BqvL9gmBV+X5BsKp8vyBYVb5fEKzqxK9Y3f1+rcCq8v2CoBRUMwpS8QSA0o8nGlILUApSAJR+PNKQWoBSkAKgogAoACqeJKRTqtfUvMGnkwAQoBAITT0AyAUC4wcIIy1sjXsScY/w3nwu3izBAINNu8B54OS2WoATsAZmU+GT33O+ny34MxYKTwgEBp7vM4wMBby3LWRzj1m8x66zgMbu+vW+Y++PCRN3HQOBIfQcBuQOHhTCy89avtrRy/YB21ZLaAsAjQXmMmFkLGZi3rGpx5ALiGdPbEzpi26lwo7nLN+91sf6ipZMt4ShTsqH+exqzvm5UvmpK78X/H6cQOpgU49h7Lbj06s5pvq+K84BQsmpTuDbmwX9QbnzH3WGPj7NUgj0B4avZ4pFPyDd4oQNcL+A6VgI7cO046QMA22bY0BXhcGNdUUgtOU9PihgfdhFAAAUCJl7eOcJ0B+U5j+fl+Zo2mCRDhgM4a9UiJvuyQCZK++1XaeC0OfpUyrf8OFLEW9vDbmXS0kPq/TsUvmcZ0LDl9M5hyZTkNVbr9YANHzD3wW8ezFlOhY+eDFqy9of/5bx0S8ZxkBUcb1Zi8k4oVRAZOHQZMq+8wl3spJ5M9e6SCdz5Xp3MmHf+YRDkymRXVI+azkb2th9w72GEzdyRsYSJuYdkV0KBZ8mynFSAjwx7xgZSzhxI2e415QUiKajF0HIBTZHhkv3HLvHY05O5wSm5O2VxOSuOuQFBk5O5+wej7l0z7E5qg6AaD3gP7OS60OIC9h/IeHw5RRThYrLyRcVVVhrDBy+nLL/QkJchZa5gBZkHqO8yMBgZDhyJWPvuYTZVAjMkymvkVqeTYW95xKOXMkYjAzRMkFc0xUxV1HIUI/h1EzOrtMxZ+YcYaVEeUyN4cycY9fpmFMzOUNVhtOBliRXQkkbI8PUgjA6HnP8Wr5YOHHy71xTYOD4tZzR8ZipBWFjZGpHOR1XE84F1gWlkg9cTDg4mZK5Jb/Q4PvMwcHJlAMXE1z1P3VXfscU5YuK1zdEhqNTGXvOxlyPS78QGLgeC3vOxhydytgQGYKa8n3tivIrqSMP9xh+uFXw+umYz1/pAeCdn1L+WHAM9xgyAe2KWEXJpLSEG4nw1rkEKDOtG6LOU35HAtDwCwNNHD/QIXzfNQAsFvib/kYbs9ZuY5e2JioAKgqAAqCiACgAKgqAAqCiACgAKgqAAqCiACgASxJgiGy9M5hC2UUXtLFT1LbrwQYCeKHPkDu/3cj8z6hS7mBrn2EgaF/Drm1HG3pj4mR0OGChkNrMBzdLaGChEEa3BIsTPV03pHc3gzfGFvj5rmOot15DejeTakhvZ9/i7LDpxjHVqQeOfRcSxm87+oPSL/iUzJU7f+dGyxev9rKtG8dUHx3Uvl8Ix6ZyvpkpmEn8Dmpv6TW8uSXg/e0h64IuHtTWVxXUBACa5nMDU5/OO7tWXtahr6upUVtKDaNRTUUoACoKgAKgogCsJQA0GPEYCKoFKAUpAHom8ngOVQtQClIANDXjMQ1mNT/mNwepFFRDH6BW0MYMvNVUvd/yh9V6id/ak9Wild/Cn9XKod+qa7jMC+mv7rW43G21ju631yB8ygXUIp5yY4YtXFhU6cuXfwCZlGbfn0tm1gAAAABJRU5ErkJggg==" },
    { name: "百度", url: "https://www.baidu.com", icon: "data:image/png;base64,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" },
  ] };
  var ENG = {
    bing: { n: "必应", u: "https://cn.bing.com/search?q=" },
    baidu: { n: "百度", u: "https://www.baidu.com/s?wd=" },
    google: { n: "谷歌", u: "https://www.google.com/search?q=" },
    zhihu: { n: "知乎", u: "https://www.zhihu.com/search?type=content&q=" },
    taobao: { n: "淘宝", u: "https://s.taobao.com/search?q=" },
    github: { n: "GitHub", u: "https://github.com/search?q=" }
  };
  var ICON_VER = 7;
  var S, objUrl = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw), r = clone(DEF);
        for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k]; }
        if (!r.shortcuts || !r.shortcuts.length) r.shortcuts = clone(DEF.shortcuts);
        if ((r.fontVer || 0) < 2) {
          if (!r.clockWeight || r.clockWeight === 600) r.clockWeight = 400;
          r.fontVer = 2;
        }
        if ((r.iconVer || 0) !== ICON_VER) {
          r.shortcuts.forEach(function (s) {
            if (s.custom) return;
            for (var di = 0; di < DEF.shortcuts.length; di++) {
              if (DEF.shortcuts[di].url === s.url) { s.icon = DEF.shortcuts[di].icon; break; }
            }
          });
          r.iconVer = ICON_VER;
        }
        r.shortcuts.forEach(function (s) {
          if (!s.icon) {
            for (var i = 0; i < DEF.shortcuts.length; i++) {
              if (DEF.shortcuts[i].url === s.url) { s.icon = DEF.shortcuts[i].icon; break; }
            }
          }
        });
        return r;
      }
    } catch (e) {}
    return clone(DEF);
  }
  function syncGlobalDock() {
    try {
      if (!window.chrome || !chrome.storage || !chrome.storage.local) return;
      var items = (S.shortcuts || []).slice(0, 12).map(function (s) {
        var ic = s.icon || "";
        if (ic.length > 40000) ic = "";              // 异常大的才丢弃
        return { name: s.name, url: s.url, icon: ic };
      });
      var isLight = false;
      try {
        var th = S.theme || "dark";
        if (th === "light") isLight = true;
        else if (th === "system") isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;
        else if (th === "auto") { var h = new Date().getHours(); isLight = h >= 7 && h < 19; }
      } catch (e) {}
      chrome.storage.local.set({
        spDock: {
          items: items, light: isLight,
          enabled: S.globalDock !== false,
          limit: Math.max(4, Math.min(12, parseInt(S.globalDockCount, 10) || 8)),
          handle: S.dockHandle !== false
        }
      });
    } catch (e) {}
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S, function (k, v) {
        if (k.charAt(0) === "_") return undefined;
        return v;
      }));
      try { syncGlobalDock(); } catch (e0) {}
      try {
        if (window.chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            spDownloader: {
              enabled: !!S.dlEnabled,
              type: S.dlType || "aria2",
              endpoint: S.dlEndpoint || "http://127.0.0.1:6800/jsonrpc",
              token: S.dlToken || "",
              threads: Math.max(1, Math.min(64, parseInt(S.dlThreads, 10) || 8)),
              dir: (S.dlDir || "").trim(),
              notify: S.dlNotify || "done"
            }
          });
        }
      } catch (e1) {}
    } catch (e) { try { toast("保存失败：内容太大，请换小一点的图片，或改用 bg.jpg 放文件夹"); } catch (e2) { alert("保存失败"); } }
  }
  function two(n) { return n < 10 ? "0" + n : "" + n; }

  var _lastStamp = "";
  var _seg = [], _lunarCache = { key: "", v: "" };

  function renderClockText(txt) {
    var el = document.getElementById("clock");
    if (!S.blinkColon) { if (el.textContent !== txt) el.textContent = txt; _seg = []; return; }
    var parts = txt.split(":");
    if (_seg.length !== parts.length) {
      el.innerHTML = "";
      _seg = [];
      parts.forEach(function (p, i) {
        if (i) { var c = document.createElement("span"); c.className = "colon"; c.textContent = ":"; el.appendChild(c); }
        var s = document.createElement("span"); s.textContent = p; el.appendChild(s); _seg.push(s);
      });
    } else {
      parts.forEach(function (p, i) { if (_seg[i].textContent !== p) _seg[i].textContent = p; });
    }
  }

  function paintClock() {
    var d = new Date(), h = d.getHours(), m = two(d.getMinutes());
    var secPart = S.showSeconds ? (":" + two(d.getSeconds())) : "";
    var txt = S.clock24
      ? (two(h) + ":" + m + secPart)
      : ((h % 12 || 12) + ":" + m + secPart + (h < 12 ? " AM" : " PM"));
    var wd = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][d.getDay()];
    var lunar = S.showLunar ? lunarStr(d) : "";
    var dateStr = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 · " + wd + (lunar ? " · " + lunar : "");
    var stamp = txt + "|" + dateStr;
    if (stamp !== _lastStamp) {
      _lastStamp = stamp;
      renderClockText(txt);
      document.getElementById("date").textContent = dateStr;
      applyTheme();
    }
  }

  function cnDayNum(n) {
    var dg = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    if (n <= 0) return "";
    if (n <= 10) return "初" + dg[n];
    if (n < 20) return "十" + dg[n - 10];
    if (n === 20) return "二十";
    if (n < 30) return "廿" + dg[n - 20];
    return "三十";
  }

  function lunarStr(d) {
    var key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    if (_lunarCache.key === key) return _lunarCache.v;
    try {
      var mo = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { month: "long" }).format(d);
      var dy = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { day: "numeric" }).format(d).replace(/[^0-9]/g, "");
      var n = parseInt(dy, 10);
      var out = mo + (n ? cnDayNum(n) : "");
      _lunarCache = { key: key, v: out };
      return out;
    } catch (e) { return ""; }
  }

  var v = document.getElementById("bgvideo");
  var im = document.getElementById("bgimg");
  var fx = document.getElementById("fx");
  var fxRaf = null, fxT0 = 0;
  function stopFxMotion() {
    if (fxRaf) { cancelAnimationFrame(fxRaf); fxRaf = null; }
    fx.style.transform = "";
  }
  function startFxMotion() {
    stopFxMotion();
    fxT0 = performance.now();
    function tick(t) {
      if (S.bgMode !== "anim") { fxRaf = null; return; }
      var s = (t - fxT0) / 1000;
      var x = Math.sin(s / 9) * 7.5;
      var y = Math.cos(s / 11.5) * 5.5;
      var sc = 1.07 + (Math.sin(s / 13) + 1) / 2 * 0.11;
      fx.style.transform = "translate3d(" + x.toFixed(2) + "%," + y.toFixed(2) + "%,0) scale(" + sc.toFixed(3) + ")";
      fxRaf = requestAnimationFrame(tick);
    }
    fxRaf = requestAnimationFrame(tick);
  }

  window.__spApplyBg = function () { try { applyBackground(); } catch (e) {} };

  function setStageWall(url) {
    try {
      var st = document.getElementById("stage");
      if (!st) return;
      if (url) {
        st.style.backgroundImage = 'url("' + url + '")';
        st.style.backgroundSize = "cover";
        st.style.backgroundPosition = "center";
        st.style.backgroundRepeat = "no-repeat";
      } else {
        st.style.backgroundImage = "";
      }
    } catch (e) {}
  }

  function hideAll(releaseVideo, keepImage) {
    stopFxMotion();
    fx.style.display = "none";
    if (!keepImage) im.style.display = "none";
    v.style.display = "none";
    try { v.pause(); } catch (e) {}
    if (releaseVideo && v.getAttribute("src")) {
      try { v.removeAttribute("src"); v.load(); } catch (e2) {}
    }
  }

  function armGesturePlay() {
    if (window.__spGesture) return;
    window.__spGesture = true;
    var once = function () {
      window.__spGesture = false;
      document.removeEventListener("pointerdown", once);
      document.removeEventListener("keydown", once);
      ensurePlaying();
    };
    document.addEventListener("pointerdown", once);
    document.addEventListener("keydown", once);
  }

  function ensurePlaying() {
    if (S.bgMode !== "video") return;
    var vv = document.getElementById("bgvideo");
    if (!vv || !vv.src) return;
    if (!vv.paused) return;
    vv.muted = true;
    var p = vv.play();
    if (p && p.catch) p.catch(function () { armGesturePlay(); });
  }

  function playVideoSrc(src) {
    hideAll();
    v.onerror = null;
    v.src = src;
    v.style.display = "block";
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function toast(t) {
    var el = document.getElementById("pill");
    el.textContent = t;
    el.classList.add("on");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("on"); }, 5000);
  }

  function fallbackToAnim(msg) {
    S.bgMode = "anim"; save(); applyBackground();
    if (msg) toast(msg);
  }

  function applyBackground() {
    var mode = S.bgMode;
    if (mode !== "image") setStageWall("");
    hideAll(mode !== "video", mode === "image");
    if (mode === "video") {
      var settled = false, timer = null;
      var useFile = function () {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        v.onerror = function () {
          if (!S.videoWarned) {
            S.videoWarned = true;
            try { save(); } catch (e) {}
            fallbackToAnim("没找到视频，已切回动态渐变。把视频命名 bg.mp4 放进文件夹即可自动播放");
          } else {
            fallbackToAnim("");
          }
        };
        v.onloadeddata = function () { hideAll(); v.style.display = "block"; refreshContrast(); var pp = v.play(); if (pp && pp.catch) pp.catch(function () { armGesturePlay(); }); };
        v.oncanplay = function () { ensurePlaying(); };
        v.src = "bg.mp4";
        v.style.display = "block";
        var p2 = v.play(); if (p2 && p2.catch) p2.catch(function () { armGesturePlay(); });
      };
      timer = setTimeout(useFile, 800);
      idbGet("bgvideo").then(function (blob) {
        if (settled) return;
        if (blob && blob.size) { settled = true; clearTimeout(timer); playVideoSrc(URL.createObjectURL(blob)); }
        else { useFile(); }
      }, function () { useFile(); });
      return;
    }
    if (mode === "image") {
      // 图片模式下由 #stage 的 background-image 承担显示，隐藏渐变层避免盖住
      fx.style.display = "none"; fx.className = ""; stopFxMotion();
      im.onerror = function () { im.style.display = "none"; fallbackToAnim("图片加载失败，已切回渐变"); toast("壁纸图片加载失败，请换一张 jpg/png 再试"); };
      if (S.img) {
        im.src = S.img;
        im.style.display = "none";
        setStageWall(S.img);
        im.onload = function () { setStageWall(im.currentSrc || im.src); refreshContrast(); };
        setTimeout(refreshContrast, 150);
        return;
      }
      if (S.imgKey) {
        var tries = 2;
        var loadKeyed = function () {
          idbGet(S.imgKey).then(function (v) {
            if (!v) throw new Error("empty");
            im.onerror = function () { im.style.display = "none"; toast("壁纸图片解码失败，请重新选择"); };
            if (typeof v === "string") {
              im.src = v;
              setStageWall(v);
              // 旧数据：大 base64 自动转成 Blob，减少下次加载/切窗时的解码卡顿
              if (v.length > 900000 && S.imgKey) {
                fetch(v).then(function (r) { return r.blob(); }).then(function (b2) {
                  if (b2 && b2.size > 0) idbPut(S.imgKey, b2);
                }).catch(function () {});
              }
            }
            else {
              try { if (im.__blobUrl) URL.revokeObjectURL(im.__blobUrl); } catch (e0) {}
              var u = URL.createObjectURL(v);
              im.__blobUrl = u;
              im.src = u;
              setStageWall(u);
            }
            im.style.display = "none";
            im.onload = function () { try { setStageWall(im.currentSrc || im.src); } catch (e) {} refreshContrast(); };
            setTimeout(refreshContrast, 150);
          }).catch(function () {
            if (tries-- > 0) { try { idbReset(); } catch (e) {} setTimeout(loadKeyed, 350); return; }
            // 多次失败不切模式，保留已加载的画面，等自愈重试
            if (im.getAttribute("src")) { im.style.display = "block"; refreshContrast(); return; }
            im.style.display = "none";
            toast("壁纸读取失败，稍后自动重试；可重新选择图片");
          });
        };
        loadKeyed();
        return;
      }
      var cands = ["bg.jpg", "bg.jpeg", "bg.png", "bg.webp"];
      var ci = 0;
      var tryNext = function () {
        if (ci >= cands.length) { fallbackToAnim("没找到图片，已切回动态渐变。把图片命名为 bg.jpg 放进文件夹，或直接拖到页面上"); return; }
        im.onerror = function () { ci++; tryNext(); };
        im.onload = function () { setStageWall(im.currentSrc || im.src); im.style.display = "none"; refreshContrast(); };
        im.src = cands[ci];
        im.style.display = "block";
      };
      tryNext();
      return;
    }
    if (mode === "grad") { fx.style.display = "block"; fx.className = ""; stopFxMotion(); return; }
    fx.style.display = "block"; fx.className = "anim";
    startFxMotion();
  }

  function colorOf(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return "linear-gradient(135deg, hsl(" + h + ",62%,55%), hsl(" + ((h + 45) % 360) + ",64%,42%))";
  }

  var AUTO_ALL_ICONS = false;
  var IS_EXT = (function () { try { return !!(window.chrome && chrome.runtime && chrome.runtime.id); } catch (e) { return false; } })();

  function trimBox(img) {
    if (!img.width || !img.height) return null;
    var c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var d;
    try { d = ctx.getImageData(0, 0, c.width, c.height).data; } catch (e) { return null; }
    var minX = c.width, minY = c.height, maxX = -1, maxY = -1;
    for (var y = 0; y < c.height; y++) {
      for (var x = 0; x < c.width; x++) {
        var i = (y * c.width + x) * 4;
        if (d[i + 3] < 24) continue;
        if (d[i] > 244 && d[i + 1] > 244 && d[i + 2] > 244) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  function composeTile(img, size, ratio) {
    var r = ratio || 0.74;
    var cv = document.createElement("canvas");
    cv.width = size; cv.height = size;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    var box = trimBox(img) || { x: 0, y: 0, w: img.width, h: img.height };
    var inner = size * r;
    var sc = Math.min(inner / box.w, inner / box.h);
    var w = Math.max(1, Math.round(box.w * sc)), hh = Math.max(1, Math.round(box.h * sc));
    ctx.drawImage(img, box.x, box.y, box.w, box.h, (size - w) / 2, (size - hh) / 2, w, hh);
    return cv.toDataURL("image/png");
  }

  function loadImgToDataUrl(url, size) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        try { res(composeTile(img, size)); } catch (e) { rej(e); }
      };
      img.onerror = function () { rej(new Error("img")); };
      img.src = url;
    });
  }

  function pickBestIcon(doc, host) {
    var links = Array.prototype.slice.call(doc.querySelectorAll("link[rel]"));
    var best = null, bestScore = -1;
    links.forEach(function (l) {
      var rel = (l.getAttribute("rel") || "").toLowerCase();
      if (rel.indexOf("icon") < 0) return;
      var href = l.getAttribute("href");
      if (!href || /^data:/.test(href)) return;
      var sizes = (l.getAttribute("sizes") || "").toLowerCase();
      var px = 0, m = sizes.match(/(\d+)x(\d+)/);
      if (m) px = parseInt(m[1], 10);
      var score = px;
      if (/apple-touch-icon/.test(rel)) score += 40;
      if (/(^|\s)icon(\s|$)/.test(rel)) score += 20;
      if (/svg/.test((l.getAttribute("type") || "").toLowerCase()) || /\.svg(\?|#|$)/i.test(href)) score += 60;
      try { href = new URL(href, "https://" + host + "/").toString(); } catch (e) { return; }
      if (score > bestScore) { bestScore = score; best = href; }
    });
    return best;
  }

  function downloadTile(url) {
    return fetch(url, { credentials: "omit" }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.blob();
    }).then(function (blob) {
      var obj = URL.createObjectURL(blob);
      return loadImgToDataUrl(obj, 96).then(
        function (d) { URL.revokeObjectURL(obj); return d; },
        function (err) { URL.revokeObjectURL(obj); throw err; }
      );
    });
  }

  // 从 PWA manifest 里找最大图标（通常是 192/512，最清晰）
  function expandManifest(url) {
    return fetch(url, { credentials: "omit" }).then(function (r) {
      if (!r.ok) throw new Error("manifest");
      return r.json();
    }).then(function (m) {
      if (!m || !m.icons || !m.icons.length) return null;
      var best = null, bestPx = -1;
      m.icons.forEach(function (ic) {
        var px = 0;
        var mm = String(ic.sizes || "").match(/(\d+)\s*x\s*(\d+)/);
        if (mm) px = parseInt(mm[1], 10);
        if (/svg/i.test(ic.type || "") || /\.svg(\?|$)/i.test(ic.src || "")) px += 200;
        if (px > bestPx) { bestPx = px; best = ic.src; }
      });
      if (!best) return null;
      try { return new URL(best, url).toString(); } catch (e2) { return null; }
    }).catch(function () { return null; });
  }

  function extIcon(s) {
    var host = hostOf(s.url);
    if (!host) return Promise.reject(new Error("host"));
    var key = "icon:" + host + ":v2";
    return idbGet(key).then(function (c) {
      if (c) return c;

      return fetch("https://" + host + "/", { credentials: "omit" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .catch(function () { return ""; })
        .then(function (html) {
          var cands = [];
          var doc = null;
          if (html) { try { doc = new DOMParser().parseFromString(html, "text/html"); } catch (e) {} }
          if (doc) {
            var best = pickBestIcon(doc, host);
            if (best) cands.push(best);
            var man = doc.querySelector('link[rel~="manifest"]');
            var mhref = man && man.getAttribute("href");
            if (mhref) {
              try { cands.push({ manifest: new URL(mhref, "https://" + host + "/").toString() }); } catch (e3) {}
            }
          }
          cands.push("https://" + host + "/apple-touch-icon.png");
          cands.push("https://" + host + "/apple-touch-icon-precomposed.png");
          cands.push("https://" + host + "/favicon.ico");
          return cands;
        })
        .then(function (cands) {
          return new Promise(function (resolve, reject) {
            var i = 0;
            function next() {
              if (i >= cands.length) return reject(new Error("none"));
              var c = cands[i++];
              if (c && typeof c === "object" && c.manifest) {
                expandManifest(c.manifest).then(function (u) {
                  if (!u) return next();
                  downloadTile(u).then(resolve, next);
                }, next);
                return;
              }
              downloadTile(c).then(resolve, next);
            }
            next();
          });
        });
    }).then(function (dataUrl) {
      if (!dataUrl) throw new Error("none");
      return idbPut(key, dataUrl).then(function () { return dataUrl; });
    });
  }

  var FAVOR_API = "https://favicon.cccyun.cc/";
  function hostOf(u) { try { return new URL(u).hostname; } catch (e) { return ""; } }
  function fetchIconFor(s) {
    return new Promise(function (res, rej) {
      if (IS_EXT) {
        extIcon(s).then(function (d) { s.icon = d; s.norm = true; s.iconV = 2; res(d); }, rej);
      } else {
        resolveIconOnce(s, function (ok) { ok ? res(s.icon) : rej(new Error("fail")); });
      }
    });
  }

  function makeIcon(s) {
    var ic = document.createElement("div");
    ic.className = "icon";
    if (s.icon) {
      var i0 = document.createElement("img");
      i0.src = s.icon;
      i0.style.objectFit = "cover";
      ic.appendChild(i0);
      return ic;
    }
    ic.style.background = colorOf(s.name);
    ic.textContent = s.name.slice(0, 1);
    if (!s.icon && !s._retried) {
      s._retried = true;
      setTimeout(function () {
        fetchIconFor(s).then(function () { save(); paintDock(); }, function () {});
      }, 120);
    }
    var host = hostOf(s.url);
    if (!host) return ic;
    var img = document.createElement("img");
    img.alt = ""; img.loading = "lazy"; img.referrerPolicy = "no-referrer";
    var stage = 0;
    img.onerror = function () {
      stage++;
      if (stage === 1) { img.src = FAVOR_API + host; return; }
      img.onerror = null;
      if (img.parentNode) img.parentNode.removeChild(img);
    };
    img.onload = function () {
      ic.textContent = "";
      ic.classList.add("light");
      if (!img.parentNode) ic.appendChild(img);
    };
    img.src = "https://" + host + "/favicon.ico";
    return ic;
  }

  function refreshSiteIcons() {
    var defUrls = DEF.shortcuts.map(function (x) { return x.url; });
    var changed = false;
    (S.shortcuts || []).forEach(function (s) {
      if (defUrls.indexOf(s.url) >= 0) return;   // 默认 7 个：固定内置图标
      if (s.iconV === 2) return;                 // 已抓到高清图
      if (s.autoTried === 2) return;             // 只尝试一次，避免反复清掉
      s.icon = null;
      s.custom = false;
      s.autoTried = 2;
      changed = true;
    });
    if (changed) save();
  }

  function normalizeIcons() {
    (S.shortcuts || []).forEach(function (s) {
      if (!s.icon || s.norm) return;
      var img = new Image();
      img.onload = function () {
        try {
          s.icon = composeTile(img, 96);
          s.norm = true;
          save();
          paintDock();
        } catch (e) {}
      };
      img.src = s.icon;
    });
  }

  function paintDock() {
    var d = document.getElementById("dock");
    d.innerHTML = "";
    S.shortcuts.forEach(function (s) {
      var a = document.createElement("a");
      a.className = "tile"; a.href = s.url; a.title = s.name; a.draggable = false;
      var ic = makeIcon(s);
      var nm = document.createElement("span"); nm.textContent = s.name;
      a.appendChild(ic); a.appendChild(nm);
      a.addEventListener("click", function (ev) {
        if (Date.now() - lastDragEnd < 400) { ev.preventDefault(); return; }
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;
        ev.preventDefault();
        var href = a.href;
        a.classList.remove("press");
        void a.offsetWidth;
        a.classList.add("press");
        setTimeout(function () { location.href = href; }, 1250);
      });
      d.appendChild(a);
    });
    var add = document.createElement("div");
    add.className = "addbtn"; add.textContent = "+"; add.title = "添加 / 设置";
    add.onclick = openPanel;
    d.appendChild(add);
    bases = null;
  }

  var FONTS = {
    system: '"Microsoft YaHei UI","Microsoft YaHei","Segoe UI",system-ui,sans-serif',
    segvar: '"Segoe UI Variable Display","Segoe UI Variable Text","Segoe UI",sans-serif',
    segoe: '"Segoe UI","Segoe UI Semilight",Tahoma,sans-serif',
    bahnschrift: 'Bahnschrift,"Segoe UI",sans-serif',
    candara: 'Candara,"Segoe UI",sans-serif',
    yahei: '"Microsoft YaHei UI Light","Microsoft YaHei","微软雅黑 Light",sans-serif',
    dengxian: 'DengXian,"等线",sans-serif',
    helvetica: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    georgia: 'Georgia,"Times New Roman",serif',
    consolas: 'Consolas,Menlo,monospace'
  };

  function sampleLum(el, rect) {
    return new Promise(function (res) {
      try {
        var vw = window.innerWidth, vh = window.innerHeight;
        var sw = el.videoWidth || el.naturalWidth || 0;
        var sh = el.videoHeight || el.naturalHeight || 0;
        if (!sw || !sh) return res(null);
        var scale = Math.max(vw / sw, vh / sh);
        var dw = sw * scale, dh = sh * scale;
        var ox = (vw - dw) / 2, oy = (vh - dh) / 2;
        var sx = Math.max(0, (rect.left - ox) / scale);
        var sy = Math.max(0, (rect.top - oy) / scale);
        var sWidth = Math.min(sw - sx, Math.max(1, rect.width / scale));
        var sHeight = Math.min(sh - sy, Math.max(1, rect.height / scale));
        var cv = document.createElement("canvas");
        cv.width = 40; cv.height = 14;
        var ctx = cv.getContext("2d");
        ctx.drawImage(el, sx, sy, sWidth, sHeight, 0, 0, 40, 14);
        var d = ctx.getImageData(0, 0, 40, 14).data;
        var sum = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
          sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
          n++;
        }
        res(n ? sum / n : null);
      } catch (e) { res(null); }
    });
  }

  window.addEventListener("blur", function () {
    document.body.classList.add("window-blur");
    var vb = document.getElementById("bgvideo");
    if (vb && !vb.paused) { vb.dataset.wasPlaying = "1"; vb.pause(); }
  });
  window.addEventListener("focus", function () {
    document.body.classList.remove("window-blur");
    var vb = document.getElementById("bgvideo");
    setTimeout(ensurePlaying, 150);
    if (vb && vb.dataset.wasPlaying === "1") {
      vb.dataset.wasPlaying = "";
      var pp = vb.play(); if (pp && pp.catch) pp.catch(function () {});
    }
  });

  document.addEventListener("visibilitychange", function () {
    var hidden = document.hidden;
    document.body.classList.toggle("page-hidden", hidden);
    var vid = document.getElementById("bgvideo");
    if (hidden) {
      if (vid && !vid.paused) { vid.dataset.wasPlaying = "1"; vid.pause(); }
    } else {
      if (vid && vid.dataset.wasPlaying === "1") {
        vid.dataset.wasPlaying = "";
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
      }
      refreshContrast();
      setTimeout(ensurePlaying, 120);
      // 回到页面时修复壁纸（窗口切换/通知抢焦点后偶发丢图）
      try {
        if (S.bgMode === "image") {
          var st3 = document.getElementById("stage");
          if (st3 && st3.style.backgroundImage) return;   // stage 兜着，不重载
          setTimeout(function () {
            try {
              var st4 = document.getElementById("stage");
              if (S.bgMode === "image" && (!st4 || !st4.style.backgroundImage)) applyBackground();
            } catch (e2) {}
          }, 350);
        }
      } catch (e) {}
    }
  });

  // 背景自愈：图片模式下背景元素被隐藏时，自动重新应用
  setInterval(function () {
    try {
      if (S.bgMode !== "image") return;
      var b = document.getElementById("bgimg");
      var st2 = document.getElementById("stage");
      if (st2 && st2.style.backgroundImage) return;   // stage 已有壁纸，无需干预
      if (!b) return;
      if (!b.getAttribute("src") && (S.img || S.imgKey)) applyBackground();
    } catch (e) {}
  }, 4000);

  function refreshContrast() {
    var mode = S.bgMode;
    var src = (mode === "video") ? document.getElementById("bgvideo")
            : (mode === "image") ? document.getElementById("bgimg") : null;
    var form = document.getElementById("sf");
    var ok = !!src && !!form && (mode === "video" ? src.videoWidth > 0 : src.naturalWidth > 0);
    if (!ok) {
      document.body.classList.remove("bg-light", "bg-very-light");
      return;
    }
    sampleLum(src, form.getBoundingClientRect()).then(function (lum) {
      if (lum === null) return;
      document.body.classList.toggle("bg-light", lum > 0.18);
      document.body.classList.toggle("bg-very-light", lum > 0.72);
    });
  }

  function applyFont() {
    var f = FONTS[S.font] || FONTS.system;
    var w = S.clockWeight || 400;
    document.documentElement.style.setProperty("--clock-font", f);
    document.documentElement.style.setProperty("--clock-weight", w);
    var sel = document.getElementById("fontSel");
    if (sel && sel.value !== (S.font || "system")) sel.value = S.font || "system";
    ["w300","w400","w600","w700"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle("on", String(w) === id.slice(1));
    });
  }

  function hexLum(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return 1;
    var r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function applyColors() {
    var root = document.documentElement;
    var any = false;
    if (S.fgSearch) {
      any = true;
      root.style.setProperty("--fg-search", S.fgSearch);
      root.style.setProperty("--fg-search-shadow", hexLum(S.fgSearch) > 0.6
        ? "0 1px 3px rgba(0,0,0,.55), 0 0 10px rgba(0,0,0,.35)"
        : "0 1px 3px rgba(255,255,255,.65), 0 0 10px rgba(255,255,255,.45)");
    } else {
      root.style.removeProperty("--fg-search");
      root.style.removeProperty("--fg-search-shadow");
    }
    if (S.fgClock) {
      any = true;
      root.style.setProperty("--fg-clock", S.fgClock);
      root.style.setProperty("--fg-clock-shadow", hexLum(S.fgClock) > 0.6
        ? "0 2px 22px rgba(0,0,0,.35), 0 1px 4px rgba(0,0,0,.35)"
        : "0 2px 24px rgba(255,255,255,.85), 0 1px 4px rgba(255,255,255,.6)");
    } else {
      root.style.removeProperty("--fg-clock");
      root.style.removeProperty("--fg-clock-shadow");
    }
    if (S.fgBorder) {
      document.documentElement.style.setProperty("--fg-border", S.fgBorder);
      document.body.classList.add("custom-border");
    } else {
      document.documentElement.style.removeProperty("--fg-border");
      document.body.classList.remove("custom-border");
    }

    document.body.classList.toggle("custom-fg", any);
    var a = document.getElementById("cSearch");
    if (a && S.fgSearch) a.value = S.fgSearch;
    var b = document.getElementById("cClock");
    if (b && S.fgClock) b.value = S.fgClock;
    var sv = document.getElementById("cSearchVal");
    if (sv) sv.textContent = S.fgSearch ? String(S.fgSearch).toUpperCase() : "自动";
    var cv = document.getElementById("cClockVal");
    if (cv) cv.textContent = S.fgClock ? String(S.fgClock).toUpperCase() : "自动";
    var bv = document.getElementById("cBorderVal");
    if (bv) bv.textContent = S.fgBorder ? String(S.fgBorder).toUpperCase() : "自动";
    var bi = document.getElementById("cBorder");
    if (bi && S.fgBorder) bi.value = S.fgBorder;
    var b3 = document.getElementById("cBorderAuto");
    if (b3) b3.classList.toggle("on", !S.fgBorder);
    var b1 = document.getElementById("cSearchAuto");
    if (b1) b1.classList.toggle("on", !S.fgSearch);
    var b2 = document.getElementById("cClockAuto");
    if (b2) b2.classList.toggle("on", !S.fgClock);
  }

  function applyHistoryLimit() {
    var lim = (S.historyLimit === undefined || S.historyLimit === null) ? 12 : S.historyLimit;
    lim = Math.max(0, Math.min(50, lim));
    if ((S.history || []).length > lim) S.history = (S.history || []).slice(0, lim);
    var el = document.getElementById("histVal");
    if (el) el.textContent = lim === 0 ? "不记录" : lim + " 条";
    var rg = document.getElementById("histRange");
    if (rg && parseInt(rg.value, 10) !== lim) rg.value = lim;
  }

  function applyDock() {
    var v = (S.dockAlpha === undefined || S.dockAlpha === null) ? 40 : S.dockAlpha;
    v = Math.max(0, Math.min(100, v));
    var dark = (0.05 + (v / 100) * 0.28).toFixed(3);
    var light = (0.10 + (v / 100) * 0.55).toFixed(3);
    document.documentElement.style.setProperty("--dock-dark", dark);
    document.documentElement.style.setProperty("--dock-light", light);
    var el = document.getElementById("dockVal");
    if (el) el.textContent = v + "%";
    var rg = document.getElementById("dockRange");
    if (rg && parseInt(rg.value, 10) !== v) rg.value = v;
  }

  function applyTheme() {
    var t = S.theme || "auto";
    var light;
    if (t === "light") light = true;
    else if (t === "dark") light = false;
    else if (t === "system") {
      try { light = !window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { light = false; }
    } else { var hr = new Date().getHours(); light = (hr >= 7 && hr < 19); }
    document.body.classList.toggle("light", light);
  }

  // 跟随系统深浅色变化
  try {
    if (!window.__spThemeWatch) {
      window.__spThemeWatch = true;
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChg = function () { if ((S.theme || "auto") === "system") { try { applyTheme(); } catch (e) {} } };
      if (mq.addEventListener) mq.addEventListener("change", onChg);
      else if (mq.addListener) mq.addListener(onChg);
    }
  } catch (e) {}

  function paintThemeBtns() {
    var map = { dark: "tDark", light: "tLight", auto: "tAuto", system: "tSys" };
    ["tDark","tLight","tAuto","tSys"].forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.remove("on"); });
    var el = document.getElementById(map[S.theme || "auto"]);
    if (el) el.classList.add("on");
  }

  function paintEngine() { document.getElementById("engBtn").textContent = ENG[S.engine].n; }

  function paintModeBtns() {
    var map = { grad: "mGrad", anim: "mAnim", image: "mImg", video: "mVid" };
    ["mGrad","mAnim","mImg","mVid"].forEach(function (id) {
      document.getElementById(id).classList.remove("on");
    });
    var el = document.getElementById(map[S.bgMode] || "mAnim");
    if (el) el.classList.add("on");
  }

  function render() {
    paintClock(); paintDock(); paintEngine(); paintModeBtns(); applyTheme(); paintThemeBtns(); applyDock(); applyFont(); applyHistoryLimit(); applyColors(); applyBackground();
  }

  function resolveIconOnce(s, done) {
    var host = hostOf(s.url);
    if (!host) { done(false, "网址无法解析"); return; }
    var cands = [
      FAVOR_API + host,
      "https://" + host + "/apple-touch-icon.png",
      "https://" + host + "/favicon.ico"
    ];
    var i = 0;
    function next() {
      if (i >= cands.length) { done(false, "站点没提供可保存的图标"); return; }
      var url = cands[i++];
      var img = new Image();
      img.crossOrigin = "anonymous";
      var settled = false;
      var t = setTimeout(function () { if (!settled) { settled = true; next(); } }, 6000);
      img.onload = function () {
        if (settled) return; settled = true; clearTimeout(t);
        try {
          s.icon = composeTile(img, 96);
          s.norm = true;
          done(true, "");
        } catch (e) { next(); }
      };
      img.onerror = function () { if (settled) return; settled = true; clearTimeout(t); next(); };
      img.src = url;
    }
    next();
  }

  var iconPickIndex = -1;
  function pickIcon(i) {
    iconPickIndex = i;
    var inp = document.getElementById("fileIcon");
    if (!inp) {
      inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*"; inp.id = "fileIcon"; inp.style.display = "none";
      inp.onchange = function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f || iconPickIndex < 0) return;
        var r = new FileReader();
        r.onload = function (ev) {
          var img = new Image();
          img.onload = function () {
            S.shortcuts[iconPickIndex].icon = composeTile(img, 96);
            S.shortcuts[iconPickIndex].custom = true;
            S.shortcuts[iconPickIndex].norm = true;
            save(); paintDock(); openPanel();
          };
          img.src = ev.target.result;
        };
        r.readAsDataURL(f);
        inp.value = "";
      };
      document.body.appendChild(inp);
    }
    inp.click();
  }

  function closePanel() {
    var m = document.getElementById("mask");
    if (!m || !m.classList.contains("on") || m.classList.contains("closing")) return;
    m.classList.add("closing");
    setTimeout(function () { m.classList.remove("on"); m.classList.remove("closing"); }, 380);
  }
  function openPanel() {
    setTimeout(function () { try { window.__spUpdateBgPrev && window.__spUpdateBgPrev(); } catch (e) {} }, 60);
    var mk = document.getElementById("mask");
    mk.classList.remove("closing");
    mk.classList.add("on");
    var l = document.getElementById("list");
    l.innerHTML = "";
    S.shortcuts.forEach(function (s, i) {
      var row = document.createElement("div"); row.className = "item";
      var nm = document.createElement("span"); nm.className = "nm"; nm.textContent = s.name;
      var ur = document.createElement("span"); ur.className = "ur"; ur.textContent = s.url;
      var mv = document.createElement("span");
      mv.style.cssText = "display:inline-flex;gap:2px;margin-right:4px;flex:none";
      var ub = document.createElement("button");
      ub.textContent = "↑"; ub.title = "上移";
      ub.style.cssText = "background:none;border:0;color:" + (i === 0 ? "#3c4350" : "#8fb4ff") + ";cursor:pointer;font-size:15px;padding:0 3px;line-height:1";
      if (i === 0) ub.disabled = true;
      ub.onclick = function () {
        if (i <= 0) return;
        var t = S.shortcuts[i - 1]; S.shortcuts[i - 1] = S.shortcuts[i]; S.shortcuts[i] = t;
        save(); paintDock(); openPanel();
      };
      var db = document.createElement("button");
      db.textContent = "↓"; db.title = "下移";
      db.style.cssText = "background:none;border:0;color:" + (i === S.shortcuts.length - 1 ? "#3c4350" : "#8fb4ff") + ";cursor:pointer;font-size:15px;padding:0 3px;line-height:1";
      if (i === S.shortcuts.length - 1) db.disabled = true;
      db.onclick = function () {
        if (i >= S.shortcuts.length - 1) return;
        var t2 = S.shortcuts[i + 1]; S.shortcuts[i + 1] = S.shortcuts[i]; S.shortcuts[i] = t2;
        save(); paintDock(); openPanel();
      };
      mv.appendChild(ub); mv.appendChild(db);
      var up = document.createElement("button");
      up.textContent = "图标"; up.style.cssText = "background:none;border:0;color:#8fb4ff;cursor:pointer;font-size:13px;";
      up.onclick = function () { pickIcon(i); };
      var del = document.createElement("button"); del.className = "del"; del.textContent = "删除";
      del.onclick = function () { S.shortcuts.splice(i, 1); save(); openPanel(); paintDock(); };
      row.appendChild(mv); row.appendChild(nm); row.appendChild(ur); row.appendChild(up); row.appendChild(del); l.appendChild(row);
    });
    paintModeBtns(); paintThemeBtns(); applyDock(); applyFont(); applyHistoryLimit(); applyColors();
  }

  var dockEl = document.getElementById("dock");
  var tipEl = document.createElement("div");
  tipEl.className = "nametip";
  document.body.appendChild(tipEl);
  var bases = null;

  function measureDock() {
    bases = [];
    Array.prototype.forEach.call(dockEl.children, function (t) {
      if (!t.dataset) return;
      bases.push({ el: t, c: t.offsetLeft + t.offsetWidth / 2, w: t.offsetWidth });
    });
  }

  function magnify(e) {
    if (!bases || !bases.length) measureDock();
    var box = dockEl.getBoundingClientRect();
    var x = e.clientX - box.left;
    var maxD = 170;
    bases.forEach(function (b) {
      var d = Math.abs(x - b.c);
      var k = Math.max(0, 1 - d / maxD);
      var s = 1 + 0.24 * k * k;
      b.el.style.transform = "translateY(" + (-(s - 1) * 30).toFixed(1) + "px) scale(" + s.toFixed(3) + ")";
      b.el.style.zIndex = k > 0.02 ? "4" : "";
    });
    var hovered = null, best = 0.02;
    bases.forEach(function (b) {
      var d = Math.abs(x - b.c);
      var k = Math.max(0, 1 - d / (b.w * 0.9));
      if (k > best) { best = k; hovered = b; }
    });
    if (hovered) {
      var name = hovered.el.getAttribute("title") || "";
      if (name) {
        var bb = hovered.el.getBoundingClientRect();
        tipEl.textContent = name;
        tipEl.style.left = (bb.left + bb.width / 2) + "px";
        tipEl.style.top = "auto";
        tipEl.style.bottom = (window.innerHeight - bb.top + 10) + "px";
        tipEl.classList.add("on");
      }
    } else {
      tipEl.classList.remove("on");
    }
  }

  function resetMagnify() {
    if (bases) bases.forEach(function (b) { b.el.style.transform = ""; b.el.style.zIndex = ""; });
    tipEl.classList.remove("on");
  }

  var lastDragEnd = 0;
  var dragState = null;

  dockEl.addEventListener("pointerdown", function (ev) {
    var a = ev.target.closest ? ev.target.closest(".tile") : null;
    if (!a || ev.button) return;
    var tiles = Array.prototype.slice.call(dockEl.querySelectorAll(".tile"));
    var idx = tiles.indexOf(a);
    if (idx < 0) return;
    dragState = { idx: idx, x0: ev.clientX, moved: false, el: a };
  });

  dockEl.addEventListener("pointermove", function (ev) {
    if (!dragState) return;
    if (!dragState.moved) {
      if (Math.abs(ev.clientX - dragState.x0) < 8) return;
      dragState.moved = true;
      dragState.el.classList.add("dragging");
      resetMagnify();
    }
    var tiles = Array.prototype.slice.call(dockEl.querySelectorAll(".tile"));
    var best = dragState.idx, bestD = Infinity;
    tiles.forEach(function (t, i) {
      var r = t.getBoundingClientRect();
      var d = Math.abs(ev.clientX - (r.left + r.width / 2));
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== dragState.idx && best >= 0 && best < S.shortcuts.length) {
      var item = S.shortcuts.splice(dragState.idx, 1)[0];
      S.shortcuts.splice(best, 0, item);
      dragState.idx = best;
      paintDock();
      var nt = dockEl.querySelectorAll(".tile")[best];
      if (nt) { nt.classList.add("dragging"); dragState.el = nt; }
    }
  });

  function endDrag() {
    if (!dragState) return;
    if (dragState.moved) { save(); lastDragEnd = Date.now(); }
    var el = dockEl.querySelector(".dragging");
    if (el) el.classList.remove("dragging");
    dragState = null;
    bases = null;
  }
  dockEl.addEventListener("pointerup", endDrag);
  dockEl.addEventListener("pointercancel", endDrag);
  window.addEventListener("pointerup", endDrag);

  dockEl.addEventListener("mouseenter", function () { measureDock(); });
  var mraf = null;
  dockEl.addEventListener("mousemove", function (e) {
    if (mraf) return;
    var x = e.clientX;
    mraf = requestAnimationFrame(function () { mraf = null; magnify({ clientX: x }); });
  });
  dockEl.addEventListener("mouseleave", resetMagnify);
  window.addEventListener("resize", function () { bases = null; });

  document.getElementById("gear").onclick = openPanel;
  document.getElementById("close").onclick = closePanel;
  document.getElementById("mask").onclick = function (e) {
    if (e.target.id === "mask") closePanel();
  };

  document.getElementById("mGrad").onclick = function () { S.bgMode = "grad"; save(); render(); };
  document.getElementById("mAnim").onclick = function () { S.bgMode = "anim"; save(); render(); };
  document.getElementById("mImg").onclick = function () { S.bgMode = "image"; save(); render(); };
  document.getElementById("mVid").onclick = function () { S.bgMode = "video"; save(); render(); };

  document.getElementById("engBtn").onclick = function () {
    S.engine = S.engine === "bing" ? "baidu" : "bing"; save(); paintEngine();
  };
  document.getElementById("eBing").onclick = function () { S.engine = "bing"; save(); paintEngine(); };
  document.getElementById("eBaidu").onclick = function () { S.engine = "baidu"; save(); paintEngine(); };
  document.getElementById("tDark").onclick = function () { S.theme = "dark"; save(); applyTheme(); paintThemeBtns(); };
  document.getElementById("tLight").onclick = function () { S.theme = "light"; save(); applyTheme(); paintThemeBtns(); };
  document.getElementById("tAuto").onclick = function () { S.theme = "auto"; save(); applyTheme(); paintThemeBtns(); };
  var tSysEl = document.getElementById("tSys");
  if (tSysEl) tSysEl.onclick = function () { S.theme = "system"; save(); applyTheme(); paintThemeBtns(); };

  // 系统深浅色变化时自动跟随
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if ((S.theme || "auto") === "system") applyTheme();
    });
  } catch (e) {}

  (function () {
    var hr = document.getElementById("histRange");
    if (hr) hr.addEventListener("input", function () {
      S.historyLimit = parseInt(hr.value, 10);
      applyHistoryLimit();
    });
    if (hr) hr.addEventListener("change", function () { save(); });
  })();

  (function () {
    var rg = document.getElementById("dockRange");
    if (rg) rg.addEventListener("input", function () {
      S.dockAlpha = parseInt(rg.value, 10);
      applyDock();
    });
    if (rg) rg.addEventListener("change", function () { save(); });
  })();

  (function () {
    var sel = document.getElementById("fontSel");
    if (sel) sel.addEventListener("change", function () { S.font = sel.value; save(); applyFont(); });
    [["w300",300],["w400",400],["w600",600],["w700",700]].forEach(function (p) {
      var el = document.getElementById(p[0]);
      if (el) el.addEventListener("click", function () { S.clockWeight = p[1]; save(); applyFont(); });
    });
  })();

  document.getElementById("h24").onclick = function () { S.clock24 = true; save(); paintClock(); };
  document.getElementById("h12").onclick = function () { S.clock24 = false; save(); paintClock(); };

  document.getElementById("bgDiag") && (document.getElementById("bgDiag").onclick = function () {
    var out = [];
    function done() { toast(out.join(" · ")); }
    var okIdb = false;
    idbPut("__selftest", "ok-" + Date.now()).then(function () {
      return idbGet("__selftest");
    }).then(function (v) {
      okIdb = (v === String(v) || typeof v === "string") && String(v).indexOf("ok-") === 0;
      out.push("IDB:" + (okIdb ? "正常" : "读取异常"));
    }).catch(function (e) {
      out.push("IDB:失败(" + ((e && e.message) || "?") + ")");
    }).then(function () {
      try {
        var probe = new Array(200001).join("x");
        localStorage.setItem("__probe", probe);
        localStorage.removeItem("__probe");
        out.push("本地存储:可写");
      } catch (e2) {
        out.push("本地存储:已满/不可写");
      }
      out.push("图片:" + (S.imgKey ? "IDB" : (S.img ? "本地" : "未设置")));
      out.push("模式:" + S.bgMode);
      done();
    });
  });
    document.getElementById("pickImg").onclick = function () { document.getElementById("fileImg").click(); };
  function updateBgPrev() {
    var im2 = document.getElementById("bgPrev");
    var tip = document.getElementById("bgPrevTip");
    if (!im2 || !tip) return;
    if (S.bgMode !== "image") { im2.style.display = "none"; tip.textContent = "当前不是图片模式"; return; }
    function show(src) {
      if (!src) { im2.style.display = "none"; tip.textContent = "图片读取失败"; return; }
      im2.src = src; im2.style.display = "block";
      im2.onload = function () { tip.textContent = im2.naturalWidth + " × " + im2.naturalHeight; };
    }
    if (S.img) { show(S.img); return; }
    if (!S.imgKey) { im2.style.display = "none"; tip.textContent = "未选择图片"; return; }
    tip.textContent = "读取中…";
    idbGet(S.imgKey).then(function (v) {
      if (v && typeof v !== "string") { show(URL.createObjectURL(v)); }
      else { show(v); }
    }, function () { tip.textContent = "读取失败（请重选一次）"; });
  }
  window.__spUpdateBgPrev = updateBgPrev;

  function setImageFile(f) {
    if (!f) return;
    if (f.size > 40 * 1024 * 1024) { toast("图片太大（>40MB），请先压缩"); return; }
    toast("正在处理图片…");
    var r = new FileReader();
    r.onerror = function () { toast("读取文件失败，换一张试试"); };
    r.onload = function (ev) {
      var img = new Image();
      img.onerror = function () {
        toast("这个格式不支持，请用 jpg / png / webp / bmp");
      };
      img.onload = function () {
        try {
          var max = 2560, sc = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement("canvas");
          cv.width = Math.round(img.width * sc);
          cv.height = Math.round(img.height * sc);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          var dataUrl = cv.toDataURL("image/jpeg", 0.85);
          if (!dataUrl || dataUrl.length < 200) { toast("图片转换失败，换一张试试"); return; }
          S.bgMode = "image";
          var dims = cv.width + "×" + cv.height;
          var saveBlob = new Promise(function (res) {
            try { cv.toBlob(function (b) { res(b || null); }, "image/jpeg", 0.85); }
            catch (e) { res(null); }
          });
          saveBlob.then(function (blob) {
            return idbPut("bgimage", blob || dataUrl);
          }).then(function () {
            S.imgKey = "bgimage"; S.img = "";
            try { save(); } catch (e) {}
            render(); updateBgPrev();
            toast("图片壁纸已设置（" + dims + "）");
          }).catch(function (err) {
            // IDB 不可用：压到 1280 再塞 localStorage
            try {
              var sc2 = Math.min(1, 1280 / Math.max(img.width, img.height));
              var cv2 = document.createElement("canvas");
              cv2.width = Math.round(img.width * sc2);
              cv2.height = Math.round(img.height * sc2);
              cv2.getContext("2d").drawImage(img, 0, 0, cv2.width, cv2.height);
              var small = cv2.toDataURL("image/jpeg", 0.78);
              S.img = small; S.imgKey = ""; save(); render(); updateBgPrev();
              toast("已用备用存储保存（" + cv2.width + "×" + cv2.height + "）");
            } catch (e2) {
              S.img = ""; S.imgKey = "";
              try { save(); } catch (e3) {}
              render(); updateBgPrev();
              toast("保存失败：" + ((err && err.message) || "存储不可用") + "；请先清空壁纸再试");
            }
          });
        } catch (err) {
          toast("处理图片出错：" + (err && err.message ? err.message : "未知"));
        }
      };
      img.src = ev.target.result;
    };
    r.readAsDataURL(f);
  }

  document.getElementById("fileImg").onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) setImageFile(f);
    e.target.value = "";
  };

  document.getElementById("pickVid").onclick = function () { document.getElementById("fileVid").click(); };
  function setVideoFile(f) {
    S.bgMode = "video"; save();
    if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch (er) {} }
    objUrl = URL.createObjectURL(f);
    playVideoSrc(objUrl);
    paintModeBtns();
    idbPut("bgvideo", f).then(function () {
      toast("视频已保存，下次打开自动播放");
    }, function () {
      toast("浏览器不允许持久保存，本次会话内有效（建议改用 bg.mp4 方式）");
    });
  }

  document.getElementById("fileVid").onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) setVideoFile(f);
    e.target.value = "";
  };

  var useFileBtn = document.getElementById("useBgFile");
  if (useFileBtn) useFileBtn.onclick = function () {
    idbDel("bgvideo").then(function () {
      S.bgMode = "video";
      save();
      applyBackground();
      paintModeBtns();
      toast("已改用文件夹中的 bg.mp4");
    }, function () {
      S.bgMode = "video"; save(); applyBackground(); paintModeBtns();
      toast("已切回视频模式");
    });
  };

  document.addEventListener("dragover", function (e) {
    var dt = e.dataTransfer;
    var hasFiles = !!(dt && dt.types && Array.prototype.indexOf.call(dt.types, "Files") >= 0);
    if (!hasFiles) return;            // 拖链接/文字时不显示「松开即可设为壁纸」
    e.preventDefault();
    document.body.classList.add("dropping");
  });
  document.addEventListener("dragleave", function (e) {
    if (!e.relatedTarget) document.body.classList.remove("dropping");
  });
  document.addEventListener("drop", function (e) {
    var dt0 = e.dataTransfer;
    var isFile = !!(dt0 && dt0.types && Array.prototype.indexOf.call(dt0.types, "Files") >= 0);
    document.body.classList.remove("dropping");
    if (!isFile) {                      // 非文件（链接/文本）→ 忽略，避免误设壁纸
      e.preventDefault();
      return;
    }
    e.preventDefault();
    var dt = e.dataTransfer;
    var f = dt && dt.files && dt.files[0];
    if (!f) return;
    if (/^image\//i.test(f.type)) { setImageFile(f); toast("正在设置图片壁纸…"); }
    else if (/^video\//i.test(f.type)) { setVideoFile(f); toast("正在设置视频壁纸…"); }
    else toast("只支持图片或视频文件");
  });

  document.getElementById("add").onclick = function () {
    var n = document.getElementById("newName").value.trim();
    var u = document.getElementById("newUrl").value.trim();
    if (!n || !u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    var item = { name: n, url: u };
    S.shortcuts.push(item);
    save(); openPanel(); paintDock();
    toast("正在获取 " + n + " 的图标…");
    fetchIconFor(item).then(function () {
      save(); paintDock(); openPanel();
      toast("图标已获取并保存到本地");
    }, function () {
      toast("没找到图标，下次打开会再试一次；也可点「图标」手动上传");
    });
    document.getElementById("newName").value = "";
    document.getElementById("newUrl").value = "";
  };

  (function () {
    var cs = document.getElementById("cSearch");
    if (cs) cs.addEventListener("input", function () { S.fgSearch = cs.value; applyColors(); });
    if (cs) cs.addEventListener("change", function () { save(); toast("搜索框颜色：" + cs.value.toUpperCase()); });
    var as = document.getElementById("cSearchAuto");
    if (as) as.onclick = function () { S.fgSearch = ""; save(); applyColors(); toast("搜索框颜色已恢复自动"); };

    var cb = document.getElementById("cBorder");
    if (cb) cb.addEventListener("input", function () { S.fgBorder = cb.value; applyColors(); });
    if (cb) cb.addEventListener("change", function () { save(); toast("搜索框边框：" + cb.value.toUpperCase()); });
    var ab = document.getElementById("cBorderAuto");
    if (ab) ab.onclick = function () { S.fgBorder = ""; save(); applyColors(); toast("边框颜色已恢复自动"); };

    var cc = document.getElementById("cClock");
    if (cc) cc.addEventListener("input", function () { S.fgClock = cc.value; applyColors(); });
    if (cc) cc.addEventListener("change", function () { save(); toast("时间颜色：" + cc.value.toUpperCase()); });
    var ac = document.getElementById("cClockAuto");
    if (ac) ac.onclick = function () { S.fgClock = ""; save(); applyColors(); toast("时间颜色已恢复自动"); };
  })();

  document.getElementById("refetchIcons").onclick = function () {
    var defUrls = DEF.shortcuts.map(function (x) { return x.url; });
    var all = (S.shortcuts || []).filter(function (s) { return defUrls.indexOf(s.url) < 0; });
    if (!all.length) { toast("只有内置的 7 个快捷方式，它们用的是内置图标"); return; }
    var manual = all.filter(function (s) { return s.custom; });
    var targets = all;
    if (manual.length) {
      var names = manual.map(function (s) { return s.name; }).join("、");
      var go = confirm("检测到 " + manual.length + " 个手动设置的图标：\n" + names + "\n\n确定重新抓取会覆盖它们，继续吗？");
      if (!go) { targets = all.filter(function (s) { return !s.custom; }); }
    }
    if (!targets.length) { toast("已取消，手动图标保持不变"); return; }
    targets.forEach(function (s) { s.icon = null; s.iconV = 2; s.custom = false; s.norm = false; });
    save(); paintDock();
    toast("正在抓取 " + targets.length + " 个站点的高清图标…");
    var done = 0, ok = 0;
    targets.forEach(function (s) {
      fetchIconFor(s).then(function () { ok++; }, function () {}).then(function () {
        done++;
        if (done === targets.length) {
          save(); paintDock(); openPanel();
          toast("已更新 " + ok + "/" + targets.length + " 个图标" + (ok < targets.length ? "（部分站点没提供高清图）" : ""));
        }
      });
    });
  };

  document.getElementById("exportCfg").onclick = function () {
    try {
      var slim = {};
      Object.keys(S).forEach(function (k) { if (k !== "playlist" && k.charAt(0) !== "_") slim[k] = S[k]; });
      var data = JSON.stringify(slim, null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "startpage-config.json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      toast("配置已导出，可在新标签页里导入");
    } catch (e) { toast("导出失败：" + e.message); }
  };

  document.getElementById("importCfg").onclick = function () { document.getElementById("cfgFile").click(); };
  document.getElementById("cfgFile").onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function (ev) {
      try {
        var o = JSON.parse(ev.target.result);
        if (!o || typeof o !== "object") throw new Error("格式不对");
        ["engine","bgMode","img","clock24","theme","dockAlpha","font","clockWeight","historyLimit","fgSearch","fgClock","fgBorder","history","shortcuts","overlay","bgBlur","glass","showSeconds","blinkColon","showLunar","showWeather","city","fgWeather","showNotes","notes","notesPinned","imgKey","ctxMenu","prefix","hotkeys","intro","slideshow","slideSec","freeLayout","layout"].forEach(function (k) {
          if (o[k] !== undefined) S[k] = o[k];
        });
        // —— 配置校验：坏字段回退默认，避免 render 时报错 ——
        if (!Array.isArray(S.shortcuts)) S.shortcuts = clone(DEF.shortcuts);
        S.shortcuts = S.shortcuts.filter(function (x) { return x && typeof x.url === "string" && x.url; });
        if (!S.shortcuts.length) S.shortcuts = clone(DEF.shortcuts);
        if (!Array.isArray(S.history)) S.history = [];
        if (S.layout && typeof S.layout !== "object") S.layout = {};
        ["overlay","bgBlur","glass","historyLimit","clockWeight","dockAlpha"].forEach(function (k) {
          if (S[k] !== undefined && (!isFinite(Number(S[k])))) S[k] = DEF[k];
        });
        if (S.img && typeof S.img !== "string") S.img = "";
        save();
        render();
        openPanel();
        toast("配置已导入");
      } catch (err) { toast("导入失败：" + err.message); }
    };
    rd.readAsText(f);
    e.target.value = "";
  };

  document.getElementById("reset").onclick = function () {
    if (!confirm("恢复默认？壁纸和 Dock 都会被重置。")) return;
    var d0 = clone(DEF);
    Object.keys(S).forEach(function (k) { delete S[k]; });
    Object.keys(d0).forEach(function (k) { S[k] = d0[k]; });
    save(); render(); openPanel();
  };

  var sugEl = document.getElementById("sug");
  var qEl = document.getElementById("q");

  /* 搜索聚焦：除搜索框与联想外全部虚化 */
  var blurEl = document.createElement("div");
  blurEl.className = "searchblur";
  (document.querySelector(".ui") || document.body).appendChild(blurEl);
  var quoteEl = document.createElement("div");
  quoteEl.className = "searchquote";
  blurEl.appendChild(quoteEl);
  var QUOTES = [
    ["生活不是等待风暴过去，而是学会在雨中跳舞。","维维安·格林"],
    ["我们都在阴沟里，但仍有人仰望星空。","奥斯卡·王尔德"],
    ["慢慢来，比较快。","木心"],
    ["未经审视的生活不值得过。","苏格拉底"],
    ["重要的不是知道得多，而是知道得真。","笛卡尔"],
    ["真正的自由，是不被情绪牵着走。","爱比克泰德"],
    ["种一棵树最好的时间是十年前，其次是现在。","谚语"],
    ["所谓自由，就是被别人讨厌。","岸见一郎"],
    ["一切伟大的行动和思想，都有一个微不足道的开始。","加缪"],
    ["愿你走出半生，归来仍是少年。","佚名"],
    ["我们唯一恐惧的，就是恐惧本身。","罗斯福"],
    ["人生如逆旅，我亦是行人。","苏轼"],
    ["长风破浪会有时，直挂云帆济沧海。","李白"],
    ["纸上得来终觉浅，绝知此事要躬行。","陆游"],
    ["博学之，审问之，慎思之，明辨之，笃行之。","《礼记》"],
    ["路漫漫其修远兮，吾将上下而求索。","屈原"],
    ["天下难事，必作于易；天下大事，必作于细。","老子"],
    ["不积跬步，无以至千里；不积小流，无以成江海。","荀子"],
    ["知之为知之，不知为不知，是知也。","孔子"],
    ["己所不欲，勿施于人。","孔子"],
    ["学而不思则罔，思而不学则殆。","孔子"],
    ["君子坦荡荡，小人长戚戚。","孔子"],
    ["天行健，君子以自强不息。","《周易》"],
    ["非淡泊无以明志，非宁静无以致远。","诸葛亮"],
    ["先天下之忧而忧，后天下之乐而乐。","范仲淹"],
    ["海纳百川，有容乃大；壁立千仞，无欲则刚。","林则徐"],
    ["横眉冷对千夫指，俯首甘为孺子牛。","鲁迅"],
    ["我以我血荐轩辕。","鲁迅"],
    ["自在飞花轻似梦，无边丝雨细如愁。","秦观"],
    ["落霞与孤鹜齐飞，秋水共长天一色。","王勃"],
    ["青山遮不住，毕竟东流去。","辛弃疾"],
    ["众里寻他千百度，蓦然回首，那人却在灯火阑珊处。","辛弃疾"],
    ["欲把西湖比西子，淡妆浓抹总相宜。","苏轼"],
    ["夜阑卧听风吹雨，铁马冰河入梦来。","陆游"],
    ["莫听穿林打叶声，何妨吟啸且徐行。","苏轼"],
    ["竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。","苏轼"],
    ["行到水穷处，坐看云起时。","王维"],
    ["心之所向，素履以往；生如逆旅，一苇以航。","《诗经》化用"],
    ["愿你成为自己的太阳，无需凭借谁的光。","佚名"],
    ["把每一天活成最后一天，也别把今天活成末日。","佚名"],
    ["与其抱怨黑暗，不如点亮一支蜡烛。","佚名"],
    ["你若盛开，清风自来。","佚名"],
    ["人生没有白走的路，每一步都算数。","佚名"],
    ["所有的坚持，终将美好。","佚名"],
    ["不必因為走得太慢而焦慮，重要的是不停下。","佚名"],
    ["把喜欢的事做到极致，便是才华。","佚名"],
    ["允许一切发生，也允许自己慢慢来。","佚名"],
    ["别急，时间会替你筛掉不重要的东西。","佚名"],
    ["愿你相对辛苦但绝对优秀。","佚名"],
    ["做你喜欢的事，就不算在工作。","巴菲特"],
    ["如果你知道自己要去哪里，全世界都会为你让路。","佚名"],
    ["勇气不是没有恐惧，而是带着恐惧继续前行。","马克·吐温"],
    ["成功的秘诀在于坚持到最后一分钟。","爱迪生"],
    ["天才是百分之一的灵感加百分之九十九的汗水。","爱迪生"],
    ["我思故我在。","笛卡尔"],
    ["人生而自由，却无往不在枷锁之中。","卢梭"],
    ["凡是过往，皆为序章。","莎士比亚"],
    ["簡洁是终极的精致。","达·芬奇"],
    ["把时间花在值得的人和事上。","佚名"],
    ["不要因为走得太远，而忘记为什么出发。","纪伯伦"]
  ];
  var QUOTE_CACHE = "spQuoteDaily2";
  function renderQuote(text, by) {
    quoteEl.innerHTML = '“' + text + '”<span class="by">— ' + by + '</span>';
  }
  function todayKey() {
    var n = new Date();
    return n.getFullYear() + "-" + (n.getMonth() + 1) + "-" + n.getDate();
  }
  function localDaily() {
    var now = new Date();
    var dayNum = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    var q = QUOTES[((dayNum % QUOTES.length) + QUOTES.length) % QUOTES.length];
    return { t: q[0], f: q[1] };
  }
  function showQuote() {
    var key = todayKey();
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(QUOTE_CACHE) || "null"); } catch (e) {}
    if (cached && cached.k === key && cached.t) { renderQuote(cached.t, cached.f || ""); return; }

    var fallback = localDaily();
    renderQuote(fallback.t, fallback.f);   // 先给本地兜底，联网成功再替换
    fetch("https://v1.jinrishici.com/all.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.content) return;
        var by = (j.author || "") + (j.origin ? "《" + j.origin + "》" : "");
        renderQuote(j.content, by || "佚名");
        try { localStorage.setItem(QUOTE_CACHE, JSON.stringify({ k: key, t: j.content, f: by })); } catch (e) {}
      })
      .catch(function () {});
  }
  function showSearchBlur() { showQuote(); blurEl.classList.add("on"); }
  function hideSearchBlur() { blurEl.classList.remove("on"); }
  qEl.addEventListener("focus", showSearchBlur);
  qEl.addEventListener("blur", function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (a && a.closest && a.closest(".searchwrap")) return;
      hideSearchBlur();
    }, 160);
  });
  blurEl.addEventListener("mousedown", function (ev) { ev.preventDefault(); hideSearchBlur(); qEl.blur(); });
  qEl.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { hideSearchBlur(); qEl.blur(); } });
  var sf = document.getElementById("sf");
  if (sf) sf.addEventListener("submit", function () { hideSearchBlur(); });
  var sugItems = [], selIdx = -1, sugTimer = null, jsonpN = 0;

  function hideSug() { sugEl.classList.remove("on"); sugItems = []; selIdx = -1; }

  function pushHistory(q) {
    var lim = (S.historyLimit === undefined || S.historyLimit === null) ? 12 : S.historyLimit;
    if (!lim) return;
    if (!q || q.length > 60) return;
    S.history = (S.history || []).filter(function (x) { return x !== q; });
    S.history.unshift(q);
    S.history = S.history.slice(0, lim);
    save();
  }

  function renderList(kind, list, q) {
    sugItems = list.slice();
    selIdx = -1;
    if (!list.length) { hideSug(); return; }
    var html = "";
    if (kind === "history") {
      html += '<div class="hd"><b>搜索历史</b><span class="clr" id="clrHis">清空</span></div>';
    } else {
      html += '<div class="hd"><b>搜索建议</b><span style="opacity:.6">' + (S.engine === "baidu" ? "百度" : "必应") + '</span></div>';
    }
    list.forEach(function (s, i) {
      var t = s.replace(/[<>&"]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]; });
      html += '<div class="it" data-i="' + i + '"><span class="tx">' + t + '</span>' +
              (kind === "history" ? '<span class="rm" data-rm="' + i + '">&#10005;</span>' : '') + '</div>';
    });
    sugEl.innerHTML = html;
    sugEl.classList.add("on");
    var clr = document.getElementById("clrHis");
    if (clr) clr.onclick = function (ev) { ev.stopPropagation(); S.history = []; save(); hideSug(); };
    Array.prototype.forEach.call(sugEl.querySelectorAll(".it"), function (el) {
      el.onclick = function (ev) {
        if (ev.target.dataset && ev.target.dataset.rm !== undefined) {
          var i = parseInt(ev.target.dataset.rm, 10);
          S.history.splice(i, 1); save();
          if (S.history.length) renderList("history", S.history, ""); else hideSug();
          ev.stopPropagation();
          return;
        }
        var v = sugItems[parseInt(el.dataset.i, 10)];
        qEl.value = v;
        hideSug();
        doSearch(v);
      };
    });
  }

  function jsonp(url, cb, cs) {
    var name = "__sp_cb" + (++jsonpN);
    var sc = document.createElement("script");
    var done = false;
    function cleanup() {
      if (done) return; done = true;
      try { delete window[name]; } catch (e) { window[name] = undefined; }
      if (sc.parentNode) sc.parentNode.removeChild(sc);
    }
    window[name] = function (d) { cleanup(); cb(d); };
    sc.charset = cs || "utf-8";
    sc.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "cb=" + name;
    sc.onerror = function () { cleanup(); cb(null); };
    document.body.appendChild(sc);
    setTimeout(function () { if (!done) { cleanup(); cb(null); } }, 2500);
  }

  function applySug(list, q) {
    if (qEl.value.trim() !== q) return;
    list = (list || []).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    if (!list.length) { hideSug(); return; }
    renderList("sug", list.slice(0, 8), q);
  }

  function tryJson(urls) {
    var i = 0;
    function step() {
      if (i >= urls.length) return Promise.reject(new Error("all-failed"));
      var u = urls[i++];
      return fetch(u, { credentials: "omit", cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
        .then(function (t) { if (!t || t.length < 2) throw new Error("empty"); return t; })
        .catch(function (err) { console.warn("[联想] 失败:", u, err && err.message); return step(); });
    }
    return step();
  }

  function parseBing(txt) {
    try {
      var d = JSON.parse(txt);
      if (Array.isArray(d) && Array.isArray(d[1])) return d[1];
      if (d && d.AS && d.AS.Results) {
        var out = [];
        d.AS.Results.forEach(function (r) {
          (r.Suggests || []).forEach(function (x) { if (x && x.Txt) out.push(x.Txt); });
        });
        return out;
      }
    } catch (e) {}
    var m = /\["([\s\S]*)"\]/.exec(txt);
    return [];
  }

  function parseBaiduJson(txt) {
    try {
      var d = JSON.parse(txt);
      if (d && Array.isArray(d.g)) return d.g.map(function (x) { return x.q; }).filter(Boolean);
      if (d && Array.isArray(d.s)) return d.s;
    } catch (e) {}
    return [];
  }

  function parseBaiduGbk(txt) {
    var m = /s\s*:\s*(\[[\s\S]*?\])/.exec(txt || "");
    if (!m) return [];
    try { return JSON.parse(m[1]); } catch (e) { return []; }
  }

  function fetchSuggest(q) {
    var isBaidu = (S.engine === "baidu");
    var isExt = !!(window.chrome && chrome.runtime && chrome.runtime.id);

    if (!isExt) {
      // 普通网页：JSONP 可用
      var url = isBaidu
        ? "https://suggestion.baidu.com/su?wd=" + encodeURIComponent(q)
        : "https://api.bing.com/qsonhs.aspx?type=cb&q=" + encodeURIComponent(q);
      jsonp(url, function (d) {
        var list = [];
        if (d) {
          if (isBaidu) { list = d.s || []; }
          else if (d.AS && d.AS.Results) {
            d.AS.Results.forEach(function (r) {
              (r.Suggests || []).forEach(function (x) { if (x && x.Txt) list.push(x.Txt); });
            });
          }
        }
        applySug(list, q);
      }, isBaidu ? "gbk" : "utf-8");
      return;
    }

    // 扩展环境：fetch 多端点兜底
    var urls = isBaidu
      ? [
          "https://www.baidu.com/sugrec?prod=pc&wd=" + encodeURIComponent(q),
          "https://suggestion.baidu.com/su?wd=" + encodeURIComponent(q) + "&json=1",
          "https://cn.bing.com/osjson.aspx?query=" + encodeURIComponent(q)
        ]
      : [
          "https://cn.bing.com/osjson.aspx?query=" + encodeURIComponent(q),
          "https://api.bing.com/osjson.aspx?query=" + encodeURIComponent(q),
          "https://www.bing.com/osjson.aspx?query=" + encodeURIComponent(q),
          "https://www.baidu.com/sugrec?prod=pc&wd=" + encodeURIComponent(q)
        ];

    tryJson(urls).then(function (txt) {
      var list = isBaidu ? parseBaiduJson(txt) : parseBing(txt);
      if (!list.length) list = parseBaiduJson(txt).length ? parseBaiduJson(txt) : parseBing(txt);
      applySug(list, q);
    }).catch(function () {
      console.warn("[联想] 所有端点均失败");
      hideSug();
    });
  }

  function doSearch(q) {
    q = (q || "").trim();
    if (!q) return;
    pushHistory(q);
    if (/^https?:\/\//i.test(q)) { location.href = q; return; }
    if (/^[\w-]+(\.[\w-]+)+([\/?#].*)?$/.test(q) && q.indexOf(" ") < 0) { location.href = "https://" + q; return; }
    location.href = ENG[S.engine].u + encodeURIComponent(q);
  }

  qEl.addEventListener("focus", function () {
    if (!qEl.value.trim() && (S.history || []).length) renderList("history", S.history, "");
  });

  qEl.addEventListener("input", function () {
    clearTimeout(sugTimer);
    var q = qEl.value.trim();
    if (!q) {
      if ((S.history || []).length) renderList("history", S.history, ""); else hideSug();
      return;
    }
    sugTimer = setTimeout(function () { fetchSuggest(q); }, 220);
  });

  qEl.addEventListener("blur", function () { setTimeout(hideSug, 160); });

  qEl.addEventListener("keydown", function (e) {
    if (!sugEl.classList.contains("on") || !sugItems.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); selIdx = Math.min(selIdx + 1, sugItems.length - 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); selIdx = Math.max(selIdx - 1, -1); mark(); }
    else if (e.key === "Enter" && selIdx >= 0) { e.preventDefault(); var v = sugItems[selIdx]; qEl.value = v; hideSug(); doSearch(v); }
    function mark() {
      Array.prototype.forEach.call(sugEl.querySelectorAll(".it"), function (el, i) {
        el.classList.toggle("sel", i === selIdx);
      });
    }
  });

  document.getElementById("sf").onsubmit = function (e) {
    e.preventDefault();
    hideSug();
    doSearch(qEl.value);
  };

  document.addEventListener("keydown", function (e) {
    var _ae = document.activeElement;
    var _typing = _ae && (/^(INPUT|TEXTAREA|SELECT)$/.test(_ae.tagName) || _ae.isContentEditable);
    var _panelOn = document.getElementById("mask").classList.contains("on");
    if (e.key === "/" && !_typing && !_panelOn && _ae !== qEl) {
      e.preventDefault(); qEl.focus();
    }
    if (e.key === "Escape") {
      closePanel();
      document.getElementById("q").blur();
    }
  });

  var __idbP = null;
  function idbOpen() {
    if (__idbP) return __idbP;
    __idbP = new Promise(function (resolve, reject) {
      function openWith(version) {
        var rq = version ? indexedDB.open("startpage", version) : indexedDB.open("startpage");
        rq.onupgradeneeded = function () {
          try { if (!rq.result.objectStoreNames.contains("assets")) rq.result.createObjectStore("assets"); } catch (e) {}
        };
        rq.onsuccess = function () {
          var db = rq.result;
          if (!db.objectStoreNames.contains("assets")) {
            var v = db.version + 1;
            try { db.close(); } catch (e) {}
            __idbP = null;
            openWith(v);
            return;
          }
          db.onversionchange = function () { try { db.close(); } catch (e) {} __idbP = null; };
          resolve(db);
        };
        rq.onerror = function () { __idbP = null; reject(rq.error || new Error("idb")); };
        rq.onblocked = function () { __idbP = null; reject(new Error("idb blocked：请关闭其他新标签页后重试")); };
      }
      try { openWith(0); } catch (e) { __idbP = null; reject(e); }
    });
    return __idbP;
  }
  function idbReset() { __idbP = null; }
  function idbPut(k, val) {
    return idbOpen().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction("assets", "readwrite");
        tx.objectStore("assets").put(val, k);
        tx.oncomplete = function () { res(true); };
        tx.onerror = function () { idbReset(); rej(tx.error); };
      });
    });
  }
  function idbDel(k) {
    return idbOpen().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction("assets", "readwrite");
        tx.objectStore("assets").delete(k);
        tx.oncomplete = function () { res(true); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }

  function idbGet(k) {
    return idbOpen().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction("assets", "readonly");
        var rq = tx.objectStore("assets").get(k);
        rq.onsuccess = function () { res(rq.result || null); };
        rq.onerror = function () { rej(rq.error); };
      });
    });
  }

  S = load();
  save();
  (function migrateBigImage() {
    try {
      if (S.img && S.img.indexOf("data:") === 0 && S.img.length > 600000 && !S.imgKey) {
        idbPut("bgimage", S.img).then(function () {
          S.imgKey = "bgimage"; S.img = "";
          try { save(); } catch (e) {}
          if (S.bgMode === "image") applyBackground();
        }, function () {});
      }
    } catch (e) {}
  })();
  refreshSiteIcons();
  render();
  refreshContrast();
  setInterval(function () {
    if (document.hidden) return;
    if (S.bgMode !== "image" && S.bgMode !== "video") return;
    refreshContrast();
  }, 10000);
  window.addEventListener("resize", function () { setTimeout(refreshContrast, 300); });
  normalizeIcons();
  setInterval(paintClock, 1000);
  setTimeout(ensurePlaying, 1500);

  window.__sp = {
    syncGlobalDock: syncGlobalDock,
    get S() { return S; },
    ENG: ENG,
    save: save, render: render, paintDock: paintDock, paintClock: paintClock, applyTheme: applyTheme,
    applyBackground: applyBackground, applyColors: applyColors,
    toast: toast, hostOf: hostOf, openPanel: openPanel,
    setImageFile: setImageFile, setVideoFile: setVideoFile,
    idbGet: idbGet, idbPut: idbPut, idbDel: idbDel,
    DEF: DEF, refreshContrast: refreshContrast, pickIcon: pickIcon
  };
})();
