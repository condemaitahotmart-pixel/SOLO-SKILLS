// ================= CONFIGURACIÓN: edita aquí =================
const CONFIG = {
  // Link de checkout de Hotmart (Producto > Links de venta). Mientras tenga XXXX, los botones bajan al precio.
  checkoutUrl: "https://pay.hotmart.com/XXXXXXXXXX",
  price: "US$17.97",
  bumpPrice: "US$9.97",
  // Días de garantía configurados en Hotmart. Pon null para ocultar todas las menciones de garantía.
  guaranteeDays: 7,
};
// =============================================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = matchMedia("(min-width: 960px)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

document.documentElement.classList.add("js");

// ---------- Datos de la oferta ----------
if (!CONFIG.checkoutUrl.includes("XXXX")) {
  $$(".js-checkout").forEach((a) => (a.href = CONFIG.checkoutUrl));
}
$$(".js-price").forEach((el) => (el.textContent = CONFIG.price));
$$(".js-bump-price").forEach((el) => (el.textContent = CONFIG.bumpPrice));
$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
if (CONFIG.guaranteeDays) {
  $$(".js-guarantee").forEach((el) => (el.textContent = CONFIG.guaranteeDays));
} else {
  $$(".js-guarantee-section, .js-guarantee-row, .js-guarantee-faq").forEach((el) => (el.hidden = true));
}

// ---------- Escalonado de entrada del hero ----------
$$(".hero-in").forEach((el, i) => el.style.setProperty("--i", i));

// ---------- Tarjetas que se voltean ----------
$$(".flip").forEach((card) =>
  card.addEventListener("click", () => {
    card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
  })
);

// ---------- Visor de páginas ----------
const viewer = $(".js-viewer");
const viewerImg = $(".js-viewer-img");
$$(".page").forEach((p) =>
  p.addEventListener("click", () => {
    viewerImg.src = p.dataset.src;
    viewerImg.alt = $("img", p).alt;
    viewer.showModal();
  })
);
$(".js-viewer-close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });

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
  // Libera transform/transition para que :hover y :active funcionen después
  setTimeout(() => el.classList.remove("reveal", "is-in"), 1500);
};
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.remove("reveal"));
}

// ---------- El abanico de páginas se abre al entrar ----------
const deck = $(".js-deck");
new IntersectionObserver(([e]) => deck.classList.toggle("is-open", e.isIntersecting), { threshold: 0.45 }).observe(deck);

// ---------- Línea de tiempo de bonos (respaldo sin GSAP) ----------
const tls = $$(".tl");
const timeline = $(".js-timeline");
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-lit"); });
}, { rootMargin: "0px 0px -35% 0px" });
tls.forEach((t) => tlObserver.observe(t));

// ---------- Barra fija móvil y nav ----------
const sticky = $(".sticky-cta");
const vis = { hero: true, offer: false, final: false };
const updateSticky = () => {
  const show = !vis.hero && !vis.offer && !vis.final;
  sticky.classList.toggle("is-visible", show);
  sticky.setAttribute("aria-hidden", String(!show));
  $("a", sticky).tabIndex = show ? 0 : -1;
};
[["hero", ".hero"], ["offer", "#precio"], ["final", ".final"]].forEach(([k, sel]) => {
  new IntersectionObserver(([e]) => { vis[k] = e.isIntersecting; updateSticky(); }).observe($(sel));
});

// ---------- Inclinación del libro con el puntero (escritorio) ----------
const tilt = $(".js-tilt");
if (finePointer && !reduceMotion) {
  const hero = $(".hero");
  let raf = 0;
  hero.addEventListener("pointermove", (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 10}deg)`;
    });
  });
  hero.addEventListener("pointerleave", () => (tilt.style.transform = ""));
  tilt.style.transition = "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
}

// ---------- Texto que se enciende: separar en palabras ----------
$$(".js-scrub").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
});

// ---------- GSAP ----------
window.addEventListener("load", () => {
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("has-gsap");

  // 1. Entrada del libro (el abanico de bonos se anima en CSS)
  gsap.set(".js-book", { rotationY: -24, rotationX: 4 });
  gsap.from(".js-book", { y: 60, rotationY: -70, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.15 });
  gsap.fromTo(".book__sheen", { xPercent: -100 }, { xPercent: 120, duration: 1.6, ease: "power2.inOut", delay: 1.1, repeat: -1, repeatDelay: 5 });

  // 2. Al bajar, el libro gira un poco y la escena se aleja (profundidad)
  gsap.fromTo(".js-book", { rotationY: -24, y: 0 }, {
    rotationY: -34, y: -30, ease: "none", immediateRender: false,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // 3. Frases clave: las palabras se encienden en orden de lectura
  $$(".js-scrub").forEach((el) => {
    gsap.to($$(".w", el), {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true },
    });
  });

  // 4. Capítulos: el carrusel se desplaza en horizontal mientras bajas (solo escritorio)
  ScrollTrigger.matchMedia({
    "(min-width: 960px)": () => {
      const track = $(".js-track");
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: ".chapters__pin", start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
    },
  });

  // 5. Línea de tiempo de bonos: el riel se llena al avanzar
  gsap.fromTo(timeline, { "--fill": 0 }, {
    "--fill": 1, ease: "none",
    scrollTrigger: { trigger: timeline, start: "top 70%", end: "bottom 60%", scrub: true },
  });
});
