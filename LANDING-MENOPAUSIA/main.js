// ================= CONFIGURACIÓN: edita aquí =================
const CONFIG = {
  // Link de checkout de Hotmart (Producto > Links de venta)
  checkoutUrl: "https://pay.hotmart.com/XXXXXXXXXX",
  price: "USD 27",
  oldPrice: "USD 67",
  installments: "6 cuotas",
  // Video de venta (VSL). Ejemplos:
  //   YouTube: "https://www.youtube.com/embed/ID?autoplay=1&rel=0"
  //   Vimeo:   "https://player.vimeo.com/video/ID?autoplay=1"
  // Déjalo vacío para mostrar solo el póster.
  videoUrl: "",
  // Fin REAL de la oferta de lanzamiento, ej. "2026-10-20T23:59:00-05:00".
  // Déjalo en null para no mostrar cuenta regresiva.
  deadline: null,
};
// =============================================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

// ---------- Checkout, precios, año ----------
if (!CONFIG.checkoutUrl.includes("XXXX")) {
  $$(".js-checkout").forEach((a) => (a.href = CONFIG.checkoutUrl));
}
$$(".js-price").forEach((el) => (el.textContent = CONFIG.price));
$$(".js-price-old").forEach((el) => (el.textContent = CONFIG.oldPrice));
$$(".js-installments").forEach((el) => (el.textContent = CONFIG.installments));
$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

// ---------- Cuenta regresiva (solo con fecha real) ----------
if (CONFIG.deadline) {
  const end = new Date(CONFIG.deadline).getTime();
  const box = $(".js-countdown");
  const out = $(".js-countdown-time");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const left = end - Date.now();
    if (left <= 0) { box.hidden = true; return; }
    const d = Math.floor(left / 864e5);
    const h = Math.floor((left % 864e5) / 36e5);
    const m = Math.floor((left % 36e5) / 6e4);
    const s = Math.floor((left % 6e4) / 1e3);
    out.textContent = (d ? `${d}d ` : "") + `${pad(h)}:${pad(m)}:${pad(s)}`;
    box.hidden = false;
    setTimeout(tick, 1000);
  };
  tick();
}

// ---------- Video de venta ----------
if (CONFIG.videoUrl) {
  const video = $(".js-video");
  const play = $(".js-play");
  video.classList.add("has-video");
  play.hidden = false;
  $(".js-play-caption").hidden = false;
  play.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = CONFIG.videoUrl;
    iframe.title = "Video de presentación de Plenitud";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    video.replaceChildren(iframe);
  });
}

// ---------- Foto opcional de la autora ----------
$$(".js-optional-img").forEach((img) => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop();
  else img.addEventListener("error", drop, { once: true });
});

// ---------- Test de síntomas ----------
const opts = $$(".opt");
const count = $(".js-quiz-count");
const msg = $(".js-quiz-msg");
const quizCta = $(".js-quiz-cta");
const messages = [
  "Empieza marcando los síntomas que sientes.",
  "Es un comienzo. Entender qué lo provoca ya te da ventaja.",
  "Tu cuerpo te está hablando. El Método 5R te ayuda a escucharlo.",
  "No estás sola: así se siente la mayoría en esta etapa. Hay mucho que puedes hacer.",
  "Estás cargando mucho. Mereces un plan claro para sentirte tú otra vez.",
];
const updateQuiz = () => {
  const n = opts.filter((o) => o.getAttribute("aria-pressed") === "true").length;
  count.textContent = n;
  msg.textContent = messages[n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4];
  quizCta.hidden = n === 0;
};
opts.forEach((o) =>
  o.addEventListener("click", () => {
    o.setAttribute("aria-pressed", String(o.getAttribute("aria-pressed") !== "true"));
    updateQuiz();
  })
);

