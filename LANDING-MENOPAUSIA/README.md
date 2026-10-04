# Landing Menopausia (Plenitud)

Página de venta para un curso digital sobre menopausia, pensada para vender en Hotmart.
HTML + CSS + JS puro, sin build: sube la carpeta tal cual a cualquier hosting (Netlify, Vercel, Hostinger, GitHub Pages).

Construida con las skills del repo `gpt-taste` (estructura AIDA, movimiento con GSAP), `high-end-visual-design` (vibe Editorial Luxury, tarjetas de doble marco, botones con icono anidado, menú flotante) y `design-taste-frontend` (reglas anti-plantilla y accesibilidad).

## Estructura de venta

1. Barra de oferta de lanzamiento (con cuenta regresiva opcional)
2. Hero con promesa clara + espacio para el video de venta (VSL)
3. Prueba social: valoración, alumnas, acceso, garantía
4. **Test interactivo de síntomas**: la visitante marca lo que siente y recibe un mensaje + botón de compra
5. "No es tu culpa": texto que se enciende al hacer scroll + curva hormonal que se dibuja
6. **Método 5R**: título fijo mientras pasan los 5 pilares (Reconoce, Repara, Regula, Recarga, Reconecta)
7. Antes / Después con interruptor
8. Marquesina de beneficios
9. Testimonios
10. Oferta: suma de valor tachada (USD 175) frente al precio de hoy
11. Sello de garantía de 7 días
12. Para quién es / para quién no es
13. Autora
14. Preguntas frecuentes
15. Cierre con llamado final + aviso médico
16. En móvil: barra fija con precio y botón

## Antes de publicar

Todo lo editable está arriba en `main.js`, en `CONFIG`:

| Campo | Qué poner |
|---|---|
| `checkoutUrl` | Tu link de pago de Hotmart. Mientras tenga `XXXX`, los botones llevan a la sección de precio |
| `price`, `oldPrice`, `installments` | Precio actual, precio tachado y cuotas |
| `videoUrl` | Link *embed* de tu VSL (YouTube, Vimeo, Panda). Vacío = se muestra solo el póster |
| `deadline` | Fecha **real** de fin de la oferta (ej. `"2026-10-20T23:59:00-05:00"`). `null` = sin cuenta regresiva |

Además, en `index.html`:

- **Datos de ejemplo:** la autora "Lucía Ferrer", sus cifras, la valoración 4,9, "+1.800 alumnas" y los testimonios son **inventados**. Reemplázalos por datos reales (y usa testimonios solo con permiso). Están marcados con comentarios `EJEMPLO`.
- **Valores de los bonos** (USD 97, 17, 27, 19, 15): ajústalos a tu oferta real.
- **Foto de la autora:** sube `img/autora.jpg` (900x1125, 4:5). Si no existe, se ve un monograma con degradado.
- **Imagen para compartir:** sube `img/og.jpg` (1200x630).
- **Footer:** enlaza Términos y Privacidad y cambia el correo de contacto.

## Notas

- El aviso médico del footer es importante: el curso es educativo y no debe prometer curas ni reemplazar a un profesional de salud (también evita rechazos de anuncios en Meta y Google).
- Tipografías: Boska (títulos) y Satoshi (texto), desde Fontshare. Iconos: Phosphor. Animaciones: GSAP + ScrollTrigger desde cdnjs.
- Respeta `prefers-reduced-motion` (sin animaciones) y el modo oscuro del sistema.
- Si GSAP no carga, todo el contenido sigue visible.

## Probar en local

```bash
cd LANDING-MENOPAUSIA
python3 -m http.server 8000
# abre http://localhost:8000
```
