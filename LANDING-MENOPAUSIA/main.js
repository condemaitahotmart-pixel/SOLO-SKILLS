// ================= CONFIGURACIÓN: edita aquí =================
const CONFIG = {
  // Link de checkout de Hotmart (Producto > Links de venta). Mientras tenga XXXX, los botones bajan al precio.
  checkoutUrl: "https://pay.hotmart.com/XXXXXXXXXX",
  price: "US$17.97",
  bumpPrice: "US$9.97",
  // Días de garantía configurados en Hotmart. Pon null para ocultar todas las menciones de garantía.
  guaranteeDays: 7,
  // Testimonios REALES y con autorización. Mientras la lista esté vacía, la sección no aparece.
  // Ejemplo: { quote: "Texto del testimonio", name: "Nombre", detail: "48 años, Lima" }
  testimonials: [],
};
// =============================================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const isDesktop = () => matchMedia("(min-width: 960px)").matches;

// ---------- Datos de la oferta ----------
if (!CONFIG.checkoutUrl.includes("XXXX")) $$(".js-checkout").forEach((a) => (a.href = CONFIG.checkoutUrl));
$$(".js-price").forEach((el) => (el.textContent = CONFIG.price));
$$(".js-bump-price").forEach((el) => (el.textContent = CONFIG.bumpPrice));
$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
if (CONFIG.guaranteeDays) {
  $$(".js-guarantee").forEach((el) => (el.textContent = CONFIG.guaranteeDays));
} else {
  $$(".js-guarantee-section, .js-guarantee-row, .js-guarantee-faq").forEach((el) => (el.hidden = true));
}

// ---------- Testimonios reales ----------
if (CONFIG.testimonials.length) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $(".js-voices").innerHTML = CONFIG.testimonials.map((t) =>
    `<figure class="voice reveal"><blockquote>“${esc(t.quote)}”</blockquote><figcaption><strong>${esc(t.name)}</strong>${esc(t.detail || "")}</figcaption></figure>`
  ).join("");
  $(".voices").hidden = false;
}

// ---------- Capítulos desplegables ----------
$$(".ch__row").forEach((b) => b.addEventListener("click", () => {
  b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"));
}));

// ---------- FAQ: una abierta a la vez ----------
const faqs = $$(".accordion details");
faqs.forEach((d) => d.addEventListener("toggle", () => { if (d.open) faqs.forEach((o) => o !== d && (o.open = false)); }));

// ---------- Entradas al hacer scroll ----------
const reveals = $$(".reveal");
const groups = new Map();
reveals.forEach((el) => {
  const i = groups.get(el.parentElement) ?? 0;
  el.style.setProperty("--i", Math.min(i, 6));
  groups.set(el.parentElement, i + 1);
});
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
      setTimeout(() => e.target.classList.remove("reveal", "is-in"), 1600);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.remove("reveal"));
}

// ---------- Bonos que se desbloquean ----------
const unlockObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-lit"); });
}, { rootMargin: "0px 0px -40% 0px" });
$$(".ul").forEach((u) => unlockObs.observe(u));

// ---------- Barra fija móvil ----------
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

// ---------- Posición de la flor 3D por sección (la lee bloom.js) ----------
// x/y en unidades de pantalla (-1 a 1), s = escala. En móvil se acerca al centro.
window.__bloom = { x: 0, y: -0.1, s: 1 };
const BLOOM_SPOTS = {
  hero: { x: 0.52, y: 0.02, s: 0.74, mx: 0.3, my: 0.72, ms: 0.8 },
  whispers: { x: 0.78, y: -0.72, s: 0.45, mx: 0.55, my: -0.78, ms: 0.5 },
  manifesto: { x: 0, y: -0.82, s: 0.7, mx: 0, my: -0.8, ms: 0.7 },
  offer: { x: 0.95, y: -0.8, s: 0.55, mx: 0.62, my: 0.98, ms: 0.42 },
  guarantee: { x: -0.72, y: -0.62, s: 0.45, mx: -0.55, my: -0.85, ms: 0.45 },
  final: { x: 0, y: 1.05, s: 0.58, mx: 0, my: 1.0, ms: 0.6 },
};
const setBloom = (key) => {
  const spot = BLOOM_SPOTS[key];
  if (!spot) return;
  if (isDesktop()) Object.assign(window.__bloom, { x: spot.x, y: spot.y, s: spot.s });
  else Object.assign(window.__bloom, { x: spot.mx ?? spot.x * 0.45, y: spot.my ?? spot.y, s: spot.ms ?? spot.s * 0.85 });
};

