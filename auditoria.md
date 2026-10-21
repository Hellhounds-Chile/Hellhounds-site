# Auditoría del sitio HellHounds

**Fecha:** 6 de octubre de 2026
**Archivos revisados:** `index.html`, `proyectos.html`, `styles.css`
**Método:** lectura del código, contraste calculado con la fórmula WCAG 2.2, y las dos páginas cargadas en Chromium (Playwright) con anchos de 320, 360, 375, 768 y 1280 px para medir el diseño real.

No se modificó ningún archivo del sitio. Solo se creó este informe.

---

## Resumen

| Gravedad | Cantidad | Qué incluye |
|---|---|---|
| 🔴 Crítico | 4 | Enlaces que no llevan a ningún lado, textos pendientes visibles y diseño roto en celulares |
| 🟠 Alto | 6 | HTML inválido, falta de SEO básico (robots, sitemap, canonical, imagen para redes) y bordes de formulario casi invisibles |
| 🟡 Medio | 10 | Accesibilidad, formulario, rendimiento de fuentes y encabezados |
| ⚪ Bajo | 11 | Limpieza de CSS, seguridad del hosting y detalles |

**Prioridad recomendada:** antes de publicar el sitio, corregir los 4 problemas críticos. El sitio aún tiene textos de plantilla visibles, enlaces muertos y en celulares el contenido queda pegado a los bordes y se puede desplazar hacia los lados.

---

## 🔴 Crítico

### C1. Los enlaces de los proyectos principales están rotos
`proyectos.html:50` y `proyectos.html:57`

```html
<a href="[URL STAGE ONE]" class="proj proj-s1">
<a href="[URL LIGA]" class="proj proj-liga">
```

Las dos tarjetas más importantes de la página de Proyectos (Stage One y Liga Escolar Valorant) apuntan a un texto entre corchetes. El navegador lo interpreta como una ruta relativa (`/%5BURL%20STAGE%20ONE%5D`), así que al hacer clic aparece un **error 404**.
**Solución:** poner las URL reales. Si los sitios aún no existen, cambiar la tarjeta a un `<div>` sin enlace, igual que la de "University League".

### C2. Los enlaces a redes sociales están vacíos
`index.html:106-107`

```html
<a href="#">Instagram · [@USUARIO]</a>
<a href="#">Discord · [INVITACIÓN]</a>
```

`href="#"` no lleva a ningún sitio: solo vuelve al inicio de la página. Además, el texto muestra corchetes al público.
**Solución:** usar la URL real (`https://instagram.com/…`, `https://discord.gg/…`). Si todavía no la tienen, quitar el enlace.

### C3. Textos pendientes entre corchetes visibles en la página
`index.html:90-93`, `index.html:106-107`

| Línea | Texto visible |
|---|---|
| 90 | `[NOMBRE]` (CEO y fundador) |
| 91–93 | `[NOMBRE]` / `[ROL]` ×3 |
| 90–93 | Recuadros con la palabra "Foto" en lugar de imágenes |
| 106 | `[@USUARIO]` |
| 107 | `[INVITACIÓN]` |

En total, la sección "El equipo" muestra **8 textos de plantilla y 4 fotos vacías**. Esto da una imagen de sitio sin terminar. Los lectores de pantalla además leen en voz alta "Foto" y "corchete nombre".
**Solución:** poner los datos reales o esconder la sección del equipo hasta tenerlos.
*(Los comentarios HTML de `proyectos.html:49` y `:56` también tienen corchetes, pero el público no los ve.)*

### C4. En celulares el contenido queda pegado a los bordes y la página se desplaza hacia los lados
`styles.css:18`, `:20`, `:43`, `:137` (y `:37`)

Esto se comprobó en el navegador. Los elementos usan dos clases a la vez, por ejemplo `class="wrap hero"`, `class="wrap pad"` y `class="wrap page-head"`. Como `.hero`, `.pad` y `.page-head` están definidas **después** de `.wrap` en el CSS, con un `padding` abreviado que pone `0` a los lados, borran el margen lateral de 24px que da `.wrap`.

Resultado medido:
- **Margen lateral: 0px** en el hero, Nosotros, Contacto y toda la página de Proyectos, con cualquier ancho menor a 1240px. En celulares y tablets el texto toca el borde de la pantalla.
- **Desplazamiento horizontal en `index.html`:** con 320 y 375px de ancho, la página mide **406px**. El título "HellHounds" usa `clamp(52px, 9vw, 96px)` y con la fuente Cinzel Decorative a 52px no cabe, así que el usuario puede arrastrar la página hacia los lados.
- Lo mismo pasa en el menú (`styles.css:37`): `nav{padding-top:14px;padding-bottom:14px}` pierde frente a `.wrap{padding:0 24px}` porque una clase tiene más prioridad que una etiqueta. Por eso el encabezado no tiene relleno vertical: mide 46px y el botón "Contacto" queda pegado arriba y abajo.

