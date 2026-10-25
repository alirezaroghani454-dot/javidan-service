/* ==========================================================================
   خدمات جاویدان سرویس — js/main.js
   نقطه‌ی شروع: بارگذاری داده → ساخت صفحه → فعال‌سازی افکت‌ها
   ========================================================================== */
(function (root) {
  'use strict';
  var M = root.Javidan;

  function safe(name, fn) {
    try { fn(); } catch (e) { if (root.console) console.error('[جاویدان] خطا در ' + name + ':', e); }
  }

  function boot() {
    M.injectIconDefs();
    M.hydrateIcons(document);
    M.ui.hidePreloader(function () { safe('hero', function () { M.motion.splitWords(M.$('#heroTitle')); }); });

    M.store.load().then(function () {
      var d = M.store.data;
      safe('render', function () { M.render.all(d); });
      safe('faq', M.render.bindFaq);
      safe('products', M.products.init);
      safe('shell', M.ui.init);
      safe('fx', M.fx.init);
      safe('motion', M.motion.init);
      var nm = d.settings.showDemoHint; void nm;
    }).catch(function (e) {
      if (root.console) console.error(e);
      document.documentElement.classList.add('no-motion'); document.body.classList.add('ready');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
