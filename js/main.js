(function () {
  'use strict';
  var ruhe = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Wasserwaage (SVG, Holz mit Messingkanten) ---------- */
  function waageSVG(id, beschriftung) {
    var t = beschriftung
      ? '<text x="132" y="72" font-family="Zilla, Georgia, serif" font-weight="700" font-size="17" letter-spacing="3" fill="#4A2C10" opacity=".55">TISCHLEREI HÖLSCHER</text>' +
        '<text x="868" y="72" text-anchor="end" font-family="Zilla, Georgia, serif" font-weight="700" font-size="17" letter-spacing="3" fill="#4A2C10" opacity=".55">EPE</text>'
      : '';
    return '' +
    '<svg class="waage" viewBox="0 0 1000 130" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6BC84"/><stop offset=".45" stop-color="#CF975A"/><stop offset="1" stop-color="#A66B33"/></linearGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3DE95"/><stop offset=".5" stop-color="#C9A247"/><stop offset="1" stop-color="#8E6E22"/></linearGradient>' +
      '<linearGradient id="' + id + 'mx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E6E22"/><stop offset=".5" stop-color="#E8CE7C"/><stop offset="1" stop-color="#9C7A2A"/></linearGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF39A"/><stop offset=".55" stop-color="#BFD540"/><stop offset="1" stop-color="#8FAA25"/></linearGradient>' +
      '<radialGradient id="' + id + 'b" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F4F9DC"/><stop offset="1" stop-color="#DDEAA2"/></radialGradient>' +
      '<filter id="' + id + 'g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0032 0.16" numOctaves="3" seed="11"/>' +
        '<feColorMatrix values="0 0 0 0 .36  0 0 0 0 .2  0 0 0 0 .06  0 0 0 2.6 -1.05"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
      '<clipPath id="' + id + 'c"><rect x="420" y="51" width="160" height="28" rx="14"/></clipPath>' +
    '</defs>' +
    '<rect x="30" y="30" width="940" height="70" rx="5" fill="url(#' + id + 'h)"/>' +
    '<rect x="30" y="30" width="940" height="70" rx="5" fill="#000" filter="url(#' + id + 'g)"/>' +
    '<rect x="30" y="30" width="940" height="5" fill="url(#' + id + 'm)"/>' +
    '<rect x="30" y="95" width="940" height="5" fill="url(#' + id + 'm)"/>' +
    '<rect x="30" y="35" width="940" height="3" fill="#fff" opacity=".25"/>' +
    '<rect x="30" y="30" width="16" height="70" rx="3" fill="url(#' + id + 'mx)"/>' +
    '<rect x="954" y="30" width="16" height="70" rx="3" fill="url(#' + id + 'mx)"/>' +
    t +
    '<rect x="406" y="41" width="188" height="48" rx="9" fill="#2A2018"/>' +
    '<rect x="410" y="45" width="180" height="40" rx="7" fill="url(#' + id + 'm)" opacity=".9"/>' +
    '<rect x="418" y="49" width="164" height="32" rx="16" fill="#30261C"/>' +
    '<g clip-path="url(#' + id + 'c)">' +
      '<rect x="420" y="51" width="160" height="28" fill="url(#' + id + 'f)"/>' +
      '<g class="blase" data-blase>' +
        '<ellipse cx="500" cy="61" rx="18" ry="8.4" fill="url(#' + id + 'b)" stroke="#6F8A1C" stroke-width="1.4"/>' +
        '<ellipse cx="495" cy="57.6" rx="7" ry="2" fill="#fff" opacity=".9"/>' +
      '</g>' +
      '<rect x="424" y="53" width="152" height="4" rx="2" fill="#fff" opacity=".45"/>' +
    '</g>' +
    '<path d="M480 51v28M520 51v28" stroke="#2A2018" stroke-width="2.6"/>' +
    '<g fill="url(#' + id + 'mx)" stroke="#6E5418" stroke-width="1"><circle cx="392" cy="65" r="6"/><circle cx="608" cy="65" r="6"/></g>' +
    '<path d="M388 61l8 8M604 61l8 8" stroke="#5A4412" stroke-width="1.6"/>' +
    '</svg>';
  }

  var waagen = {};
  document.querySelectorAll('[data-waage]').forEach(function (el, i) {
    var name = el.getAttribute('data-waage');
    el.insertAdjacentHTML('afterbegin', waageSVG('w' + i, name === 'hero'));
    waagen[name] = { el: el, blase: el.querySelector('[data-blase]'), x: 0, ziel: 0, raf: 0 };
  });

  // Gedämpfte, ruhige Bewegung der Blase zu einem Zielwert (in SVG-Einheiten)
  function bewege(w, ziel, dauer) {
    if (!w || !w.blase) return;
    cancelAnimationFrame(w.raf);
    var start = w.x, delta = ziel - start, t0 = performance.now();
    if (ruhe || dauer === 0) { w.x = ziel; w.blase.setAttribute('transform', 'translate(' + ziel + ' 0)'); return; }
    function schritt(t) {
      var p = Math.min(1, (t - t0) / dauer);
      // ausschwingen: e^-5p * cos(…) für ein ganz leichtes Nachpendeln
      var f = 1 - Math.exp(-5 * p) * Math.cos(p * 5.2);
      w.x = start + delta * f;
      w.blase.setAttribute('transform', 'translate(' + w.x.toFixed(2) + ' 0)');
      if (p < 1) w.raf = requestAnimationFrame(schritt);
      else { w.x = ziel; w.blase.setAttribute('transform', 'translate(' + ziel + ' 0)'); }
    }
    w.raf = requestAnimationFrame(schritt);
  }

  // Hero: Blase startet schief und kommt einmal zur Ruhe
  var hero = waagen.hero;
  if (hero) {
    bewege(hero, -52, 0);
    var losgehen = function () {
      bewege(hero, 0, 2200);
      setTimeout(function () { hero.el.classList.add('ruhig'); }, ruhe ? 0 : 1500);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { io.disconnect(); setTimeout(losgehen, 350); }
      }, { threshold: .6 });
      io.observe(hero.el);
    } else losgehen();
  }

  /* ---------- Hausschnitt ---------- */
  var zonen = document.querySelectorAll('.haus .zone');
  var tabs = document.querySelectorAll('.zonen-tabs button');
  var panels = document.querySelectorAll('.zonen-panel .zp');
  function zeigeZone(z) {
    zonen.forEach(function (g) { g.classList.toggle('aktiv', g.dataset.zone === z); });
    tabs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.zone === z ? 'true' : 'false'); });
    panels.forEach(function (p) { p.hidden = p.dataset.zone !== z; });
  }
  zonen.forEach(function (g) {
    g.addEventListener('click', function () { zeigeZone(g.dataset.zone); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeZone(g.dataset.zone); } });
  });
  tabs.forEach(function (b) { b.addEventListener('click', function () { zeigeZone(b.dataset.zone); }); });
  if (zonen.length) zeigeZone('raeume');

  /* ---------- Formular ---------- */
  var form = document.getElementById('form');
  if (!form) return;
  var fw = waagen.form;
  var status = document.querySelector('.form-waage .status');
  var rueck = document.getElementById('rueckweg');
  var tel = document.getElementById('tel'), mail = document.getElementById('mail');
  var label = document.getElementById('nachricht-label');
  var senden = document.getElementById('senden');

  var texte = {
    altbau: ['Anfrage senden', 'Ihre Nachricht <small>(freiwillig)</small>'],
    tueren: ['Anfrage senden', 'Ihre Nachricht <small>(freiwillig)</small>'],
    trockenbau: ['Anfrage senden', 'Ihre Nachricht <small>(freiwillig)</small>'],
    dachboden: ['Anfrage senden', 'Ihre Nachricht <small>(freiwillig)</small>'],
    frage: ['Frage senden', 'Ihre Frage'],
    mitarbeiten: ['Bewerbung senden', 'Ein paar Sätze zu Ihnen <small>(freiwillig)</small>']
  };

  function anliegen() { var r = form.querySelector('input[name=anliegen]:checked'); return r ? r.value : 'altbau'; }

  function weiche() {
    var a = anliegen();
    form.querySelectorAll('.teil').forEach(function (t) { t.hidden = t.dataset.teil.split(' ').indexOf(a) < 0; });
    senden.textContent = texte[a][0];
    label.innerHTML = texte[a][1];
    stand();
  }

  function kontaktOk() {
    var t = tel.value.replace(/\D/g, '');
    var m = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
    return t.length >= 6 || m;
  }

  // Die Blase wandert mit jeder Angabe näher zur Mitte; mit Telefon oder E-Mail ist sie im Lot.
  function stand() {
    if (!fw) return;
    var sichtbar = Array.prototype.filter.call(form.querySelectorAll('.teil'), function (t) { return !t.hidden; });
    var gruppen = 0, beantwortet = 0;
    sichtbar.forEach(function (t) {
      t.querySelectorAll('fieldset').forEach(function (f) { gruppen++; if (f.querySelector('input:checked')) beantwortet++; });
    });
    if (form.nachricht.value.trim()) beantwortet++;
    gruppen++;
    var ok = kontaktOk();
    var ziel = ok ? 0 : -54 + Math.min(1, beantwortet / gruppen) * 30;
    bewege(fw, ziel, 1400);
    fw.el.classList.toggle('im-lot', ok);
    status.textContent = ok ? 'im Lot, kann raus' : (beantwortet ? 'fast im Lot' : 'noch etwas schief');
    if (ok) rueck.classList.remove('fehlt');
  }
  if (fw) bewege(fw, -54, 0);

  form.addEventListener('change', function (e) { if (e.target.name === 'anliegen') weiche(); else stand(); });
  form.addEventListener('input', function (e) {
    if (e.target.type === 'range') ausgabe(e.target);
    if (e.target === tel || e.target === mail || e.target.name === 'nachricht') stand();
  });

  function ausgabe(r) {
    var o = r.parentNode.querySelector('output');
    o.textContent = r.value + (r.name === 'anzahl' ? ' Stück' : ' m²');
  }
  form.querySelectorAll('input[type=range]').forEach(ausgabe);
  form.querySelectorAll('.datei input[type=file]').forEach(function (f) {
    f.addEventListener('change', function () {
      var n = f.files.length;
      f.parentNode.querySelector('.dateiname').textContent = n === 0 ? '' : (n === 1 ? f.files[0].name : n + ' Dateien gewählt');
    });
  });

  // Links mit data-weiche wählen das passende Anliegen vor
  document.querySelectorAll('[data-weiche]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[name=anliegen][value="' + a.dataset.weiche + '"]');
      if (r) { r.checked = true; weiche(); }
    });
  });

  var danke = document.getElementById('danke');
  var zusammen = document.getElementById('zusammenfassung');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!kontaktOk()) {
      rueck.classList.add('fehlt');
      (tel.value ? mail : tel).focus();
      return;
    }
    var a = anliegen();
    var namen = { altbau: 'Altbau sanieren', tueren: 'Türen und Fenster', trockenbau: 'Trockenbau und Böden', dachboden: 'Bodentreppe und Dachboden', frage: 'Kurze Frage', mitarbeiten: 'Mitarbeiten' };
    var zeilen = [['Anliegen', namen[a]]];
    form.querySelectorAll('.teil:not([hidden]) fieldset').forEach(function (f) {
      var w = Array.prototype.map.call(f.querySelectorAll('input:checked'), function (i) { return i.value; });
      if (w.length) zeilen.push([f.querySelector('legend').childNodes[0].textContent.replace('?', '').trim(), w.join(', ')]);
    });
    form.querySelectorAll('.teil:not([hidden]) input[type=range]').forEach(function (r) { zeilen.push(['Größe', r.parentNode.querySelector('output').textContent]); });
    if (tel.value) zeilen.push(['Telefon', tel.value]);
    if (mail.value) zeilen.push(['E-Mail', mail.value]);
    var nm = document.getElementById('name').value; if (nm) zeilen.push(['Name', nm]);
    zusammen.innerHTML = '';
    zeilen.forEach(function (z) {
      var d = document.createElement('div');
      var s1 = document.createElement('span'); s1.textContent = z[0];
      var s2 = document.createElement('span'); s2.textContent = z[1];
      d.appendChild(s1); d.appendChild(s2); zusammen.appendChild(d);
    });
    form.style.display = 'none';
    danke.classList.add('zeigen');
    if (waagen.danke) bewege(waagen.danke, 0, 0);
    danke.focus({ preventScroll: true });
    danke.scrollIntoView({ behavior: ruhe ? 'auto' : 'smooth', block: 'center' });
  });
  document.getElementById('nochmal').addEventListener('click', function () {
    form.reset();
    form.querySelectorAll('input[type=range]').forEach(ausgabe);
    form.querySelectorAll('.dateiname').forEach(function (d) { d.textContent = ''; });
    form.style.display = '';
    danke.classList.remove('zeigen');
    weiche();
  });

  weiche();
})();