**Solución:** usar solo propiedades verticales (`padding-block` o `padding-top`/`padding-bottom`) en `.hero`, `.pad`, `.page-head` y `nav`. También bajar el mínimo del `clamp` del `h1` (por ejemplo `clamp(36px, 11vw, 96px)`) o permitir que la palabra se corte.

---

## 🟠 Alto

### A1. HTML inválido en `proyectos.html`: `</head>` y `<body>` repetidos
`proyectos.html:17-20`

```html
<body>

</head>
<body>
```

Hay un segundo `</head><body>` sobrante, probablemente de copiar y pegar. Los navegadores lo toleran, pero es un error de validación y puede confundir a herramientas de SEO y de accesibilidad.
**Solución:** borrar las líneas 19-20.

### A2. Falta `robots.txt`
El repositorio no tiene `robots.txt`. Sin él, los buscadores rastrean igual, pero no hay dónde indicarles el sitemap y cada visita de un bot genera un error 404 en los registros.
**Solución:** crear un `robots.txt` con `User-agent: *`, `Allow: /` y `Sitemap: https://hellhounds.cl/sitemap.xml`.

### A3. Falta `sitemap.xml`
No hay sitemap. El sitio es pequeño (2 páginas), pero el sitemap acelera la indexación y es necesario para registrar el sitio en Google Search Console.
**Solución:** crear un `sitemap.xml` con las dos URL.

### A4. Faltan URL canónica e imagen para compartir en redes
`index.html:8-10`, `proyectos.html:8-10`

- No hay `<link rel="canonical">`. Además, `index.html` y `/` pueden indexarse como dos páginas distintas.
- Faltan `og:image`, `og:url`, `og:type` y `twitter:card`. Al compartir el sitio en WhatsApp, Instagram, Discord o X, **aparece sin imagen**, y para una marca gamer eso es lo más visible.
- `proyectos.html` repite el mismo `og:title` ("HellHounds") y `og:description` que la portada. Al compartir la página de Proyectos no se nota que es otra página.

**Solución:** crear una imagen de 1200×630px y agregar en cada página `canonical`, `og:url`, `og:type`, `og:image` y `twitter:card="summary_large_image"`, con un título y una descripción propios para cada una.

### A5. Los bordes de los campos del formulario casi no se ven
`styles.css:112`, `styles.css:30`

Los campos del formulario tienen borde `#3a3a6a` sobre fondo `#080810`. El contraste es de **1,89:1**, y contra la tarjeta (`#12121f`) es de **1,76:1**. La norma WCAG 1.4.11 exige **3:1** para los bordes de controles. Las personas con baja visión no ven dónde están los campos.
También fallan:

| Elemento | Contraste | Mínimo |
|---|---|---|
| Borde del botón `.btn-ghost` (`#4a4a7a`) | 2,42:1 | 3:1 |
| Borde punteado de "Próximamente" (`#3a3a6a`) | 1,89:1 | 3:1 (decorativo, menos grave) |
| Bordes de tarjetas `--card-line` | 1,39:1 | (decorativo, no obligatorio) |

**Solución:** aclarar el borde de los campos a un color como `#6a6a9a` o más claro.

### A6. El texto "Foto" no tiene contraste suficiente
`styles.css:101`

El color `#6a6a90` sobre `#16162a` da **3,45:1**. Para texto de 15px, la WCAG 1.4.3 exige 4,5:1. Se resolverá solo al poner fotos reales (ver C3), pero conviene corregirlo si el recuadro se mantiene.

---

## 🟡 Medio

### M1. No hay enlace para saltar al contenido
No existe un enlace "Saltar al contenido" (WCAG 2.4.1). Quien navega con teclado tiene que recorrer los 4 enlaces del menú en cada página. Se comprobó el orden de tabulación y es lógico (menú → botones → contacto → formulario), pero falta este atajo.
**Solución:** agregar `<a href="#main" class="skip">Saltar al contenido</a>` al inicio del `<body>`, visible al enfocarlo.

### M2. Los enlaces se distinguen solo por el color
`styles.css:15-16`

`a{text-decoration:none}` y en hover solo cambia el color. Los enlaces de los canales de contacto (`index.html:105-107`) no tienen subrayado ni ícono que los distinga del texto normal (WCAG 1.4.1).
**Solución:** subrayar los enlaces que están dentro del contenido, o agregarles un ícono.

### M3. El encabezado fijo ocupa mucha pantalla en celulares y tapa los anclajes
`styles.css:19`, `styles.css:36`

