# Landing Menopausia (Plenitud)

Landing de venta para un curso digital sobre menopausia, pensado para vender en Hotmart.
HTML + CSS + JS puro, sin build: sube la carpeta tal cual a cualquier hosting (Netlify, Vercel, Hostinger, GitHub Pages).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura y textos de la página |
| `styles.css` | Diseño (colores en `:root`, modo claro y oscuro automático) |
| `main.js` | Link de checkout, precios, animaciones, carrusel y barra fija en móvil |
| `img/` | Fotos de la página (ver abajo) |

## Antes de publicar

1. **Checkout:** en `main.js`, cambia `checkoutUrl` por tu link de pago de Hotmart. Mientras tenga `XXXX`, los botones llevan a la sección de precio.
2. **Precio:** en `main.js`, cambia `price` y `oldPrice`. Revisa también el texto "hasta 6 cuotas" en `index.html`.
3. **Autora:** "Lucía Ferrer" y sus cifras (+12 años, +1.800 alumnas) son **de ejemplo**. Reemplázalos por los datos reales.
4. **Testimonios:** son **de ejemplo**. Usa solo testimonios reales y con permiso.
5. **Fotos:** sube estas imágenes a `img/` (mientras falten, verás un marco punteado indicando cuál va):

| Archivo | Uso | Tamaño sugerido |
|---|---|---|
| `hero.jpg` | Mujer de 50+ sonriendo, luz natural | 1200x1500 (4:5) |
| `modulo-1.jpg` | Mujer tomando notas / leyendo con calma | 1200x900 |
| `modulo-5.jpg` | Mujer madura estirando o caminando | 1200x900 |
| `autora.jpg` | Retrato de la autora | 1000x1250 (4:5) |
| `final.jpg` | Amigas de 50+ riendo juntas | 1600x900 (16:9) |
| `og.jpg` | Imagen al compartir en WhatsApp/redes | 1200x630 |

6. **Footer:** enlaza tus páginas de Términos y Privacidad y cambia el correo de contacto.

## Notas

- El aviso médico del footer es importante: el curso es educativo y no debe prometer curas ni reemplazar a un profesional de salud (también evita rechazos de anuncios en Meta/Google).
- Tipografías: Cormorant Garamond (títulos) y Outfit (texto), desde Google Fonts. Iconos: Phosphor.
- Respeta `prefers-reduced-motion` y el modo oscuro del sistema.

## Probar en local

```bash
cd LANDING-MENOPAUSIA
python3 -m http.server 8000
# abre http://localhost:8000
```
