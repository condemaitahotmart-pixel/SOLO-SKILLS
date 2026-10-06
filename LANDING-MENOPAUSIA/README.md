# Landing: Menopausia sin miedo (Nexo Editorial)

Página de venta del ebook **Menopausia sin miedo** + 3 bonos, para Hotmart.
HTML + CSS + JS puro, sin build: sube la carpeta tal cual a cualquier hosting (Netlify, Vercel, Hostinger, GitHub Pages).

## Antes de publicar (en `main.js`, objeto `CONFIG`)

| Campo | Qué poner |
|---|---|
| `checkoutUrl` | **Tu link de checkout de Hotmart.** Mientras tenga `XXXX`, los botones bajan a la sección de precio |
| `price` / `bumpPrice` | `US$17.97` / `US$9.97` |
| `guaranteeDays` | **Confirma los días configurados en Hotmart** (está en 7). Con `null` se ocultan todas las menciones de garantía |
| `testimonials` | Testimonios **reales y autorizados**. Mientras la lista esté vacía, la sección no aparece |

Ejemplo de testimonio:

```js
testimonials: [
  { quote: "Lo que la lectora escribió, tal cual.", name: "Nombre o iniciales", detail: "52 años, Bogotá" },
],
```

En `index.html`, pie de página: enlaza **Términos** y **Privacidad** y cambia `hola@tudominio.com`.

## Qué tiene

- Paleta clara de marca (crema, rubor, salvia, arena) con petróleo y ciruela para texto y botones; el fondo cambia de tono suavemente según la sección.
- Ilustración de la mujer en el arco (SVG propio) que se arma al cargar: arco, sol, mujer, hojas, luna y destellos; las capas siguen al mouse.
- Intro de marca, scroll suave (Lenis), títulos que suben por máscara, botones magnéticos y con brillo.
- Dolores en tarjetas ilustradas que pasan en horizontal; muro de consejos contradictorios.
- "Otra forma de mirarlo": una línea enredada se desenreda con el scroll y termina en un brote.
- 10 capítulos, 4 preguntas apiladas, bonos con candados que se abren, amanecer que sale junto al precio, tres arcos en el cierre.
- Respeta `prefers-reduced-motion` y funciona aunque no cargue GSAP.

## Lo que respeta (según tu brief)

- Sin precio tachado, sin cuenta regresiva, sin testimonios ni cifras inventadas.
- Sin promesas médicas: comprender, observar, actuar, cuidarse y saber cuándo consultar.
- Solo bajo **Nexo Editorial**; las fuentes (NIH, ACOG, The Menopause Society, HHS) se citan aclarando que no respaldan la guía.
- Aviso médico y aviso de "no afiliado a Meta" en el pie.
- No usa imágenes del ebook. `assets/og.jpg` (vista previa al compartir el link) es una captura del hero.

## Archivos

| Ruta | Qué es |
|---|---|
| `index.html` | Estructura y textos |
| `styles.css` | Diseño y paleta de marca |
| `main.js` | Configuración, intro, scroll, escenas e interacciones |
| `assets/og.jpg` | Imagen al compartir en WhatsApp o redes (1200x630) |

## Probar en local

```bash
cd LANDING-MENOPAUSIA
python3 -m http.server 8000
# abre http://localhost:8000
```