Medido en el navegador: en 320px el encabezado sticky mide **140px**, el 18% de la pantalla, porque el menú se parte en dos filas. En 360px mide 100px. `scroll-margin-top:84px` es menor que esa altura, así que al ir a `#contacto` el borde superior de la sección queda **16px debajo del encabezado** en 360px, y más tapado aún en 320px.
**Solución:** diseñar un menú compacto para celulares (botón hamburguesa o una sola fila más chica) y ajustar `scroll-margin-top` a la altura real.

### M4. Faltan ajustes para celulares en la sección "Nosotros" y en los títulos
`styles.css:127-136`

Las reglas de "Nosotros" (`.about`, `.sub`, etc.) están **después** del `@media (max-width:640px)`, así que no tienen ajustes para celulares. Por ejemplo, `.sub{margin:72px 0 28px}` y `.about{gap:56px; margin-bottom:72px}` dejan grandes espacios vacíos en pantallas chicas. No rompe nada, pero alarga mucho el desplazamiento.

### M5. Jerarquía de encabezados incorrecta
`index.html:69-93`

"Lo que hacemos" y "El equipo" son `<h3>`, y sus tarjetas internas ("Competencias", "[NOMBRE]") **también** son `<h3>`. Los lectores de pantalla las muestran como si todas estuvieran al mismo nivel. Además, la sección de inicio no tiene `<h2>` en ese bloque.
**Solución:** subir los subtítulos a `<h2>`/`<h3>` y bajar las tarjetas a `<h3>`/`<h4>`, para que haya un solo nivel por jerarquía.

### M6. El formulario depende de que el usuario tenga una app de correo
`index.html:110-147`

El formulario solo abre un enlace `mailto:`. Eso tiene varios problemas:
- Quien usa Gmail o Outlook en el navegador, o un computador sin cliente de correo configurado (muy común en colegios y oficinas), **no ve que pase nada** al hacer clic en "Enviar", y no recibe aviso de error.
- Los enlaces `mailto:` largos se cortan en algunos clientes (por encima de unos 2.000 caracteres), y el `textarea` no tiene `maxlength`.
- Sin JavaScript, el formulario se envía por GET a la misma página, sin `action` ni `method`, y deja nombre, correo y mensaje **a la vista en la URL** y en el historial del navegador.

**Solución:** usar un servicio de formularios (Formspree, Netlify Forms, Basin, etc.) o un endpoint propio con confirmación visible. Si se mantiene `mailto:`, agregar `action="mailto:…" method="post" enctype="text/plain"` como respaldo, y avisar al usuario que también puede escribir directamente a la dirección.

### M7. Los mensajes de error del formulario no son accesibles
Los campos usan `required`, pero no hay mensajes de error personalizados ni `aria-describedby`, y no se indica cuáles son obligatorios (por ejemplo con un asterisco). El texto `.form-note` explica lo que pasará al enviar, pero aparece **después** del botón, cuando el usuario de lector de pantalla ya lo pulsó.
**Solución:** mover la nota antes del botón y marcar los campos obligatorios.

### M8. Las fuentes de Google bloquean el renderizado y pesan mucho
`index.html:12-14`, `proyectos.html:12-14`

Se cargan **3 familias y 8 pesos** (Cinzel Decorative 700/900, Cinzel 600/700, Rajdhani 400/500/600/700) desde Google Fonts con un `<link rel="stylesheet">` que bloquea el renderizado. Hay pesos sin usar o casi sin usar: Rajdhani 500 no se usa, Cinzel Decorative 700 solo en el logo del pie de página y Cinzel 600 solo en `.kicker`. En una conexión móvil lenta, el texto tarda en mostrarse.
**Solución:** quitar los pesos que no se usan, alojar las fuentes en el propio sitio (`.woff2` + `font-display:swap` + `preload` de la principal) o al menos reducir la URL a los pesos reales.

### M9. Frase en inglés sin marcar el idioma
`index.html:39`

"Where Legends Are Born in Hell." está en inglés dentro de una página `lang="es"`. Los lectores de pantalla la pronuncian con fonética española (WCAG 3.1.2).
**Solución:** `<p class="tagline" lang="en">`.

### M10. Faltan página 404 y algunos íconos
No hay `404.html`, así que los enlaces rotos de C1 llevan a la página genérica del hosting. Tampoco hay `apple-touch-icon` ni `<meta name="theme-color">`. El favicon como data-URI SVG funciona, pero no aparece en iOS ni en algunos agregadores.

---

## ⚪ Bajo

### B1. Cerca del 30% del CSS no se usa
`styles.css:72-97`, `styles.css:31-32`

Las reglas de **Stage One** (`.s1`, `.s1-text`, `.s1-title`, `.facts`, `.fact`, `.s1-list`), **Liga** (`.step`, `.step-final`, `.req`) y `.btn-gold` no se usan en ninguna de las dos páginas. Parecen sobras de una versión anterior. Pesan poco (unos 2,5 KB), pero complican el mantenimiento.