// ---------- Antes / Después ----------
const sw = $(".switch");
const list = $(".shift__list");
const setState = (state, animate = true) => {
  sw.dataset.state = state;
  $$(".switch__btn", sw).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.state === state)));
  const apply = () => {
    $$("span[data-hoy]", list).forEach((s) => (s.textContent = s.dataset[state]));
    list.dataset.state = state;
    list.classList.remove("is-swapping");
  };
  if (!animate || reduceMotion) return apply();
  list.classList.add("is-swapping");
  setTimeout(apply, 280);
};
$$(".switch__btn", sw).forEach((b) => b.addEventListener("click", () => setState(b.dataset.state)));
setState("hoy", false);

// ---------- Testimonios ----------
const voices = $$(".voice");
const pos = $(".js-pos");
let current = 0;
let timer;
const show = (i) => {
  current = (i + voices.length) % voices.length;
  voices.forEach((v, k) => v.classList.toggle("is-active", k === current));
  pos.textContent = current + 1;
};
const autoplay = () => {
  clearInterval(timer);
  if (!reduceMotion) timer = setInterval(() => show(current + 1), 7000);
};
$(".js-prev").addEventListener("click", () => { show(current - 1); autoplay(); });
$(".js-next").addEventListener("click", () => { show(current + 1); autoplay(); });
autoplay();

// ---------- FAQ: una abierta a la vez ----------
const faqs = $$(".accordion details");
faqs.forEach((d) => d.addEventListener("toggle", () => {
  if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
}));

// ---------- Entradas al hacer scroll ----------
const reveals = $$(".reveal");
const groups = new Map();
reveals.forEach((el) => {
  const i = groups.get(el.parentElement) ?? 0;
  el.style.setProperty("--i", Math.min(i, 6));
  groups.set(el.parentElement, i + 1);
});
const settle = (el) => {
  el.classList.add("is-in");
  // Libera transform/transition para que los estados :hover y :active funcionen
  setTimeout(() => el.classList.remove("reveal", "is-in"), 1600);
};
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.remove("reveal"));
}

// ---------- Barra fija móvil ----------
const sticky = $(".sticky-cta");
const vis = { hero: true, offer: false, final: false };
const updateSticky = () => {
  const show = !vis.hero && !vis.offer && !vis.final;
  sticky.classList.toggle("is-visible", show);
  sticky.setAttribute("aria-hidden", String(!show));
  $("a", sticky).tabIndex = show ? 0 : -1;
};
[["hero", ".hero"], ["offer", "#oferta"], ["final", ".final"]].forEach(([k, sel]) => {
  new IntersectionObserver(([e]) => { vis[k] = e.isIntersecting; updateSticky(); }).observe($(sel));
});

// ---------- GSAP: texto que se revela, curva hormonal, pilares ----------
window.addEventListener("load", () => {
  const scrub = $(".js-scrub");
  const words = scrub.textContent.trim().split(/\s+/);
  scrub.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");

  const path = $(".js-curve");
  const len = path.getTotalLength();

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("has-gsap");

  // 1. Palabras que se encienden al hacer scroll (cuenta la historia en orden)
  gsap.to(".js-scrub .w", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: scrub, start: "top 80%", end: "bottom 45%", scrub: true },
  });

  // 2. La curva del estrógeno se dibuja mientras la lees
  gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
    strokeDashoffset: 0, ease: "none",
    scrollTrigger: { trigger: ".why__chart", start: "top 75%", end: "bottom 70%", scrub: 0.6 },
  });
  gsap.from(".curve__area", {
    opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".why__chart", start: "center 70%", end: "bottom 65%", scrub: true },
  });

  // 3. Pilares: crecen al entrar y se atenúan al salir (jerarquía: el pilar actual manda)
  if (matchMedia("(min-width: 900px)").matches) {
    $$(".pillar").forEach((card) => {
      gsap.fromTo(card, { scale: 0.9, opacity: 0.4 }, {
        scale: 1, opacity: 1, ease: "none",
        scrollTrigger: { trigger: card, start: "top 95%", end: "top 55%", scrub: true },
      });
      gsap.to(card, {
        opacity: 0.35, scale: 0.96, ease: "none",
        scrollTrigger: { trigger: card, start: "bottom 35%", end: "bottom 5%", scrub: true },
      });
    });
  }

  // 4. Profundidad suave del amanecer del hero
  gsap.to(".hero .bloom", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
});
