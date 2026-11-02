/* Stiven Cordonez — site interactions.
   Vanilla ES module, no dependencies. Every feature degrades gracefully:
   without JS the page is fully readable and every CTA still works. */

window.__siteReady = true;

const WHATSAPP = '393452447520';
const EMAIL = 'stivencordonez03@gmail.com';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const hasIO = 'IntersectionObserver' in window;

/** Run `fn` at most once per animation frame for high-frequency events. */
function onFrame(fn) {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(); });
  };
}

/* Header: glass background after scrolling, hides on scroll down, returns on scroll up. */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    header.classList.toggle('is-scrolled', y > 24);
    if (Math.abs(delta) > 6) {
      const hide = delta > 0 && y > 520 && !document.documentElement.classList.contains('menu-open') && !header.contains(document.activeElement);
      header.classList.toggle('is-hidden', hide);
      lastY = y;
    }
    if (y < 24) header.classList.remove('is-hidden');
  };
  window.addEventListener('scroll', onFrame(update), { passive: true });
  update();
}

/* Mobile menu: full-screen overlay, Esc to close, background made inert. */
function initMenu() {
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const label = $('.menu-toggle__label', toggle);
  const background = [$('main'), $('.site-footer'), $('[data-sticky-cta]')].filter(Boolean);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Chiudi' : 'Menu';
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    background.forEach((el) => { el.inert = open; });
    if (open) $('a', menu)?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* Scroll reveal. */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!hasIO || reducedMotion.matches) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/* Stat counters count up once, after the hero entrance. */
function initCounters() {
  if (!hasIO || reducedMotion.matches) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      io.unobserve(target);
      const end = Number(target.dataset.count);
      const duration = 1500;
      target.textContent = '0';
      setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          target.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 4))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 650);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => io.observe(el));
}

/* Journey: progress line fills while scrolling; steps light up as it passes them. */
function initSteps() {
  const list = $('[data-steps]');
  if (!list) return;
  const steps = $$('.step', list);
  const update = () => {
    const anchor = window.innerHeight * 0.62;
    const rect = list.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
    list.style.setProperty('--progress', progress.toFixed(4));
    steps.forEach((step) => {
      step.classList.toggle('is-active', step.getBoundingClientRect().top + 48 < anchor);
    });
  };
  const queued = onFrame(update);
  window.addEventListener('scroll', queued, { passive: true });
  window.addEventListener('resize', queued);
  update();
}

/* Before/after slider: pointer drag (horizontal only on touch, so vertical scrolling still works),
   keyboard via a visually hidden range input, and a one-time nudge to show it is interactive. */
