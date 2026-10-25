/* ==========================================================================
   خدمات جاویدان سرویس — js/modules/products.js
   فهرست محصولات (فقط نمایشی): فیلتر دسته‌بندی، جستجو، مرتب‌سازی بر اساس نام
   ========================================================================== */
(function (root) {
  'use strict';
  var M = root.Javidan, $ = M.$, $$ = M.$$, esc = M.esc;
  var P = M.products = { state: { cat: 'all', q: '', sort: 'default' } };

  function norm(s) {
    return M.toEn(s).toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\s‌‏]+/g, '');
  }

  P.list = function () {
    var d = M.store.data, st = P.state, q = norm(st.q);
    var list = M.store.activeProducts().filter(function (p) {
      if (st.cat !== 'all' && p.cat !== st.cat) return false;
      if (!q) return true;
      var c = M.store.categoryById(p.cat);
      return norm(p.name).indexOf(q) > -1 || (c && norm(c.name).indexOf(q) > -1) || norm(p.desc || '').indexOf(q) > -1;
    });
    if (st.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'fa'); });
    return list;
  };

  P.renderChips = function () {
    var d = M.store.data, act = M.store.activeProducts();
    var html = '<button class="fchip' + (P.state.cat === 'all' ? ' active' : '') + '" data-cat="all" type="button">همه<small>' + M.toFa(act.length) + '</small></button>';
    d.categories.forEach(function (c) {
      var n = act.filter(function (p) { return p.cat === c.id; }).length;
      if (!n) return;
      html += '<button class="fchip' + (P.state.cat === c.id ? ' active' : '') + '" data-cat="' + esc(c.id) + '" type="button">' + esc(c.name) + '<small>' + M.toFa(n) + '</small></button>';
    });
    $('#catChips').innerHTML = html;
  };

  function card(p, i) {
    var c = M.store.categoryById(p.cat);
    return '<article class="p-card" data-reveal="up" data-id="' + esc(p.id) + '" style="--d:' + ((i % 4) * 0.06).toFixed(2) + 's">' +
      '<div class="p-icon">' + M.productIcon(p.icon) + '</div>' +
      '<div class="p-body"><h3 class="p-title">' + esc(p.name) + '</h3>' + (c ? '<span class="p-cat">' + esc(c.name) + '</span>' : '') + (p.desc ? '<p class="p-desc">' + esc(p.desc) + '</p>' : '') + '</div></article>';
  }

  P.render = function () {
    var list = P.list(), grid = $('#productGrid');
    grid.innerHTML = list.length ? list.map(card).join('') :
      '<div class="no-results">' + M.icon('search') + '<p>محصولی با این مشخصات پیدا نشد.</p></div>';
    $('#resultMeta').textContent = M.toFa(list.length) + ' محصول' + (P.state.q ? ' برای «' + P.state.q + '»' : '');
    if (M.motion) M.motion.observe(grid);
    if (M.fx) M.fx.refresh(grid);
  };

  P.setCategory = function (id, scroll) {
    P.state.cat = id; P.renderChips(); P.render();
    if (scroll) { var el = $('#products'); if (el) el.scrollIntoView({ behavior: M.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
  };

  P.init = function () {
    P.renderChips(); P.render();
    $('#catChips').addEventListener('click', function (e) {
      var b = e.target.closest('.fchip'); if (b) P.setCategory(b.dataset.cat);
    });
    $('#productSearch').addEventListener('input', M.debounce(function (e) { P.state.q = e.target.value.trim(); P.render(); }, 180));
    $('#productSort').addEventListener('change', function (e) { P.state.sort = e.target.value; P.render(); });
  };
})(window);