### B2. Reglas CSS duplicadas o mal ubicadas
- `.proj .go` se define dos veces (`styles.css:61` y `:136`).
- `.nav-current` y `.page-head` están al final del archivo, después del bloque de Nosotros y fuera de su sección.
- El bloque `@media` (`:120`) está a la mitad del archivo, así que todo lo que viene después no tiene ajustes para celulares (ver M4).

### B3. Estilos en línea en el HTML
`index.html:41`, `:111`, `:124`, `proyectos.html:39`, `:47`

Hay varios `style="…"` mezclados en el HTML. Esto dificulta el mantenimiento y obligaría a usar `'unsafe-inline'` si algún día se agrega una política CSP (ver B6).

### B4. No se declara el esquema de color oscuro
Falta `color-scheme: dark` en `:root` o `<meta name="color-scheme" content="dark">`. Algunos controles nativos, como la lista desplegable del `<select>`, el autocompletado y las barras de desplazamiento, pueden verse en modo claro y con poco contraste sobre el fondo oscuro.

### B5. El foco de los campos se ve débil
`styles.css:114`

`outline:none` y en su lugar `box-shadow` con neón al 35% de opacidad. El borde cambia a `--neon` (contraste 7,5:1), así que **cumple**, pero el anillo semitransparente casi no se ve. El resto de los elementos usa `:focus-visible` con un contorno de 2px, que está bien.

### B6. Seguridad: faltan cabeceras HTTP (depende del hosting)
Es un sitio estático sin backend, así que el riesgo es bajo. Se revisó el código y **no hay** inyección de HTML: el script usa `encodeURIComponent` y no inserta contenido del usuario en la página. Tampoco hay enlaces `target="_blank"` sin `rel` ni recursos cargados por HTTP. Al publicar, conviene configurar en el hosting:
- `Content-Security-Policy`. Hoy el script y los estilos en línea obligarían a usar `'unsafe-inline'`. Lo ideal es mover el script a un archivo `.js` aparte.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.
- `X-Frame-Options: DENY` o `frame-ancestors 'none'`, para que el sitio no pueda incrustarse en otra página.

### B7. Correo expuesto a robots de spam
`contacto@hellhounds.cl` aparece en texto plano (`index.html:105` y `:140`). Es habitual y aceptable, pero va a recibir spam. Conviene tener un filtro en el buzón.

### B8. Privacidad: Google Fonts comparte la IP de los visitantes
Cargar fuentes desde `fonts.googleapis.com` envía la IP de cada visitante a Google. La Ley 21.719 de protección de datos de Chile y el RGPD en Europa lo consideran un tratamiento de datos. Alojar las fuentes en el propio sitio (M8) también resuelve esto. Si el formulario pasa a un servicio externo (M6), habrá que agregar un aviso de privacidad.

### B9. El año del pie de página está fijo
`index.html:134`, `proyectos.html:77`

"Santiago, Chile, 2026" está escrito a mano y quedará desactualizado en 2027. Tampoco hay aviso de copyright (©).

### B10. Código SVG duplicado
El logo de Cerbero está copiado en línea 3 veces en las dos páginas, más el favicon. Pesa poco, pero cualquier cambio de logo hay que hacerlo en varios lugares. Se podría usar un `logo.svg` o un `<symbol>` reutilizable.

### B11. README casi vacío
`README.md` solo contiene el título. Conviene documentar cómo publicar el sitio, dónde se cambia el correo de contacto (`CONTACT_EMAIL`) y la lista de pendientes (C1–C3).

---

## Lo que está bien

- `lang="es"`, `charset`, `viewport`, `<title>` y `meta description` únicos en cada página.
- Todos los campos del formulario tienen su `<label for>` y su `autocomplete` correcto.
- Los SVG decorativos usan `aria-hidden="true"` y el emblema principal tiene `role="img"` con `aria-label`.
- `aria-current="page"` en el menú de Proyectos y `aria-label` en el `<nav>`.
- `:focus-visible` global con contorno visible y respeto de `prefers-reduced-motion`.
- El contraste del texto principal es muy bueno: texto principal 17:1, `--muted` 9,6:1, `--dim` 6,8–7,3:1, neón 7,2–7,8:1, botón primario 7,3:1 y dorado 9,3:1.
- Los botones miden al menos 44–52px de alto, buen tamaño para tocar.
- El CSS es liviano y no hay JavaScript externo ni librerías.

---

## Plan de corrección sugerido

1. **Antes de publicar:** C1, C2, C3 (contenido real) y C4 (márgenes en celulares).
2. **Primera semana:** A1–A6 (HTML válido, robots, sitemap, Open Graph y contraste del formulario).
3. **Después:** M1–M10, empezando por M6 (formulario funcional) y M3 (menú en celulares).
4. **Mantenimiento:** B1–B11.