function initCompare() {
  $$('[data-compare]').forEach((el) => {
    const range = $('input[type="range"]', el);
    let pos = 50;
    const set = (value) => {
      pos = Math.min(100, Math.max(0, value));
      el.style.setProperty('--pos', `${pos}%`);
      if (range) range.value = String(Math.round(pos));
    };
    const pctFrom = (clientX) => {
      const r = el.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    };

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let dragging = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      if (e.pointerType === 'mouse') {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        set(pctFrom(e.clientX));
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      if (!dragging) {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx < 6 || dx < dy) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      }
      set(pctFrom(e.clientX));
    });
    const end = (e) => {
      if (e.pointerId !== pointerId) return;
      if (!dragging && e.type === 'pointerup' && e.pointerType !== 'mouse') set(pctFrom(e.clientX));
      dragging = false;
      pointerId = null;
      el.classList.remove('is-dragging');
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    range?.addEventListener('input', () => set(Number(range.value)));

    if (!hasIO || reducedMotion.matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const frames = [[0, 50], [600, 36], [1300, 64], [1900, 50]];
      const t0 = performance.now() + 400;
      const tick = (now) => {
        if (dragging) return;
        const t = now - t0;
        if (t < 0) { requestAnimationFrame(tick); return; }
        let i = 1;
        while (i < frames.length - 1 && t > frames[i][0]) i += 1;
        const [ta, a] = frames[i - 1];
        const [tb, b] = frames[i];
        const p = Math.min(1, Math.max(0, (t - ta) / (tb - ta)));
        const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        set(a + (b - a) * eased);
        if (t < frames[frames.length - 1][0]) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });
}

/* Quiz: four questions, then a pre-filled WhatsApp message (or email). No data leaves the browser. */
function initQuiz() {
  const form = $('[data-quiz]');
  if (!form) return;
  const steps = $$('.quiz__step', form);
  const bars = $$('.quiz__progress span', form);
  const count = $('[data-quiz-count]', form);
  const back = $('[data-quiz-back]', form);
  const next = $('[data-quiz-next]', form);
  const restart = $('[data-quiz-restart]', form);
  const summary = $('[data-quiz-summary]', form);
  const whatsapp = $('[data-quiz-whatsapp]', form);
  const email = $('[data-quiz-email]', form);
  const nameInput = form.elements.nome;
  const fields = [
    ['obiettivo', 'Obiettivo'],
    ['esperienza', 'Esperienza'],
    ['modalita', 'Modalità'],
    ['giorni', 'Disponibilità'],
  ];
  const questions = steps.length - 1;
  let current = 0;
  let viaPointer = false;
  let advanceTimer = 0;

  const value = (name) => form.elements[name]?.value || '';
  const hasAnswer = (i) => i >= questions || Boolean(value(fields[i][0]));

  const message = () => {
    const name = nameInput.value.trim();
    return [
      `Ciao Stiven! ${name ? `Sono ${name}. ` : ''}Vorrei prenotare la consulenza gratuita.`,
      '',
      ...fields.map(([key, label]) => `• ${label}: ${value(key)}`),
    ].join('\n');
  };

  const updateLinks = () => {
    const text = message();
    whatsapp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
    email.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Consulenza gratuita')}&body=${encodeURIComponent(text)}`;
  };

  const renderSummary = () => {
    summary.replaceChildren(...fields.map(([key, label], i) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      const edit = document.createElement('button');
      dt.textContent = label;
      dd.textContent = value(key);
      edit.type = 'button';
      edit.textContent = 'Modifica';
      edit.setAttribute('aria-label', `Modifica ${label.toLowerCase()}`);
      edit.addEventListener('click', () => show(i));
      dd.append(edit);
      row.append(dt, dd);
      return row;
    }));
    updateLinks();
  };

  const show = (i, { focus = true } = {}) => {
    clearTimeout(advanceTimer);
    current = i;
    steps.forEach((step, j) => step.classList.toggle('is-current', j === i));
    bars.forEach((bar, j) => {
      bar.classList.toggle('is-done', j < i);
      bar.classList.toggle('is-current', j === i);
    });
    count.textContent = i < questions ? `Domanda ${i + 1} di ${questions}` : 'Il tuo messaggio';
    back.hidden = i === 0;
    restart.hidden = i !== questions;
    next.hidden = i === questions;
    next.disabled = !hasAnswer(i);
    if (i === questions) renderSummary();
    if (focus) {
      const target = i === questions ? whatsapp : ($('input:checked', steps[i]) || $('input', steps[i]));
      target?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) form.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const advance = () => { if (hasAnswer(current) && current < questions) show(current + 1); };

  form.addEventListener('pointerdown', (e) => { viaPointer = Boolean(e.target.closest('.option')); });
  form.addEventListener('keydown', (e) => {
    viaPointer = false;
    if (e.key === 'Enter' && e.target.matches('input[type="radio"]')) { e.preventDefault(); advance(); }
  });
  form.addEventListener('change', (e) => {
    if (!e.target.matches('input[type="radio"]')) return;
    next.disabled = !hasAnswer(current);
    if (viaPointer) advanceTimer = setTimeout(advance, 320);
  });
  // "Avanti" is the form's submit button, so Enter and clicks share one path.
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  back.addEventListener('click', () => show(Math.max(0, current - 1)));
  restart.addEventListener('click', () => { form.reset(); show(0); });
  nameInput.addEventListener('input', updateLinks);

  show(0, { focus: false });
}

/* Certificate dialog (native <dialog>: focus trap, Esc and top layer for free). */
function initDialogs() {
  $$('[data-dialog-open]').forEach((button) => {
    const dialog = document.getElementById(button.dataset.dialogOpen);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    button.addEventListener('click', () => dialog.showModal());
  });
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    $$('[data-dialog-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
  });
}

/* Cursor-following light on the method cards (mouse only). */
function initSpotlight() {
  if (!finePointer.matches) return;
  $$('[data-spotlight]').forEach((grid) => {
    grid.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.pillar');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* Mobile sticky CTA: visible once the hero is gone, hidden where another CTA is on screen. */
function initStickyCta() {
  const bar = $('[data-sticky-cta]');
  if (!bar || !hasIO) return;
  const watched = ['.hero', '#inizia', '#contatti'].map((s) => $(s)).filter(Boolean);
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    bar.classList.toggle('is-visible', visible.size === 0);
  }, { threshold: 0.08 });
  watched.forEach((el) => io.observe(el));
}

/* Highlight the nav link of the section in view. */
function initActiveNav() {
  if (!hasIO) return;
  const links = new Map($$('.nav__list a').map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(entry.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const section = document.getElementById(id); if (section) io.observe(section); });
}

function initYear() {
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}

[initHeader, initMenu, initReveal, initCounters, initSteps, initCompare, initQuiz, initDialogs, initSpotlight, initStickyCta, initActiveNav, initYear]
  .forEach((init) => {
    try { init(); } catch (error) { console.error(`[site] ${init.name} failed`, error); }
  });
