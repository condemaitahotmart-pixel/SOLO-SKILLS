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
const TONES = { cream: "#f8f2e9", blush: "#f7e6e1", sage: "#e4eadc", sand: "#f1e6d3" };

// ---------- Datos de la oferta ----------
if (!CONFIG.checkoutUrl.includes("XXXX")) $$(".js-checkout").forEach((a) => (a.href = CONFIG.checkoutUrl));
$$(".js-price").forEach((el) => (el.textContent = CONFIG.price));
$$(".js-bump-price").forEach((el) => (el.textContent = CONFIG.bumpPrice));
$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
if (CONFIG.guaranteeDays) {
  $$(".js-guarantee").forEach((el) => (el.textContent = CONFIG.guaranteeDays));
} else {
  $$(".js-guarantee-text, .js-guarantee-faq").forEach((el) => (el.hidden = true));
}

// ---------- Testimonios reales ----------
if (CONFIG.testimonials.length) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $(".js-voices").innerHTML = CONFIG.testimonials.map((t) =>
    `<figure class="voice reveal"><blockquote>“${esc(t.quote)}”</blockquote><figcaption><strong>${esc(t.name)}</strong>${esc(t.detail || "")}</figcaption></figure>`
  ).join("");
  $(".voices").hidden = false;
}

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
      setTimeout(() => e.target.classList.remove("reveal", "is-in"), 1500);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.remove("reveal"));
}

// ---------- Bonos: se abre el candado al llegar ----------
const unlockObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-lit"); });
}, { rootMargin: "0px 0px -35% 0px" });
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

// ---------- Ilustración: las capas siguen al puntero (profundidad) ----------
if (finePointer && !reduceMotion) {
  const layers = $$(".js-art [data-depth]");
  layers.forEach((l) => (l.style.transition = "translate 1.2s cubic-bezier(0.16, 1, 0.3, 1)"));
  $(".hero").addEventListener("pointermove", (e) => {
    const dx = e.clientX / window.innerWidth - 0.5;
    const dy = e.clientY / window.innerHeight - 0.5;
    layers.forEach((l) => {
      const d = +l.dataset.depth;
      l.style.translate = `${-dx * d * 0.6}px ${-dy * d * 0.45}px`;
    });
  });
}

// ---------- Intro, scroll suave y escenas con GSAP ----------
const ready = () => root.classList.add("is-ready");

window.addEventListener("DOMContentLoaded", () => {
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (!hasGsap || reduceMotion) { ready(); return; }

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("has-gsap");

  // 1. La ilustración se arma: arco, sol, mujer, hojas, luna y destellos (presenta a la protagonista)
  gsap.set(".art__arch", { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(".art__halo", { scale: 0.3, opacity: 0, y: 40, transformOrigin: "50% 50%" });
  gsap.set(".art__woman", { y: 70, opacity: 0 });
  gsap.set(".art__leaves", { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(".art__leaves .lf", { opacity: 0 });
  gsap.set(".art__moon", { scale: 0, rotate: -60, transformOrigin: "50% 50%" });
  gsap.set(".art__sparks use, .art__orbit", { opacity: 0 });
  const buildArt = () => gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(".art__arch", { scaleY: 1, duration: 1.4 })
    .to(".art__orbit", { opacity: 1, duration: 1.2 }, 0.2)
    .to(".art__halo", { scale: 1, opacity: 1, y: 0, duration: 1.6 }, 0.35)
    .to(".art__woman", { y: 0, opacity: 1, duration: 1.4 }, 0.55)
    .to(".art__leaves", { scaleY: 1, duration: 1.3, stagger: 0.12 }, 0.8)
    .to(".art__leaves .lf", { opacity: 1, duration: 0.6, stagger: 0.05 }, 1)
    .to(".art__moon", { scale: 1, rotate: 0, duration: 1.2, ease: "back.out(1.8)" }, 1.1)
    .to(".art__sparks use", { opacity: 1, duration: 0.5, stagger: 0.1 }, 1.3);

  // 2. Intro de marca (una vez por sesión)
  const loader = $(".loader");
  let seen = false;
  try { seen = sessionStorage.getItem("nexo-intro") === "1"; } catch (e) {}
  if (seen) {
    ready(); buildArt();
  } else {
    try { sessionStorage.setItem("nexo-intro", "1"); } catch (e) {}
    loader.classList.add("is-on");
    gsap.timeline({ onComplete: () => loader.remove() })
      .from(".loader__arch", { scaleY: 0, duration: 0.9, ease: "expo.out" })
      .to(".loader__line span", { y: 0, duration: 1, ease: "expo.out", stagger: 0.12 }, 0.2)
      .addLabel("open", "+=0.25")
      .add(() => { ready(); buildArt(); }, "open+=0.2")
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "open");
    setTimeout(() => { if (!root.classList.contains("is-ready")) { ready(); buildArt(); } }, 3500);
  }

  // 3. Scroll suave con inercia
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09 });
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

  // 4. La ilustración se aleja suavemente al bajar
  gsap.to(".js-art", { y: 80, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  ScrollTrigger.matchMedia({
    // Escritorio: secciones fijas
    "(min-width: 960px)": () => {
      // 5. Dolores en horizontal
      const track = $(".js-pains");
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".pains__pin", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      // 6. La línea enredada se desenreda y brota; luego aparece hacia dónde puedes ir
      reframeTimeline({ trigger: ".reframe", start: "top top", end: "+=130%", pin: ".reframe__pin", scrub: 1 });
    },
    // Móvil: mismas ideas, sin fijar la pantalla
    "(max-width: 959px)": () => {
      reframeTimeline({ trigger: ".squiggle", start: "top 85%", end: "bottom 30%", scrub: 1 });
    },
  });

  function reframeTimeline(st) {
    const path = $(".js-squiggle");
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(".js-sprout", { scale: 0, transformOrigin: "50% 100%" });
    gsap.timeline({ scrollTrigger: st })
      .to(path, { strokeDashoffset: 0, ease: "none", duration: 1.4 })
      .to(".js-sprout", { scale: 1, ease: "back.out(2)", duration: 0.4 })
      .from(".js-from", { opacity: 0, y: 30, duration: 0.4 }, 0.5)
      .from(".js-to", { opacity: 0, y: 50, scale: 0.96, duration: 0.5 }, 1.2)
      .from(".js-steps li", { opacity: 0, y: 16, stagger: 0.08, duration: 0.3 }, 1.5);
  }

  // 7. Riel de los bonos que se llena
  gsap.fromTo(".js-unlock", { "--fill": 0 }, {
    "--fill": 1, ease: "none",
    scrollTrigger: { trigger: ".js-unlock", start: "top 70%", end: "bottom 60%", scrub: true },
  });

  // 8. El sol sale mientras llegas al precio
  gsap.fromTo(".js-sun", { y: 70 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".sunrise", start: "top 95%", end: "center 55%", scrub: true } });

  // 9. Cierre: los tres arcos suben y el titular aparece desde su máscara
  gsap.from(".js-arches g", { scaleY: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".final", start: "top 70%", once: true } });
  gsap.from(".final__title .line > span", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".final", start: "top 65%", once: true } });

  // 10. Botones magnéticos (escritorio)
  if (finePointer) {
    $$(".magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.32);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  // 11. El fondo cambia de tono según la sección (se crea al final para medir bien las secciones fijas)
  $$("main section[data-tone]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => { if (self.isActive) document.body.style.backgroundColor = TONES[sec.dataset.tone]; },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
});
