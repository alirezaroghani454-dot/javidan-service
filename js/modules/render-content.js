/* ==========================================================================
   خدمات جاویدان سرویس — js/modules/render-content.js
   ساخت محتوای صفحه از روی داده‌ها (تنظیمات، تماس، خدمات، مراحل، نظرات، سوالات)
   ========================================================================== */
(function (root) {
  'use strict';
  var M = root.Javidan, $ = M.$, $$ = M.$$, esc = M.esc;
  var R = M.render = {};

  function safeHref(h) {
    h = String(h || '').trim();
    return /^(#|https?:\/\/|tel:|mailto:)/i.test(h) ? h : '#';
  }
  function setText(sel, txt) { $$(sel).forEach(function (el) { el.textContent = txt; }); }
  function social(v, base) {
    v = String(v || '').trim(); if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    return base + v.replace(/^@/, '').replace(/^\/+/, '');
  }
  function pad2(n) { return M.toFa(n < 10 ? '0' + n : n); }

  /* شماره‌های تماس: هر خط «شماره | برچسب» */
  function phoneList(s) {
    var out = String(s.phonesText || '').split(/\n+/).map(function (l) {
      var p = l.split('|'); return { num: M.toEn(p[0] || '').replace(/[^\d+]/g, ''), label: (p[1] || '').trim() };
    }).filter(function (x) { return x.num; });
    if (!out.length) [s.phone, s.mobile].forEach(function (n) { if (n) out.push({ num: M.toEn(n).replace(/[^\d+]/g, ''), label: '' }); });
    return out;
  }
  function same(a, b) { return M.toEn(a || '').replace(/\D/g, '') === M.toEn(b || '').replace(/\D/g, ''); }

  R.settings = function (d) {
    var s = d.settings, name = s.brandName || 'خدمات جاویدان سرویس';
    setText('.js-brand', name);
    setText('.js-brand-latin', String(s.brandLatin || 'Javidan Service'));
    setText('.js-manager', s.manager || '');
    document.title = name + ' | ' + (s.slogan || 'خدمات پس از فروش لوازم خانگی');
    setText('#heroEyebrow', s.heroEyebrow || '');
    setText('#heroTitleTop', s.heroTitleTop || name);
    setText('#heroTitleMain', s.heroTitleMain || s.slogan);
    setText('#heroLead', s.heroLead || '');
    setText('.js-hours', s.hours || '');
    setText('#footYear', M.toFa(M.jalali.currentYear()));
    $('#footerAbout').textContent = name + (s.manager ? ' به مدیریت ' + s.manager : '') + '، ارائه‌دهنده‌ی خدمات پس از فروش، تعمیر و نصب لوازم خانگی در تبریز.';
    setText('#reviewsTitle', s.reviewsTitle || 'نظر مشتریان');

    var bar = $('#announceBar');
    if (s.announce) { bar.textContent = s.announce; bar.hidden = false; }
    else bar.hidden = true;

    var phones = phoneList(s), first = phones[0];
    var wa = s.whatsapp ? M.waLink(s.whatsapp, 'سلام، از طریق سایت ' + name + ' پیام می‌دهم.') : '';
    $$('.js-wa-link').forEach(function (a) { if (wa) { a.href = wa; a.hidden = false; } else a.hidden = true; });
    $$('.js-call-link').forEach(function (a) { if (first) { a.href = 'tel:' + first.num; } });
    $$('.js-call-num').forEach(function (a) { if (first) a.textContent = M.toFa(first.num); });
    $('.fab-wa').hidden = !wa;

    $('#phoneList').innerHTML = phones.map(function (p, i) {
      var isWa = wa && same(p.num, s.whatsapp);
      return '<div class="ph-card" data-reveal="up" style="--d:' + (i * 0.06).toFixed(2) + 's">' +
        '<a class="ph-main" href="tel:' + esc(p.num) + '"><span class="ph-ic">' + M.icon('phone') + '</span><span><small>' + esc(p.label || 'تماس تلفنی') + '</small><b dir="ltr">' + esc(M.toFa(p.num)) + '</b></span></a>' +
        (isWa ? '<a class="ph-wa" href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="واتساپ">' + M.icon('whatsapp') + '<span>واتساپ</span></a>' : '') + '</div>';
    }).join('');

    var rows = [];
    if (s.address) rows.push({ ic: 'pin', label: 'نشانی', val: s.address + (s.postalCode ? '\u200f — کد پستی: ' + M.toFa(s.postalCode) : ''), href: s.mapUrl ? safeHref(s.mapUrl) : '' });
    if (s.hours) rows.push({ ic: 'clock', label: 'ساعت کاری', val: s.hours });
    if (s.manager) rows.push({ ic: 'user', label: 'مدیریت', val: s.manager });
    if (s.email) rows.push({ ic: 'mail', label: 'ایمیل', val: s.email, href: 'mailto:' + s.email, ltr: true });
    $('#contactInfo').innerHTML = rows.map(function (r, i) {
      var tag = r.href ? 'a' : 'div';
      return '<' + tag + ' class="info-card" data-reveal="up" style="--d:' + (i * 0.07).toFixed(2) + 's"' +
        (r.href ? ' href="' + esc(r.href) + '" target="_blank" rel="noopener"' : '') + '>' +
        '<span class="info-ic">' + M.icon(r.ic) + '</span><span><small>' + esc(r.label) + '</small><b' + (r.ltr ? ' dir="ltr"' : '') + '>' + esc(r.val) + '</b></span></' + tag + '>';
    }).join('');

    $('#footerContact').innerHTML = phones.map(function (p) {
      return '<li>' + M.icon('phone') + '<a href="tel:' + esc(p.num) + '" dir="ltr">' + esc(M.toFa(p.num)) + '</a></li>';
    }).join('') + (s.address ? '<li>' + M.icon('pin') + '<span>' + esc(s.address) + '</span></li>' : '');

    var links = [];
    var ig = social(s.instagram, 'https://instagram.com/'), tg = social(s.telegram, 'https://t.me/');
    if (ig) links.push('<a href="' + esc(ig) + '" target="_blank" rel="noopener" aria-label="اینستاگرام">' + M.icon('instagram') + '</a>');
    if (tg) links.push('<a href="' + esc(tg) + '" target="_blank" rel="noopener" aria-label="تلگرام">' + M.icon('telegram') + '</a>');
    if (wa) links.push('<a href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="واتساپ">' + M.icon('whatsapp') + '</a>');
    $('#socialLinks').innerHTML = links.join('');
  };

  R.stats = function (d) {
    var active = d.products.filter(function (p) { return p.active !== false; }).length;
    $('#statsRow').innerHTML = d.stats.map(function (st, i) {
      var v = st.auto === 'products' ? active : st.auto === 'categories' ? d.categories.length : (Number(st.value) || 0);
      return '<div class="stat" data-reveal="up" style="--d:' + (i * 0.08).toFixed(2) + 's"><strong class="num" data-count="' + v + '" data-suffix="' + esc(st.suffix || '') + '">' + M.toFa(v) + esc(st.suffix || '') + '</strong><span>' + esc(st.label) + '</span></div>';
    }).join('');
  };

  R.services = function (d) {
    $('#servicesGrid').innerHTML = d.services.map(function (s, i) {
      return '<article class="svc-card" data-reveal="up" style="--d:' + ((i % 3) * 0.08).toFixed(2) + 's">' +
        '<div class="svc-ic">' + M.icon(s.icon || 'sparkle') + '</div><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
        (s.cta ? '<a class="svc-link" href="' + esc(safeHref(s.link)) + '">' + esc(s.cta) + M.icon('arrow-left') + '</a>' : '') + '</div></article>';
    }).join('');
  };

  R.steps = function (d) {
    $('#stepsList').innerHTML = d.steps.map(function (s, i) {
      return '<li class="step" data-reveal="up" style="--d:' + (i * 0.1).toFixed(2) + 's"><span class="step-num">' + M.toFa(i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>';
    }).join('');
  };
  R.features = function (d) {
    $('#featGrid').innerHTML = d.features.map(function (f, i) {
      return '<div class="feat" data-reveal="up" style="--d:' + ((i % 3) * 0.08).toFixed(2) + 's"><span class="fi">' + M.icon(f.icon || 'star') + '</span><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></div>';
    }).join('');
  };

  /* نظرات: بدون ستاره و امتیاز */
  R.reviews = function (d) {
    var sec = $('#reviews'), list = (d.reviews || []).filter(function (r) { return r && r.text; });
    sec.hidden = list.length === 0;
    $('#revGrid').innerHTML = list.map(function (r, i) {
      return '<blockquote class="rev tone' + (i % 5) + (i >= 12 ? ' more' : '') + '"><p>' + esc(r.text) + '</p><footer><i>' + esc(String(r.name || '؟').replace(/^(آقای|خانم|دکتر)\s+/, '').charAt(0)) + '</i><span><b>' + esc(r.name || '') + '</b>' + (r.role ? '<small>' + esc(r.role) + '</small>' : '') + '</span></footer></blockquote>';
    }).join('');
  };

  R.revMore = function () {
    var g = $('#revGrid'), b = $('#revMore'), n = $$('.rev.more', g).length;
    if (!n) { b.hidden = true; return; }
    b.hidden = false; b.textContent = 'مشاهده‌ی ' + M.toFa(n) + ' نظر دیگر';
    b.onclick = function () { g.classList.add('all'); b.hidden = true; };
  };

  R.faq = function (d) {
    $('#faqList').innerHTML = d.faq.map(function (f, i) {
      return '<div class="faq-item" data-reveal="up" style="--d:' + (Math.min(i, 5) * 0.05).toFixed(2) + 's">' +
        '<button class="faq-q" type="button" aria-expanded="false" aria-controls="faqa' + i + '"><span>' + esc(f.q) + '</span>' + M.icon('chevron-down') + '</button>' +
        '<div class="faq-a" id="faqa' + i + '" role="region"><div><p>' + esc(f.a) + '</p></div></div></div>';
    }).join('');
  };

  R.all = function (d) {
    R.settings(d); R.stats(d); R.services(d); R.steps(d); R.features(d);
    R.reviews(d); R.revMore(); R.faq(d);
    M.hydrateIcons(document);
  };

  R.bindFaq = function () {
    var list = $('#faqList');
    list.addEventListener('click', function (e) {
      var q = e.target.closest('.faq-q'); if (!q) return;
      var item = q.parentNode, open = !item.classList.contains('open');
      $$('.faq-item.open', list).forEach(function (it) { if (it !== item) { it.classList.remove('open'); it.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); } });
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  };
})(window);
