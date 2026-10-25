/* خدمات جاویدان سرویس — admin/js/admin-dashboard.js : داشبورد و چک‌لیست پیش از راه‌اندازی */
(function (root) {
  'use strict';
  var M = root.Javidan, A = root.JavidanAdmin, U = root.JavidanUI, V = root.JavidanViews, esc = M.esc;
  var DEF = root.JAVIDAN_DEFAULTS.settings;

  function checklist() {
    var s = A.site.settings, items = [];
    function add(ok, title, desc, go) { items.push({ ok: ok, title: title, desc: desc, go: go }); }
    add(s.phone && s.phone !== DEF.phone, 'شماره تلفن واقعی', 'شماره ثابت فعلی نمونه است.', 'site');
    add(s.mobile && s.mobile !== DEF.mobile, 'شماره موبایل واقعی', 'شماره‌ی نمونه هنوز در سایت است.', 'site');
    add(s.whatsapp && s.whatsapp !== DEF.whatsapp, 'شماره واتساپ واقعی', 'دکمه‌ی واتساپ سایت با این شماره کار می‌کند.', 'site');
    add(s.address && s.address !== DEF.address, 'نشانی دفتر', 'نشانی هنوز متن نمونه است.', 'site');
    add(A.mode === 'server' ? !A.mustChange : true, 'تغییر رمز پیش‌فرض مدیر', 'رمز پیش‌فرض باید عوض شود.', 'system');
    add(A.site.reviews.some(function (r) { return r.text; }), 'افزودن چند نظر مشتری (اختیاری)', 'تا وقتی نظری ثبت نشود، بخش نظرات در سایت نمایش داده نمی‌شود.', 'content');
    add(!!(s.instagram || s.telegram), 'شبکه‌های اجتماعی (اختیاری)', 'لینک اینستاگرام یا تلگرام را اضافه کنید.', 'site');
    return items;
  }

  V.register({ id: 'dashboard', title: 'داشبورد', icon: 'chart', render: function (el) {
    var c = A.cols, prods = A.site.products;
    var chk = checklist(), todo = chk.filter(function (x) { return !x.ok; }).length;

    el.innerHTML = '<div class="stack">' +
      '<div id="secWarn" hidden class="hint warn" style="border-color:rgba(255,107,122,.5);background:rgba(255,107,122,.12);color:#ffd2d7"><b>هشدار امنیتی:</b> پوشه‌ی <span class="ltr">data/private</span> از بیرون قابل دسترسی است! اگر سرور شما Apache نیست (مثلاً Nginx)، باید دسترسی این پوشه را مطابق README ببندید یا آن را بیرون از public_html قرار دهید.</div>' +
      (A.mode === 'local' ? '<div class="hint warn"><b>حالت پیش‌نمایش (بدون سرور PHP):</b> تغییرات و سفارش‌ها فقط در همین مرورگر ذخیره می‌شوند. برای کار واقعی، سایت را روی هاست دارای PHP آپلود کنید (راهنما در README). برای ساخت نسخه‌ی عمومی، از «امنیت و پشتیبان» فایل site-data.json را بگیرید.</div>' : '') +
      '<div class="kpis">' +
      kpi('box', prods.filter(function (p) { return p.active !== false; }).length + ' / ' + prods.length, 'محصول فعال / کل', 'products') + '</div>' +

      '<div class="grid g2" style="align-items:start">' +
      '<section class="card"><h3>' + M.icon('check') + 'چک‌لیست پیش از راه‌اندازی' + (todo ? ' ' + U.pill(M.toFa(todo) + ' مورد مانده', 'warn') : ' ' + U.pill('همه چیز آماده است', 'ok')) + '</h3><ul class="check">' +
      chk.map(function (x) { return '<li class="' + (x.ok ? 'ok' : 'todo') + '">' + M.icon(x.ok ? 'check' : 'alert') + '<div><b>' + esc(x.title) + '</b><span>' + esc(x.desc) + '</span></div>' + (x.ok ? '' : '<a href="#/' + x.go + '">برو</a>') + '</li>'; }).join('') + '</ul></section>' +

      '<div class="stack">' +
      '<section class="card"><h3>' + M.icon('bolt') + 'دسترسی سریع</h3><div class="toolbar" style="margin:0">' +
      '<a class="btn" href="#/products">' + M.icon('tag') + 'ویرایش محصولات</a><a class="btn" href="#/site">' + M.icon('edit') + 'ویرایش اطلاعات سایت</a>' +
      '<a class="btn" href="#/system">' + M.icon('database') + 'پشتیبان‌گیری</a></div></section></div>';

    if (A.mode === 'server') {
      fetch('../data/private/auth.json', { cache: 'no-store' }).then(function (r) { if (r.ok) { var w = U.$('#secWarn', el); if (w) w.hidden = false; } }).catch(function () {});
    }
    function kpi(icon, val, label, go) {
      return '<a class="kpi" href="#/' + go + '" style="text-decoration:none;color:inherit">' + M.icon(icon) + '<b>' + (typeof val === 'number' ? M.toFa(val) : M.toFa(val)) + '</b><span>' + label + '</span></a>';
    }
  } });
})(window);
