# Landing: Menopausia sin miedo (Nexo Editorial)

Página de venta del ebook **Menopausia sin miedo** + 3 bonos, para Hotmart.
HTML + CSS + JS puro, sin build: sube la carpeta tal cual a cualquier hosting (Netlify, Vercel, Hostinger, GitHub Pages).

> Debe servirse desde un hosting (o `python3 -m http.server`), no abriendo el archivo con doble clic: la escena 3D usa módulos de JavaScript.

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

- **Intro de marca** al entrar (solo la primera vez por sesión).
- **Flor de loto 3D en tiempo real** (three.js + shaders propios): se abre al entrar, sus pétalos iridiscentes respiran, el centro dorado brilla y hay polen luminoso flotando. Sigue al puntero y cambia de lugar en cada sección (posiciones en `BLOOM_SPOTS`, `main.js`). Sin WebGL se ve un orbe en CSS.
- **Fondo de aurora animada** en las secciones de noche: seda de luz ciruela, petróleo, rosa y dorado que fluye y reacciona al mouse.
- **Scroll suave** con inercia (Lenis) en escritorio.
- **Noche y día**: el fondo pasa de ciruela a crema y vuelve según la sección.
- Muro de frases que muchas mujeres se dicen (tomadas del ebook, sin atribuir a nadie).
- Manifiesto con zoom fijo, dolores en paneles horizontales, índice de capítulos desplegable, 4 preguntas apiladas, bonos que se desbloquean, precio con borde de luz animado, botones magnéticos.
- Respeta `prefers-reduced-motion` (sin animaciones) y funciona aunque no carguen GSAP ni three.js.

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
| `styles.css` | Diseño: temas noche/día y paleta de marca |
| `main.js` | Configuración, intro, scroll, escenas e interacciones |
| `bloom.js` | Escena 3D (three.js) |
| `assets/og.jpg` | Imagen al compartir en WhatsApp o redes (1200x630) |

## Probar en local

```bash
cd LANDING-MENOPAUSIA
python3 -m http.server 8000
# abre http://localhost:8000
```
