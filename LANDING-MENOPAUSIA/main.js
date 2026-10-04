// ============ CONFIGURACIÓN: edita aquí ============
const CONFIG = {
  // Link de checkout de Hotmart (Producto > Links de venta)
  checkoutUrl: "https://pay.hotmart.com/XXXXXXXXXX",
  price: "USD 27",
  oldPrice: "USD 67",
};
// ====================================================

document.documentElement.classList.add("js");

// Checkout y precios
const hasCheckout = !CONFIG.checkoutUrl.includes("XXXX");
document.querySelectorAll(".js-checkout").forEach((a) => {
  if (hasCheckout) {
    a.href = CONFIG.checkoutUrl;
    a.rel = "noopener";
  }
});
document.querySelectorAll(".js-price").forEach((el) => (el.textContent = CONFIG.price));
document.querySelectorAll(".js-price-old").forEach((el) => (el.textContent = CONFIG.oldPrice));
document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Marco de reemplazo si falta una foto en /img
document.querySelectorAll("img[data-fallback]").forEach((img) => {
  const swap = () => {
    const box = document.createElement("div");
    box.className = "img-missing";
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", img.alt);
    box.textContent = `${img.dataset.fallback}: sube ${img.getAttribute("src")}`;
    img.replaceWith(box);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener("error", swap, { once: true });
});

// Aparición escalonada al entrar en pantalla
const reveals = document.querySelectorAll(".reveal");
const groups = new Map();
reveals.forEach((el) => {
  const parent = el.parentElement;
  const i = groups.get(parent) ?? 0;
  el.style.setProperty("--i", Math.min(i, 6));
  groups.set(parent, i + 1);
});
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-in"));
}

// Borde de la barra de navegación y barra fija móvil
const nav = document.querySelector(".nav");
const sticky = document.querySelector(".sticky-cta");
const hero = document.querySelector(".hero");
const offer = document.querySelector("#oferta");
let heroVisible = true;
let offerVisible = false;
const updateSticky = () => {
  const show = !heroVisible && !offerVisible;
  sticky.classList.toggle("is-visible", show);
  sticky.setAttribute("aria-hidden", String(!show));
  sticky.querySelector("a").tabIndex = show ? 0 : -1;
};
new IntersectionObserver(([e]) => {
  heroVisible = e.isIntersecting;
  nav.classList.toggle("is-scrolled", !e.isIntersecting || e.boundingClientRect.top < 0);
  updateSticky();
}, { threshold: 0.05 }).observe(hero);
new IntersectionObserver(([e]) => {
  offerVisible = e.isIntersecting;
  updateSticky();
}).observe(offer);

// Carrusel de testimonios
const track = document.querySelector(".js-track");
const step = () => {
  const card = track.querySelector(".quote");
  return card ? card.getBoundingClientRect().width + 20 : 400;
};
const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
document.querySelector(".js-prev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: smooth }));
document.querySelector(".js-next").addEventListener("click", () => track.scrollBy({ left: step(), behavior: smooth }));

// Solo una pregunta abierta a la vez
const faqs = document.querySelectorAll(".accordion details");
faqs.forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
  })
);
