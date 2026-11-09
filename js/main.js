/* =========================================================================
   MAIN — Interfaz de la web (sin librerías)
   Índice:
     1. Utilidades
     2. Datos de config.js → HTML
     3. Cabecera y menú móvil
     4. Aparición al hacer scroll
     5. Portfolio: galería, filtros y lightbox
     6. Botones de pack → formulario
     7. Carrusel de testimonios
     8. Formulario de reserva (validación + Formspree)
     9. Escena 3D del hero (carga diferida)
   ========================================================================= */

import { SITE } from './config.js';

/* ---------- 1. Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const isPlaceholder = (v) => typeof v === 'string' && v.trim().startsWith('[');
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

document.documentElement.classList.add('js');

/* ---------- 2. Datos de config.js → HTML ---------- */
// <span data-config="ciudad"> recibe SITE.ciudad; admite rutas: "packs.mini.precio"
function applyConfig() {
  $$('[data-config]').forEach((el) => {
    const value = getPath(SITE, el.dataset.config);
    if (value != null && value !== '') el.textContent = value;
  });
  // Enlaces: data-config-href="instagramUrl" o "mailto:email"
  $$('[data-config-href]').forEach((el) => {
    let key = el.dataset.configHref;
    let prefix = '';
    if (key.startsWith('mailto:')) { prefix = 'mailto:'; key = key.slice(7); }
    const value = getPath(SITE, key);
    if (value && !isPlaceholder(value)) el.href = prefix + value;
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

/* ---------- 3. Cabecera y menú móvil ---------- */
function initHeader() {
  const header = $('[data-header]');
  const toggle = $('[data-nav-toggle]');
  const list = $('[data-nav-list]');
  if (!header || !toggle || !list) return;

  // Sombra al hacer scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Cerrar menú' : 'Abrir menú';
    list.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && list.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (list.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
  });

  // Enlace activo según la sección visible
  const links = $$('a[href^="#"]', list);
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

/* ---------- 4. Aparición al hacer scroll ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
}

/* ---------- 5. Portfolio: galería, filtros y lightbox ---------- */
const CATEGORY_LABELS = {
  'recien-nacido': 'Recién nacido',
  embarazo: 'Embarazo',
  familia: 'Familia',
  'primer-anio': 'Primer año',
};
const ANIMAL_LABELS = { osito: 'Osito', conejito: 'Conejito', zorrito: 'Zorrito', ovejita: 'Ovejita', pollito: 'Pollito' };

function initPortfolio() {
  const gallery = $('[data-gallery]');
  if (!gallery) return;

  // 5.1 Pintar las fotos desde config.js
  gallery.innerHTML = SITE.portfolio.map((photo, i) => {
    const webp = photo.webp ? `<source srcset="${escapeHTML(photo.webp)}" type="image/webp">` : '';
    return `<li class="gallery-item" data-cat="${escapeHTML(photo.categoria)}" data-animal="${escapeHTML(photo.animal || '')}">
      <button type="button" class="gallery-btn" data-index="${i}" aria-haspopup="dialog">
        <picture>${webp}<img src="${escapeHTML(photo.src)}" width="${photo.w}" height="${photo.h}" alt="${escapeHTML(photo.alt)}" loading="lazy" decoding="async"></picture>
      </button>
    </li>`;
  }).join('');

  const items = $$('.gallery-item', gallery);
  const catButtons = $$('[data-filter]');
  const animalButtons = $$('[data-animal]').filter((b) => b.tagName === 'BUTTON');
  const animalBar = $('[data-animal-tags]');
  const status = $('[data-gallery-status]');
  const state = { cat: 'todos', animal: 'todos' };

  // 5.2 Filtros
  function applyFilters() {
    let count = 0;
    items.forEach((li) => {
      const okCat = state.cat === 'todos' || li.dataset.cat === state.cat;
      const okAnimal = state.cat !== 'recien-nacido' || state.animal === 'todos' || li.dataset.animal === state.animal;
      const show = okCat && okAnimal;
      li.hidden = !show;
      if (show) count++;
    });
    catButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.cat)));
    animalButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.animal === state.animal)));
    animalBar.hidden = state.cat !== 'recien-nacido';
    status.textContent = `Mostrando ${count} ${count === 1 ? 'foto' : 'fotos'}`;
  }
  catButtons.forEach((b) => b.addEventListener('click', () => {
    state.cat = b.dataset.filter;
    state.animal = 'todos';
    applyFilters();
  }));
  animalButtons.forEach((b) => b.addEventListener('click', () => {
    state.animal = b.dataset.animal;
    applyFilters();
  }));

  // 5.3 Lightbox
  const dialog = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]', dialog);
  const lbCaption = $('[data-lb-caption]', dialog);
  let visible = [];
  let current = 0;
  let trigger = null;

  const supportsDialog = typeof dialog.showModal === 'function';

  function show(index) {
    current = (index + visible.length) % visible.length;
    const thumb = $('img', visible[current]);
    const photo = SITE.portfolio[Number($('.gallery-btn', visible[current]).dataset.index)];
    lbImg.src = thumb.currentSrc || thumb.src;   // usa WebP si el navegador lo eligió
    lbImg.width = photo.w;
    lbImg.height = photo.h;
    lbImg.alt = photo.alt;
    const label = CATEGORY_LABELS[photo.categoria] + (photo.animal ? ` · ${ANIMAL_LABELS[photo.animal]}` : '');
    lbCaption.textContent = `${label} — ${current + 1} de ${visible.length}`;
    // Precarga la siguiente
    const next = visible[(current + 1) % visible.length];
    if (next) { const im = new Image(); im.src = $('img', next).src; }
  }

  function open(btn) {
    visible = items.filter((li) => !li.hidden);
    trigger = btn;
    const idx = visible.indexOf(btn.closest('.gallery-item'));
    show(idx < 0 ? 0 : idx);
    if (supportsDialog) dialog.showModal(); else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    if (supportsDialog && dialog.open) dialog.close(); else dialog.removeAttribute('open');
  }

  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-btn');
    if (btn) open(btn);
  });
  $('[data-lb-close]', dialog).addEventListener('click', close);
  $('[data-lb-prev]', dialog).addEventListener('click', () => show(current - 1));
  $('[data-lb-next]', dialog).addEventListener('click', () => show(current + 1));

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (trigger) trigger.focus();   // devuelve el foco a la miniatura
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'Escape' && !supportsDialog) close();
  });
  // Clic fuera de la foto = cerrar
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('lightbox-inner')) close();
  });

  // Swipe en móvil
  let startX = 0, startY = 0;
  dialog.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (e.touches.length) return; // ignorar gestos con dos dedos (zoom)
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  applyFilters();
}

