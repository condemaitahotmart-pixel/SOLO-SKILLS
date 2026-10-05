# Landing: Menopausia sin miedo (Nexo Editorial)

Página de venta del ebook **Menopausia sin miedo** + 3 bonos, para Hotmart.
HTML + CSS + JS puro, sin build: sube la carpeta tal cual a cualquier hosting (Netlify, Vercel, Hostinger, GitHub Pages).

## Antes de publicar (en `main.js`, objeto `CONFIG`)

| Campo | Qué poner |
|---|---|
| `checkoutUrl` | **Tu link de checkout de Hotmart.** Mientras tenga `XXXX`, los botones bajan a la sección de precio |
| `price` | `US$17.97` |
| `bumpPrice` | `US$9.97` (Plan Menopausia +40, se añade en el checkout) |
| `guaranteeDays` | **Confirma los días configurados en Hotmart** (está en 7, el mínimo de Hotmart). Con `null` se ocultan todas las menciones de garantía |

En `index.html`, pie de página: enlaza **Términos** y **Privacidad** y cambia `hola@tudominio.com` por tu correo.

## Lo que respeta esta versión (según tu brief)

- Sin precio tachado, sin cuenta regresiva, sin testimonios ni cifras de ventas.
- Sin promesas médicas: el copy habla de comprender, observar, actuar, cuidarse y saber cuándo consultar.
- El producto se presenta solo bajo **Nexo Editorial** (sin autora ni credenciales).
- Las fuentes (NIH, ACOG, The Menopause Society, HHS) se citan como referencia, aclarando que no respaldan la guía.
- Aviso médico y aviso de "no afiliado a Meta" en el pie (útil para Meta Ads).

Cuando tengas **testimonios reales con autorización**, se pueden añadir en una sección propia.

## Estructura

1. Hero con la frase de la clienta, libro en 3D y los 3 bonos en abanico
2. Marquesina con los temas de la guía
3. Cuatro dolores en tarjetas que se voltean (sueño, cuerpo, emociones, confusión)
4. La idea central: texto que se enciende al hacer scroll + "Antes / Después de leerla"
5. Los 10 capítulos en un carrusel horizontal (fijo al hacer scroll en escritorio, deslizable en móvil)
6. "Así se ve por dentro": páginas reales en abanico, con visor ampliado
7. Las 4 preguntas del capítulo 10, en tarjetas que se apilan
8. Bonos en línea de tiempo (días 0, 3, 6 y 8)
9. Oferta: lo incluido, precio y order bump opcional
10. Garantía · Para quién es · Nexo Editorial y fuentes · Preguntas frecuentes
11. Cierre con la última frase del libro
12. Barra fija con precio y botón en móvil

## Archivos

| Ruta | Qué es |
|---|---|
| `index.html` | Estructura y textos |
| `styles.css` | Diseño: paleta de marca en `:root`, modo oscuro automático |
| `main.js` | Configuración, animaciones (GSAP + ScrollTrigger) e interacciones |
| `assets/covers/` | Portadas originales extraídas de tus PDF |
| `assets/pages/` | 10 páginas interiores de muestra (solo vista previa) |
| `assets/og.jpg` | Imagen al compartir el link en WhatsApp o redes (1200x630) |

Los PDF completos **no** están en el repo: son el producto que vendes.

## Notas técnicas

- Tipografías: Playfair Display (títulos, como tus portadas) y Satoshi (texto). Iconos: Phosphor.
- Respeta `prefers-reduced-motion`: sin animaciones para quien las tenga desactivadas.
- Si GSAP no carga, todo el contenido sigue visible y usable.

## Probar en local

```bash
cd LANDING-MENOPAUSIA
python3 -m http.server 8000
# abre http://localhost:8000
```
