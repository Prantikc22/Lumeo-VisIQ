// packages/sdk/src/loader.ts
(function () {
    "use strict";
    var w = window as any, d = document;
    var s = d.currentScript as HTMLScriptElement;
  
    // required from customer
    var SITE_KEY = s?.getAttribute("data-sitekey") || "";
  
    // ✅ default API base: data-attr → same-origin /api (good for customers) → last-resort localhost
    var API_BASE = (
        s?.getAttribute("data-api-base") || "https://lumeovisiq.com/api"
      ).replace(/\/+$/, "");
      
  
    if (!SITE_KEY) { console.warn("[VisitorIQ] Missing data-sitekey on loader <script>"); return; }
  
    // compute base URL to load index.min.js from same package/version as loader
    function baseFromScript(src: string) {
      try { const u = new URL(src); u.pathname = u.pathname.replace(/[^/]+$/, ""); return u.origin + u.pathname; }
      catch { return ""; }
    }
    var LOADER_BASE = baseFromScript((s && s.src) || "");
    var INDEX_SRC = LOADER_BASE + "index.min.js";
    var TM_SRC = "https://cdn.jsdelivr.net/npm/@thumbmarkjs/thumbmarkjs/dist/thumbmark.umd.js";
    var BOTD_SRC = "https://openfpcdn.io/botd/v1";
  
    // ✅ allow opting into CORS only when needed
    function loadScript(src: string, useCors = false) {
      return new Promise<void>(function (resolve, reject) {
        var el = d.createElement("script");
        el.src = src;
        el.async = true;
        if (useCors) el.crossOrigin = "anonymous"; // <-- only when true
        el.onload = function(){ resolve(); };
        el.onerror = function(){ reject(new Error("load error: " + src)); };
        d.head.appendChild(el);
      });
    }
  
    function overlayBlock(msg?: string) {
      var o = d.createElement("div");
      o.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#0b0b0be6;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:18px;text-align:center;";
      o.textContent = msg || "Access denied: Your device is blocked.";
      d.documentElement.appendChild(o);
      d.documentElement.style.overflow = "hidden";
    }
  
    function getThumbmark() {
      if (w.ThumbmarkJS && w.ThumbmarkJS.Thumbmark) {
        try { return new w.ThumbmarkJS.Thumbmark().get(); } catch { /* noop */ }
      }
      // ✅ third‑party CDN → CORS ok
      return loadScript(TM_SRC, true).then(function () {
        try { return new w.ThumbmarkJS.Thumbmark().get(); } catch { return { thumbmark: "" }; }
      });
    }
  
    function checkBlocked(fp: string) {
      var url = API_BASE + "/blocks?siteKey=" + encodeURIComponent(SITE_KEY) + "&fp=" + encodeURIComponent(fp || "");
      return fetch(url, { method: "GET", mode: "cors", headers: { "x-usage-track": "true" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data) return false;
          if (typeof data.blocked === "boolean") return data.blocked;
          if (Array.isArray(data.blocks)) return !!data.blocks.some(function (b: any) { return b && b.value === fp; });
          return false;
        })
        .catch(function () { return false; });
    }
  
    function getBotd() {
      if (w.Botd) { try { return w.Botd.load().then((b: any) => b.detect()); } catch { return Promise.resolve(null); } }
      // ✅ third‑party CDN → CORS ok
      return loadScript(BOTD_SRC, true)
        .then(function () { try { return w.Botd.load().then((b: any) => b.detect()); } catch { return null; } })
        .catch(function () { return null; });
    }
  
    function start() {
      Promise.resolve()
        .then(getThumbmark)
        .then(function (tm: any) {
          var fp = (tm && tm.thumbmark) || "";
          return checkBlocked(fp).then(function (blocked) {
            if (blocked) { overlayBlock("Access denied: Your device is blocked."); return null; }
            return getBotd().then(function (botd: any) { return { botd: botd }; });
          });
        })
        .then(function (ctx: any) {
          if (!ctx) return; // blocked
          // ✅ YOUR SDK: do NOT force CORS here
          return loadScript(INDEX_SRC, false).then(function () {
            if (w.visitoriq && typeof w.visitoriq.init === "function") {
              w.visitoriq.init({
                siteKey: SITE_KEY,
                endpoint: API_BASE + "/collect-visitor",
                botd_result: ctx.botd
              });
            } else {
              console.warn("[VisitorIQ] visitoriq.init missing. Check index.min.js path:", INDEX_SRC);
            }
          });
        })
        .catch(function () { /* swallow non-fatal */ });
    }
  
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
  })();
  