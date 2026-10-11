/* PROPER POINT – skrypty strony (czysty JavaScript, bez bibliotek)
   1. cień pod nagłówkiem po przewinięciu
   2. menu mobilne
   3. karuzele ze strzałkami
   4. podgląd zdjęć (lightbox)
   Strona działa także bez JavaScriptu – wtedy menu jest zwykłą listą,
   a kliknięcie zdjęcia otwiera je w pełnym rozmiarze. */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');

  var ICONS = {
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };

  /* 1. Cień pod nagłówkiem */
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 2. Menu mobilne */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav && header) {
    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);

    var setOpen = function (open) {
      if (open) {
        root.style.setProperty('--nav-top', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
      }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      nav.classList.toggle('is-open', open);
      backdrop.hidden = !open;
      root.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    backdrop.addEventListener('click', function () { setOpen(false); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 1150px)');
    var onBreakpoint = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* 3. Karuzele */
  Array.prototype.forEach.call(document.querySelectorAll('[data-slider]'), function (slider) {
    var track = slider.querySelector('.slider__track');
    var prev = slider.querySelector('.slider__btn--prev');
    var next = slider.querySelector('.slider__btn--next');
    if (!track || !prev || !next) return;

    var step = function () {
      var item = track.querySelector('.slider__item');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var one = item ? item.getBoundingClientRect().width + gap : track.clientWidth;
      var perView = Math.max(1, Math.floor((track.clientWidth + gap) / one));
      return one * perView;
    };

    var update = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      slider.classList.toggle('is-static', max <= 0);
    };
    var go = function (dir) {
      track.scrollBy({ left: dir * step(), behavior: 'smooth' });
      window.setTimeout(update, 600);
    };

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  });

  /* 4. Podgląd zdjęć */
  var links = document.querySelectorAll('a[data-lightbox]');
  if (!links.length || typeof HTMLDialogElement !== 'function') return;

  var groups = {};
  Array.prototype.forEach.call(links, function (a) {
    var name = a.getAttribute('data-lightbox');
    (groups[name] = groups[name] || []).push(a);
  });

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Podgląd zdjęcia');
  dialog.innerHTML =
    '<div class="lightbox__stage">' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
    '</div>' +
    '<p class="lightbox__counter" aria-live="polite"></p>' +
    '<button type="button" class="lightbox__btn lightbox__close" aria-label="Zamknij podgląd">' + ICONS.close + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Poprzednie zdjęcie">' + ICONS.prev + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__next" aria-label="Następne zdjęcie">' + ICONS.next + '</button>';
  document.body.appendChild(dialog);

  var img = dialog.querySelector('.lightbox__img');
  var caption = dialog.querySelector('.lightbox__caption');
  var counter = dialog.querySelector('.lightbox__counter');
  var current = [];
  var index = 0;
  var opener = null;

  var altOf = function (a) {
    var thumb = a.querySelector('img');
    return a.getAttribute('data-caption') || (thumb ? thumb.alt : '');
  };

  var preload = function (i) {
    var a = current[(i + current.length) % current.length];
    if (a) new Image().src = a.href;
  };

  var show = function (i) {
    index = (i + current.length) % current.length;
    var a = current[index];
    img.src = a.href;
    img.alt = altOf(a);
    caption.textContent = a.getAttribute('data-caption') || '';
    counter.textContent = (index + 1) + ' / ' + current.length;
    if (current.length > 1) {
      preload(index + 1);
      preload(index - 1);
    }
  };

  var open = function (group, i, from) {
    current = groups[group];
    opener = from;
    dialog.classList.toggle('lightbox--single', current.length < 2);
    show(i);
    root.classList.add('lightbox-open');
    dialog.showModal();
  };

  Object.keys(groups).forEach(function (name) {
    groups[name].forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        open(name, i, a);
      });
    });
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.lightbox__prev').addEventListener('click', function () { show(index - 1); });
  dialog.querySelector('.lightbox__next').addEventListener('click', function () { show(index + 1); });

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.classList.contains('lightbox__stage')) dialog.close();
  });
  dialog.addEventListener('keydown', function (e) {
    if (current.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });
  dialog.addEventListener('close', function () {
    root.classList.remove('lightbox-open');
    img.removeAttribute('src');
    if (opener) opener.focus();
  });

  /* Przesuwanie palcem na telefonie */
  var startX = 0;
  var startY = 0;
  dialog.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  dialog.addEventListener('touchend', function (e) {
    if (current.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
