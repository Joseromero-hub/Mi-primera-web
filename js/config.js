/* =========================================================================
   CONFIGURACIÓN DEL SITIO
   -------------------------------------------------------------------------
   Este es el ÚNICO archivo JS que necesitas tocar para cambiar los datos.
   Sustituye los textos entre corchetes [ASÍ] por los datos reales.

   ⚠️ Importante (SEO): el <title>, la meta description, Open Graph y el
   JSON-LD de index.html también llevan [NOMBRE FOTÓGRAFA], [CIUDAD]…
   escritos a mano, porque Google los lee sin ejecutar JavaScript.
   Haz un "buscar y reemplazar" en todos los .html (ver README).
   ========================================================================= */

export const SITE = {
  // --- Marca y contacto -------------------------------------------------
  nombre: '[NOMBRE FOTÓGRAFA]',
  ciudad: '[CIUDAD]',
  email: '[EMAIL]',
  telefono: '[TELÉFONO]',            // Ej.: '+34 600 000 000'
  instagram: '[@INSTAGRAM]',          // Con @, ej.: '@estudio_nubecitas'
  instagramUrl: 'https://www.instagram.com/',  // URL completa del perfil
  direccionEstudio: '[DIRECCIÓN DEL ESTUDIO]',

  // Nº de sesiones de recién nacido que aceptas al mes (aparece en el hero)
  plazasMes: '[N]',

  // Tiempo de respuesta que se muestra junto al formulario
  tiempoRespuesta: 'Respondo en menos de 24 h',

  // --- Formulario (Formspree) -------------------------------------------
  // Pega aquí la URL que te da Formspree, ej.: 'https://formspree.io/f/abcdwxyz'
  formEndpoint: '[FORMSPREE_ENDPOINT]',

  // --- Precios y packs ----------------------------------------------------
  // Pon solo el número (sin €). Ej.: precio: '250'
  packs: {
    mini: {
      nombre: 'Mini',
      precio: '[PRECIO]',
      duracion: '1,5 h',
      fotos: '10 fotos editadas',
      disfraces: '1 disfraz de animalito',
    },
    completa: {
      nombre: 'Completa',
      precio: '[PRECIO]',
      duracion: '2,5–3 h',
      fotos: '20 fotos editadas',
      disfraces: '2 disfraces de animalito',
    },
    premium: {
      nombre: 'Premium',
      precio: '[PRECIO]',
      duracion: '3–4 h',
      fotos: '30 fotos editadas + álbum',
      disfraces: '3 disfraces + fotos con familia',
    },
    embarazo: { nombre: 'Embarazo', precio: '[PRECIO]', duracion: '1 h', fotos: '12 fotos editadas' },
    familia: { nombre: 'Familia', precio: '[PRECIO]', duracion: '1 h', fotos: '15 fotos editadas' },
    primerAnio: { nombre: 'Primer año / smash cake', precio: '[PRECIO]', duracion: '1 h', fotos: '15 fotos editadas' },
    combinado: {
      nombre: 'Embarazo + Recién nacido',
      precio: '[PRECIO]',
      ahorro: '[AHORRO]',              // Ej.: '60' → "Ahorras 60 €"
    },
  },

  // --- Portfolio ------------------------------------------------------------
  // Cada foto: archivo, tamaño real en píxeles (ancho/alto), texto alternativo,
  // categoría y (solo recién nacido) animal.
  //   categoria: 'recien-nacido' | 'embarazo' | 'familia' | 'primer-anio'
  //   animal:    'osito' | 'conejito' | 'zorrito' | 'ovejita' | 'pollito'
  //   webp:      (opcional) ruta a la versión .webp de la misma foto
  portfolio: [
    { src: 'assets/photos/osito-01.svg', w: 800, h: 1000, categoria: 'recien-nacido', animal: 'osito', alt: 'Bebé recién nacido dormido con gorrito de osito sobre una manta mullida' },
    { src: 'assets/photos/conejito-01.svg', w: 800, h: 800, categoria: 'recien-nacido', animal: 'conejito', alt: 'Recién nacido con orejitas de conejito dormido de lado' },
    { src: 'assets/photos/embarazo-01.svg', w: 800, h: 1200, categoria: 'embarazo', alt: 'Futura mamá abrazando su barriga en el estudio' },
    { src: 'assets/photos/zorrito-01.svg', w: 1200, h: 800, categoria: 'recien-nacido', animal: 'zorrito', alt: 'Bebé disfrazado de zorrito acurrucado en una cesta' },
    { src: 'assets/photos/familia-01.svg', w: 800, h: 1000, categoria: 'familia', alt: 'Mamá y papá sostienen las manitas de su bebé' },
    { src: 'assets/photos/ovejita-01.svg', w: 800, h: 1000, categoria: 'recien-nacido', animal: 'ovejita', alt: 'Recién nacido con gorrito de ovejita dormido sobre una nube de lana' },
    { src: 'assets/photos/primer-anio-01.svg', w: 800, h: 800, categoria: 'primer-anio', alt: 'Bebé de un año delante de su tarta de cumpleaños' },
    { src: 'assets/photos/pollito-01.svg', w: 800, h: 1000, categoria: 'recien-nacido', animal: 'pollito', alt: 'Recién nacido vestido de pollito amarillo dentro de un nido' },
    { src: 'assets/photos/osito-02.svg', w: 1200, h: 800, categoria: 'recien-nacido', animal: 'osito', alt: 'Bebé con body de osito dormido boca abajo con las manitas bajo la carita' },
    { src: 'assets/photos/embarazo-02.svg', w: 800, h: 1000, categoria: 'embarazo', alt: 'Pareja esperando a su bebé con las manos formando un corazón sobre la barriga' },
    { src: 'assets/photos/conejito-02.svg', w: 800, h: 1200, categoria: 'recien-nacido', animal: 'conejito', alt: 'Bebé con gorro de conejito de punto envuelto en una mantita lavanda' },
    { src: 'assets/photos/familia-02.svg', w: 1200, h: 800, categoria: 'familia', alt: 'Hermano mayor da un beso en la frente al recién nacido' },
    { src: 'assets/photos/zorrito-02.svg', w: 800, h: 1000, categoria: 'recien-nacido', animal: 'zorrito', alt: 'Primer plano de un bebé con orejitas de zorrito durmiendo' },
    { src: 'assets/photos/primer-anio-02.svg', w: 800, h: 1000, categoria: 'primer-anio', alt: 'Bebé de un año riendo con las manos llenas de tarta' },
    { src: 'assets/photos/ovejita-02.svg', w: 800, h: 800, categoria: 'recien-nacido', animal: 'ovejita', alt: 'Recién nacido con disfraz de ovejita sobre una manta blanca' },
  ],
};
