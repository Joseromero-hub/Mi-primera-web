# Web de fotografía newborn

One-page para conseguir **reservas** de sesiones de recién nacido (con disfraces de animalitos), embarazo, familia y primer año / smash cake.

- Solo HTML, CSS y JavaScript vanilla. Sin build, sin frameworks.
- Three.js `0.170.0` (fijado) por CDN con `importmap`, **solo en el hero**.
- Mobile-first, accesible (WCAG AA) y pensada para tráfico desde Instagram.

---

## 1. Cómo ejecutar la web

Necesita un servidor estático (no funciona abriendo el `.html` con doble clic, porque usa módulos ES y un sprite SVG externo).

**Opción A: VS Code + Live Server.** Instala la extensión *Live Server*, clic derecho en `index.html` → *Open with Live Server*.

**Opción B: terminal (Node instalado).**

```bash
npx serve .
```

Abre la URL que aparece (normalmente http://localhost:3000).

**Opción C: Python.**

```bash
python3 -m http.server 8080
```

### Estructura

```
/index.html               Página principal (todas las secciones)
/aviso-legal.html         Plantillas legales
/privacidad.html
/cookies.html
/css/styles.css           Estilos (paleta en variables al principio)
/js/config.js             ★ TODOS los datos editables
/js/main.js               Menú, galería, lightbox, carrusel, formulario, animaciones
/js/scene3d.js            Escena 3D del hero (Three.js)
/assets/illustrations/    SVG propios: iconos, orejitas, nubes, separadores, fallback del hero
/assets/photos/           Placeholders de fotos (sustituir por las reales)
/assets/favicon.svg
/assets/og-image.png      Imagen al compartir el enlace (1200×630)
```

---

## 2. Cambiar los datos (config.js + marcadores)

### 2.1 `js/config.js`

Abre `js/config.js` y cambia los valores entre corchetes:

| Campo | Ejemplo |
|---|---|
| `nombre` | `'Lucía Nube Fotografía'` |
| `ciudad` | `'Valencia'` |
| `email` | `'hola@tudominio.com'` |
| `telefono` | `'+34 600 000 000'` |
| `instagram` / `instagramUrl` | `'@tu_usuario'` / `'https://www.instagram.com/tu_usuario/'` |
| `plazasMes` | `'6'` |
| `formEndpoint` | `'https://formspree.io/f/abcdwxyz'` (ver apartado 4) |
| `packs.*.precio` | `'250'` (solo el número; el "€" ya lo pone la web) |
| `packs.*.duracion`, `fotos`, `disfraces` | textos de cada pack |
| `packs.combinado.ahorro` | `'60'` |
| `portfolio` | lista de fotos (ver apartado 3) |

Al recargar, la web pinta estos datos en los elementos con `data-config="..."`.

### 2.2 Buscar y reemplazar en los `.html` (importante para Google)

El `<title>`, la meta description, Open Graph y el JSON-LD de `index.html`, así como el texto de las páginas legales, llevan marcadores **escritos a mano**, porque Google y WhatsApp los leen sin ejecutar JavaScript. Haz *Buscar y reemplazar en todos los archivos* (en VS Code: `Ctrl/Cmd + Shift + H`):

| Marcador | Dónde aparece |
|---|---|
| `[NOMBRE FOTÓGRAFA]` | todos los HTML |
| `[CIUDAD]` | todos los HTML |
| `[EMAIL]`, `[TELÉFONO]` | index (JSON-LD) y legales |
| `[TU-DOMINIO]` | index (canonical, Open Graph, JSON-LD) |
| `[DIRECCIÓN DEL ESTUDIO]`, `[CÓDIGO POSTAL]` | index (JSON-LD) |
| `[INSTAGRAM]` | index (JSON-LD, `sameAs`) |
| `[NOMBRE Y APELLIDOS / RAZÓN SOCIAL]`, `[NIF]`, `[DIRECCIÓN COMPLETA]`, `[FECHA]`… | páginas legales |

Revisa también los textos marcados como placeholder:

- **Sobre mí:** tu historia, tu formación (`[CURSO/ESCUELA]`, `[AÑO]`) y el número de familias (`[N]`).
- **Testimonios:** busca `<!-- PLACEHOLDER: sustituir por reseñas reales -->`. Usa solo reseñas reales y con permiso de la familia.
- **FAQ:** el plazo de entrega `[N] semanas`.

Truco: con la web abierta, busca `[` en la página (Ctrl/Cmd + F) para encontrar lo que queda por rellenar.

### 2.3 Colores y tipografías

Están al principio de `css/styles.css` (`:root`). El acento de los botones es `--c-accent: #A23E5F` (frambuesa, contraste AA con texto blanco). Si lo cambias, comprueba el contraste en https://webaim.org/resources/contrastchecker/ (mínimo 4,5:1).

---

## 3. Sustituir las fotos

Los placeholders están en `assets/photos/` con nombres descriptivos (`osito-01.svg`, `embarazo-01.svg`…).

### Tamaño y peso recomendados

| Uso | Tamaño | Formato | Peso objetivo |
|---|---|---|---|
| Portfolio | lado largo 1600 px (vertical 1280×1600, horizontal 1600×1067, cuadrada 1400×1400) | **WebP** calidad 75–80 + JPG de respaldo | WebP < 250 KB · JPG < 400 KB |
| Sobre mí | 1000×1250 (4:5) | WebP + JPG | < 200 KB |
| `og-image.png` / `.jpg` | exactamente 1200×630 | JPG o PNG | < 300 KB |

Exporta con **Squoosh** (https://squoosh.app, gratis y en el navegador) o desde Lightroom. Exporta en sRGB y quita los metadatos GPS.

### Paso a paso (portfolio)

1. Exporta cada foto en **dos versiones con el mismo nombre**: `osito-01.jpg` y `osito-01.webp`.
2. Cópialas en `assets/photos/`.
3. En `js/config.js`, dentro de `portfolio`, edita (o añade) la línea de esa foto:

   ```js
   { src: 'assets/photos/osito-01.jpg', webp: 'assets/photos/osito-01.webp',
     w: 1280, h: 1600, categoria: 'recien-nacido', animal: 'osito',
     alt: 'Bebé de 8 días dormido con gorrito de osito de punto sobre manta beige' },
   ```

   - `w` y `h`: el **tamaño real en píxeles** del archivo. Evita saltos de diseño al cargar.
   - `categoria`: `recien-nacido`, `embarazo`, `familia` o `primer-anio`.
   - `animal` (solo recién nacido): `osito`, `conejito`, `zorrito`, `ovejita` o `pollito`. Si añades otro animal, añade también su botón en `index.html` (bloque `data-animal-tags`) y su nombre en `ANIMAL_LABELS` de `js/main.js`.
   - `alt`: describe la foto como se la contarías a alguien por teléfono. Es importante para la accesibilidad y para Google Imágenes.
4. Borra los `.svg` de ejemplo que ya no uses.
5. El orden de la lista es el orden de la galería. Pon arriba tus 4–6 mejores fotos de recién nacido.

La web ya incluye `loading="lazy"`, `width`/`height`, `<picture>` con WebP y `decoding="async"`.

### Foto de "Sobre mí"

En `index.html`, busca `sobre-mi.svg`:

1. Cambia `src` por tu `.jpg`.
2. Descomenta la línea `<source srcset="assets/photos/sobre-mi.webp" type="image/webp">`.
3. Ajusta `width`/`height`.

### Imagen para compartir (Open Graph)

Sustituye `assets/og-image.png` por una foto tuya de 1200×630 (por ejemplo, tu mejor recién nacido con espacio para texto). Si usas `.jpg`, cambia la ruta en `index.html` (`og:image` y JSON-LD).

---

## 4. Formulario de reserva (Formspree)

El formulario se envía por email con Formspree, sin recargar la página.

1. Crea una cuenta gratuita en https://formspree.io con el **email donde quieres recibir las reservas**.
2. *New form* → ponle un nombre (p. ej. "Reservas web") → *Create*.
3. Copia el endpoint, del tipo `https://formspree.io/f/abcdwxyz`.
4. Pégalo en `js/config.js` → `formEndpoint`.
5. Publica la web y **envía una solicitud de prueba** desde el móvil. El primer envío puede pedirte confirmar el email en Formspree.
6. En la configuración del formulario en Formspree:
   - activa la **protección antispam** (el formulario ya incluye un campo trampa `_gotcha`);
   - en *Restrict to domain*, pon tu dominio para que nadie más use tu endpoint.

**Límites a tener en cuenta:**
- El plan gratuito permite unos 50 envíos al mes; vigílalo si haces campañas en Instagram.
- Formspree procesa los datos en EE. UU.: ya está mencionado en la política de privacidad, pero revísalo con tu asesoría.
- Mientras `formEndpoint` siga siendo `[FORMSPREE_ENDPOINT]`, el formulario valida los datos pero muestra un aviso de "no conectado" en lugar de enviar.

---

## 5. Escena 3D: cómo funciona y cómo desactivarla

- **Cuándo se carga:** `js/scene3d.js` y Three.js (unos 170 KB comprimido) se descargan solo después de que la página ha cargado y la visitante interactúa por primera vez (scroll, toque o ratón), y solo si el hero está cerca de la pantalla.
- **Antes y en su lugar:** hasta entonces se ve `assets/illustrations/hero-fallback.svg`, con la misma escena. También se queda la ilustración:
  - si no hay WebGL;
  - con "ahorro de datos" activado o en 2G;
  - en móviles de 2 GB de RAM o menos;
  - si falla la carga.
- **Ahorro:** se pausa cuando el hero no está a la vista o la pestaña está oculta, y anima a 30 fps.
- **Movimiento reducido:** con `prefers-reduced-motion` se pinta un único fotograma estático.
- **Desactivarla del todo:** en `js/main.js`, borra la llamada `initHero3D();` al final del archivo. Quedará solo la ilustración.
- **Versión de Three.js:** fijada en el `importmap` de `index.html` (`three@0.170.0`). No la cambies sin probar la escena.

---

## 6. Rendimiento y accesibilidad (cómo se ha probado)

Lighthouse en modo móvil sobre servidor local, con Three.js servido en local y sin Google Fonts (el entorno de pruebas no tenía acceso a esos CDN):

- **Performance:** 91 con WebGL emulado por software (peor caso), 100 sin él. LCP 1,5–1,9 s, CLS 0.
- **Accessibility:** 100. **Best Practices:** 100.
- **SEO:** 92. El único fallo es el `canonical`, que se resuelve al poner tu dominio real en lugar de `[TU-DOMINIO]`.

Repite la medición tras publicar con las fotos reales: PageSpeed Insights (https://pagespeed.web.dev), en modo móvil. Las fotos pesadas son lo que más suele bajar la nota.

---

## 7. Checklist antes de publicar

**Contenido**
- [ ] `js/config.js` completo (nombre, ciudad, email, teléfono, Instagram, plazas, precios, ahorro del pack).
- [ ] Buscar y reemplazar de todos los marcadores `[…]` en los `.html` (incluido `[TU-DOMINIO]`).
- [ ] Texto real de "Sobre mí", formación y número de familias.
- [ ] Testimonios **reales** (con permiso) en lugar de los placeholder.
- [ ] Plazo de entrega real en la FAQ.

**Fotos**
- [ ] Fotos reales en WebP + JPG, con el peso recomendado, `w`/`h` correctos y `alt` descriptivo.
- [ ] Consentimiento **por escrito** de los padres para publicar cada foto.
- [ ] Foto de "Sobre mí" y `og-image` sustituidas.
- [ ] Borrados los `.svg` de ejemplo que ya no se usen.

**Legal (España / RGPD)**
- [ ] Aviso legal, privacidad y cookies completados **y revisados por un profesional**.
- [ ] Si añades analítica (Google Analytics, píxel de Meta…), añade un banner de cookies con aceptar/rechazar **antes** de instalarla y actualiza la política de cookies.

**Formulario**
- [ ] Endpoint de Formspree en `config.js` y dominio restringido en Formspree.
- [ ] Prueba real desde el móvil: llega el email, el "responder" va a la clienta y no cae en spam.
- [ ] Prueba de errores: enviar vacío muestra los avisos en rojo.

**Técnico**
- [ ] Web publicada con HTTPS (Netlify, Vercel, GitHub Pages o tu hosting).
- [ ] PageSpeed Insights en móvil ≥ 90 en Performance y Accessibility.
- [ ] Probada en iPhone (Safari) y Android (Chrome), también abriendo el enlace desde Instagram.
- [ ] Ficha de Google Business Profile creada con el mismo nombre, dirección y teléfono que en el JSON-LD.
- [ ] Enlace a la web en la bio de Instagram.