/* ---------- 6. Botones de pack → formulario ---------- */
// Al pulsar "Elegir Completa" se preselecciona el tipo de sesión y el pack
const PACK_TO_TYPE = {
  mini: 'recien-nacido', completa: 'recien-nacido', premium: 'recien-nacido',
  combinado: 'combinado', embarazo: 'embarazo', familia: 'familia', 'primer-anio': 'primer-anio',
};
function initPackLinks() {
  const tipo = $('#f-tipo');
  const pack = $('#f-pack');
  if (!tipo || !pack) return;
  $$('[data-pack]').forEach((a) => a.addEventListener('click', () => {
    pack.value = a.dataset.pack;
    tipo.value = PACK_TO_TYPE[a.dataset.pack] || '';
    tipo.dispatchEvent(new Event('change'));
  }));
}

/* ---------- 7. Carrusel de testimonios ---------- */
function initCarousel() {
  const root = $('[data-carousel]');
  if (!root) return;
  const track = $('[data-carousel-track]', root);
  const slides = $$('.testimonial', track);
  const dotsWrap = $('[data-carousel-dots]', root);
  const behavior = prefersReducedMotion ? 'auto' : 'smooth';

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[idx].offsetLeft - track.offsetLeft, behavior });
  };
  const currentIndex = () => Math.round(track.scrollLeft / track.clientWidth);

  dotsWrap.innerHTML = slides.map((_, i) =>
    `<button type="button" aria-label="Ver testimonio ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('');
  const dots = $$('button', dotsWrap);
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  $('[data-carousel-prev]', root).addEventListener('click', () => {
    const i = currentIndex();
    goTo(i === 0 ? slides.length - 1 : i - 1);
  });
  $('[data-carousel-next]', root).addEventListener('click', () => {
    const i = currentIndex();
    goTo(i === slides.length - 1 ? 0 : i + 1);
  });

  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = currentIndex();
      dots.forEach((d, j) => (j === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    });
  }, { passive: true });
}

/* ---------- 8. Formulario de reserva ---------- */
function initForm() {
  const form = $('[data-booking-form]');
  if (!form) return;

  const summary = $('[data-form-summary]', form);
  const status = $('[data-form-status]', form);
  const submitBtn = $('[data-submit]', form);
  const submitLabel = $('[data-submit-label]', form);
  const tipo = $('#f-tipo', form);
  const dateLabel = $('[data-date-label]', form);
  let submittedOnce = false;

  // La etiqueta de la fecha cambia según el tipo de sesión
  const updateDateLabel = () => {
    const isBirth = tipo.value === 'recien-nacido' || tipo.value === 'combinado';
    const text = isBirth ? 'Fecha prevista de parto' : tipo.value ? 'Fecha deseada' : 'Fecha prevista de parto o fecha deseada';
    dateLabel.firstChild.textContent = `${text} `;
  };
  tipo.addEventListener('change', updateDateLabel);

  const daysFromToday = (value) => {
    const d = new Date(`${value}T12:00:00`);
    if (Number.isNaN(d.getTime())) return NaN;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  };

  // Reglas: devuelven el mensaje de error o '' si el campo es válido
  const rules = {
    nombre: (v) => (v.trim().length < 2 ? 'Escribe tu nombre.' : ''),
    email: (v) => (!v.trim() ? 'Escribe tu email.' :
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Revisa el email, parece incompleto (ej.: nombre@email.com).' : ''),
    telefono: (v) => {
      const digits = v.replace(/\D/g, '');
      if (!v.trim()) return 'Escribe un teléfono de contacto.';
      if (!/^[+\d\s().-]+$/.test(v) || digits.length < 9 || digits.length > 15) return 'Revisa el teléfono: debe tener al menos 9 cifras.';
      return '';
    },
    tipo_sesion: (v) => (!v ? 'Elige el tipo de sesión.' : ''),
    fecha: (v) => {
      if (!v) return 'Indica la fecha (aunque sea aproximada).';
      const days = daysFromToday(v);
      if (Number.isNaN(days)) return 'Revisa la fecha.';
      const isBirth = tipo.value === 'recien-nacido' || tipo.value === 'combinado';
      if (isBirth && days < -30) return 'La sesión de recién nacido se hace en las primeras semanas: revisa la fecha.';
      if (!isBirth && days < 0) return 'La fecha deseada no puede estar en el pasado.';
      if (days > 730) return 'La fecha es demasiado lejana: revisa el año.';
      return '';
    },
    acepta_privacidad: (_, el) => (!el.checked ? 'Necesitamos tu aceptación de la política de privacidad para responderte.' : ''),
  };

  const validateField = (el) => {
    const rule = rules[el.name];
    if (!rule) return '';
    const msg = rule(el.value, el);
    const errorEl = $(`#${el.getAttribute('aria-describedby')}`);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errorEl) errorEl.textContent = msg;
    return msg;
  };

  const fields = Object.keys(rules).map((name) => form.elements[name]);
  fields.forEach((el) => {
    el.addEventListener('blur', () => { if (submittedOnce || el.value) validateField(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validateField(el); });
    el.addEventListener('change', () => { if (submittedOnce) validateField(el); });
  });

  const setStatus = (type, html) => {
    status.className = `form-status${type ? ` is-${type}` : ''}`;
    status.innerHTML = html;
  };
  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    form.setAttribute('aria-busy', String(loading));
    submitLabel.textContent = loading ? 'Enviando…' : 'Enviar solicitud de reserva';
  };
  const contactFallback = () => (isPlaceholder(SITE.email) ? '' :
    ` Si lo prefieres, escríbeme a <a href="mailto:${escapeHTML(SITE.email)}">${escapeHTML(SITE.email)}</a>.`);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submittedOnce = true;
    setStatus('', '');

    // 1) Validación
    const errors = fields.map((el) => ({ el, msg: validateField(el) })).filter((x) => x.msg);
    if (errors.length) {
      summary.hidden = false;
      summary.textContent = errors.length === 1
        ? 'Revisa 1 campo marcado en rojo antes de enviar.'
        : `Revisa ${errors.length} campos marcados en rojo antes de enviar.`;
      errors[0].el.focus();
      return;
    }
    summary.hidden = true;

    // 2) Honeypot: si un bot lo ha rellenado, fingimos éxito y no enviamos nada
    if (form.elements._gotcha.value) {
      setStatus('success', '¡Gracias! He recibido tu solicitud.');
      form.reset();
      return;
    }

    // 3) Endpoint sin configurar
    if (!SITE.formEndpoint || isPlaceholder(SITE.formEndpoint)) {
      console.warn('[Formulario] Falta configurar SITE.formEndpoint en js/config.js (ver README).');
      setStatus('error', `El formulario todavía no está conectado.${contactFallback()}`);
      return;
    }

    // 4) Envío a Formspree sin recargar
    const data = new FormData(form);
    const tipoTexto = tipo.options[tipo.selectedIndex]?.text || '';
    data.append('_subject', `Nueva solicitud de reserva: ${tipoTexto}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    try {
      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (res.ok) {
        const nombre = form.elements.nombre.value.trim().split(' ')[0];
        form.reset();
        updateDateLabel();
        fields.forEach((el) => el.removeAttribute('aria-invalid'));
        submittedOnce = false;
        setStatus('success', `¡Gracias, ${escapeHTML(nombre)}! He recibido tu solicitud. ${escapeHTML(SITE.tiempoRespuesta)} en tu email. Revisa también la carpeta de spam.`);
      } else {
        const body = await res.json().catch(() => ({}));
        const detail = body.errors ? body.errors.map((er) => er.message).join(' ') : '';
        setStatus('error', `No se ha podido enviar. ${escapeHTML(detail)} Inténtalo de nuevo en unos minutos.${contactFallback()}`);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'La conexión está tardando demasiado.' : 'Parece que no hay conexión.';
      setStatus('error', `${msg} Inténtalo de nuevo.${contactFallback()}`);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      status.setAttribute('tabindex', '-1');
      status.focus();
    }
  });
}

/* ---------- 9. Escena 3D del hero (carga diferida) ---------- */
// El titular, los CTA y la ilustración SVG se pintan primero. Three.js (~170 KB)
// solo se descarga cuando se cumple TODO esto:
//   - la página ya ha cargado (evento load),
//   - la persona ha interactuado (scroll, toque, ratón o teclado): así la carga
//     inicial queda libre y el móvil responde al instante al primer toque,
//   - el hero está en pantalla o cerca,
//   - hay WebGL y el dispositivo no pide ahorro de datos ni es muy limitado.
// Si algo falla, se queda la ilustración SVG (que es casi idéntica).
function initHero3D() {
  const container = $('[data-hero-scene]');
  if (!container) return;

  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return;
  if (!window.WebGLRenderingContext) return;

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    import('./scene3d.js')
      .then((m) => m.initScene(container, { reducedMotion: prefersReducedMotion }))
      .catch((err) => console.warn('[3D] No se pudo cargar la escena, se mantiene la ilustración.', err));
  };
  const whenIdle = (cb) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 300));

  let interacted = false;
  let nearViewport = false;
  const maybeStart = () => { if (interacted && nearViewport) whenIdle(start); };

  const onLoaded = () => {
    // ¿Está el hero en pantalla (o a menos de 300 px)?
    const io = new IntersectionObserver((entries) => {
      nearViewport = entries.some((en) => en.isIntersecting);
      if (nearViewport && started) io.disconnect();
      maybeStart();
    }, { rootMargin: '300px 0px' });
    io.observe(container);

    // Primera interacción
    const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown'];
    const onFirstInteraction = () => {
      events.forEach((ev) => window.removeEventListener(ev, onFirstInteraction));
      interacted = true;
      maybeStart();
    };
    events.forEach((ev) => window.addEventListener(ev, onFirstInteraction, { passive: true }));
  };
  if (document.readyState === 'complete') onLoaded();
  else window.addEventListener('load', onLoaded, { once: true });
}

/* ---------- Arranque ---------- */
applyConfig();
initHeader();
initReveal();
initPortfolio();
initPackLinks();
initCarousel();
initForm();
initHero3D();