setBloom("hero");

// ---------- Intro, scroll suave y escenas con GSAP ----------
const ready = () => root.classList.add("is-ready");

window.addEventListener("DOMContentLoaded", () => {
  const hasGsap = window.gsap && window.ScrollTrigger;
  const loader = $(".loader");
  let seen = false;
  try { seen = sessionStorage.getItem("nexo-intro") === "1"; } catch (e) {}

  if (!hasGsap || reduceMotion || seen) {
    ready();
  } else {
    try { sessionStorage.setItem("nexo-intro", "1"); } catch (e) {}
    loader.classList.add("is-on");
    gsap.timeline({ onComplete: () => loader.remove() })
      .to(".loader__line span", { y: 0, duration: 1, ease: "expo.out", stagger: 0.12 })
      .to(".loader__bar span", { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, "-=0.6")
      .addLabel("open", "+=0.2")
      .add(ready, "open+=0.25")
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "open");
    setTimeout(ready, 3500);
  }

  if (!hasGsap || reduceMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("has-gsap");

  // Scroll suave con inercia (escritorio; en táctil se mantiene el scroll nativo)
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2 || !document.querySelector(id)) return;
      e.preventDefault();
      lenis.scrollTo(id, { offset: -20, duration: 1.4 });
    }));
  }

  // 2. Manifiesto: la primera frase se aleja y aparece la segunda (el giro de la idea)
  gsap.timeline({
    scrollTrigger: { trigger: ".manifesto", start: "top top", end: "+=140%", pin: ".manifesto__pin", scrub: 1 },
  })
    .to(".js-mf-a", { scale: 0.86, opacity: 0, filter: "blur(10px)", ease: "power1.in", duration: 1 })
    .fromTo(".js-mf-b", { opacity: 0, y: 70, scale: 1.08, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 1 }, "-=0.35")
    .to({}, { duration: 0.4 });
  ScrollTrigger.create({ trigger: ".manifesto", start: "top top", end: "+=140%", onUpdate: (s) => { window.__bloom.s = 0.7 * (1 + s.progress * 0.3); } });

  // 3. Dolores: paneles que pasan en horizontal mientras bajas (escritorio)
  ScrollTrigger.matchMedia({
    "(min-width: 960px)": () => {
      const track = $(".js-pains");
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".pains__pin", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      $$(".panel__art i").forEach((icon) => {
        gsap.fromTo(icon, { rotate: -12, scale: 0.9 }, {
          rotate: 12, scale: 1.08, ease: "none",
          scrollTrigger: { trigger: ".pains__pin", start: "top top", end: () => `+=${dist()}`, scrub: true },
        });
      });
    },
  });

  // 4. Riel de los bonos que se llena al avanzar
  gsap.fromTo(".js-unlock", { "--fill": 0 }, {
    "--fill": 1, ease: "none",
    scrollTrigger: { trigger: ".js-unlock", start: "top 65%", end: "bottom 60%", scrub: true },
  });

  // 5. Titular final que sube desde su máscara
  gsap.from(".final__title .line > span", {
    yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.12,
    scrollTrigger: { trigger: ".final", start: "top 60%", once: true },
  });

  // 6. Botones magnéticos (escritorio): invitan al clic sin moverse de su sitio
  if (finePointer) {
    $$(".magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  // 7. Noche y día (se crea al final, después de las secciones fijas, para medir bien): el fondo cambia de color según la sección (cuenta la historia: de la confusión a la claridad)
  $$("main [data-theme], footer[data-theme]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => {
        if (!self.isActive) return;
        document.body.dataset.theme = sec.dataset.theme;
        const key = [...sec.classList].find((c) => BLOOM_SPOTS[c]);
        if (key) setBloom(key);
      },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
});
