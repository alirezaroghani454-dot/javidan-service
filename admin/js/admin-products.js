/* خدمات جاویدان سرویس — admin/js/admin-products.js : مدیریت محصولات (فقط نمایشی، بدون قیمت) */
(function (root) {
  'use strict';
  var M = root.Javidan, A = root.JavidanAdmin, U = root.JavidanUI, V = root.JavidanViews, esc = M.esc;
  var F = { q: '', cat: '', st: '' }, sel = {};

  function filtered() {
    var q = M.toEn(F.q).trim().toLowerCase();
    return A.site.products.filter(function (p) {
      if (F.cat && p.cat !== F.cat) return false;
      if (F.st === 'on' && p.active === false) return false;
      if (F.st === 'off' && p.active !== false) return false;
      if (q && (p.name + ' ' + (p.desc || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function nextId() {
    var n = 0; A.site.products.forEach(function (p) { var m = /^p(\d+)$/.exec(p.id); if (m) n = Math.max(n, +m[1]); });
    n++; return 'p' + (n < 10 ? '0' + n : n);
  }

  function editModal(p, rerender) {
    var isNew = !p; p = p || { id: nextId(), name: '', cat: (A.site.categories[0] || {}).id || '', price: 0, icon: 'appliance', desc: '', active: true };
    var cats = A.site.categories.map(function (c) { return [c.id, c.name]; });
    var body = '<form class="grid g2" id="pf" novalidate>' +
      U.field('name', 'نام محصول', p.name, { span: true }) +
      U.field('cat', 'دسته‌بندی', p.cat, { type: 'select', options: cats }) +
      U.field('icon', 'آیکون محصول', p.icon, { type: 'select', options: U.PRODUCT_ICON_CHOICES() }) +
      U.field('active', 'فعال و قابل نمایش در سایت', p.active !== false, { type: 'checkbox' }) +
      U.field('desc', 'توضیح کوتاه (اختیاری)', p.desc, { type: 'textarea', span: true, rows: 2 }) + '</form>';
    U.modal({ title: isNew ? 'محصول جدید' : 'ویرایش محصول', body: body, onOpen: function (m) { U.bindMoney(m); }, actions: [
      { label: 'ذخیره', cls: 'gold', icon: 'check', onClick: function (m, close) {
        var d = U.read(U.$('#pf', m));
        if (d.name.length < 2) { U.toast('نام محصول را وارد کنید', 'err'); return; }
        p.name = d.name; p.cat = d.cat; p.price = 0; p.icon = d.icon; p.desc = d.desc; p.active = d.active;
        if (isNew) A.site.products.push(p);
        A.markDirty(); close(); rerender();
      } }, { label: 'انصراف', cls: 'ghost' }] });
  }

  V.register({ id: 'products', title: 'محصولات', icon: 'tag', render: function (el) {
    function draw() {
      var list = filtered(), all = A.site.products, noFilter = !F.q && !F.cat && !F.st;
      el.innerHTML = '<div class="stack"><div class="hint">محصولات فقط برای نمایش هستند و قیمت ندارند. بعد از هر تغییر، دکمه‌ی «انتشار تغییرات» (بالای صفحه) را بزنید تا در سایت دیده شود.</div>' +
        '<div class="toolbar"><div class="grow"><input type="search" id="fq" placeholder="جستجوی محصول…" value="' + esc(F.q) + '"></div>' +
        '<select id="fc"><option value="">همه‌ی دسته‌ها</option>' + A.site.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (F.cat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>' +
        '<select id="fs"><option value="">همه‌ی وضعیت‌ها</option><option value="on"' + (F.st === 'on' ? ' selected' : '') + '>فعال</option><option value="off"' + (F.st === 'off' ? ' selected' : '') + '>غیرفعال</option></select>' +
        '<button class="btn gold" id="addp">' + M.icon('plus') + 'محصول جدید</button></div>' +
        '<div class="tbl-wrap"><table><thead><tr><th style="width:44px"><input type="checkbox" id="selall" aria-label="انتخاب همه"></th><th>محصول</th><th>دسته</th><th>وضعیت</th><th></th></tr></thead><tbody>' +
        (list.length ? list.map(function (p, i) {
          return '<tr data-id="' + esc(p.id) + '"><td><input type="checkbox" data-sel ' + (sel[p.id] ? 'checked' : '') + '></td><td><div style="display:flex;gap:10px;align-items:center"><span class="picon" style="width:34px;height:34px;display:inline-block;color:var(--gold-400)">' + M.productIcon(p.icon) + '</span><b>' + esc(p.name) + '</b></div></td>' +
            '<td>' + esc(A.catName(p.cat)) + '</td><td>' + (p.active === false ? U.pill('غیرفعال', 'off') : U.pill('فعال', 'ok')) + '</td>' +
            '<td><div class="row-actions"><button class="icon-btn" data-a="up" aria-label="بالا">' + M.icon('up') + '</button><button class="icon-btn" data-a="down" aria-label="پایین">' + M.icon('down') + '</button><button class="icon-btn" data-a="edit" aria-label="ویرایش">' + M.icon('edit') + '</button><button class="icon-btn bad" data-a="del" aria-label="حذف">' + M.icon('trash') + '</button></div></td></tr>';
        }).join('') : '<tr><td colspan="5" class="empty">محصولی پیدا نشد.</td></tr>') + '</tbody></table></div>' +
        '<div class="small muted">' + M.toFa(list.length) + ' محصول نمایش داده می‌شود' + (noFilter ? '' : ' (از ' + M.toFa(all.length) + ')') + '.</div></div>';
      U.$('#fq', el).oninput = M.debounce(function (e) { F.q = e.target.value; var pos = e.target.selectionStart; draw(); var n = U.$('#fq', el); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }, 250);
      U.$('#fc', el).onchange = function (e) { F.cat = e.target.value; draw(); };
      U.$('#fs', el).onchange = function (e) { F.st = e.target.value; draw(); };
      U.$('#addp', el).onclick = function () { editModal(null, draw); };
      U.$('#selall', el).onchange = function (e) { list.forEach(function (p) { sel[p.id] = e.target.checked; }); draw(); };
      U.$$('[data-sel]', el).forEach(function (c) { c.onchange = function () { sel[c.closest('tr').dataset.id] = c.checked; }; });
      U.$$('[data-a]', el).forEach(function (b) {
        b.onclick = function () {
          var id = b.closest('tr').dataset.id, prods = A.site.products, i = prods.findIndex(function (p) { return p.id === id; }), act = b.dataset.a;
          if (act === 'edit') editModal(prods[i], draw);
          else if (act === 'del') U.confirm('«' + prods[i].name + '» حذف شود؟', 'حذف', true).then(function (ok) { if (ok) { prods.splice(i, 1); A.markDirty(); draw(); } });
          else {
            var li = list.findIndex(function (p) { return p.id === id; }), nb = list[li + (act === 'up' ? -1 : 1)]; if (!nb) return;
            var j = prods.findIndex(function (p) { return p.id === nb.id; }); var t = prods[i]; prods[i] = prods[j]; prods[j] = t; A.markDirty(); draw();
          }
        };
      });
    }
    draw();
  } });
})(window);
