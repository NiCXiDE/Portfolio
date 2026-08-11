import type { Locale } from "./config";

const es = {
  meta: {
    title: "Nico Ayala Design",
    description:
      "Diseñador gráfico y de interfaces. Portfolio de Nico Ayala.",
    homeDescription:
      "Portfolio de Nico Ayala: diseño gráfico, interfaces de producto y proyectos personales. Basado en Argentina, trabajo remoto.",
    graphicDescription:
      "Portfolio gráfico de Nico Ayala: portadas, logos, ilustración, impresos y piezas personales.",
    interfacesDescription:
      "Proyectos de diseño de interfaces de Nico Ayala: preventas, sistemas a medida, system design e ideas personales.",
    privacyDescription:
      "Política de privacidad del portfolio de Nico Ayala: datos de contacto, analítica y cookies.",
  },
  nav: {
    portfolio: "Inicio",
    contact: "Contacto",
    about: "Acerca de",
    backHome: "Volver al inicio",
    lang: "EN",
    themeToggle: "Cambiar tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
  },
  home: {
    designer: "Diseñador",
    graphic: "Gráfico",
    interfaces: "de Interfaces",
    contactCta: "Contactar",
    companiesTitle:
      "Empresas, Instituciones y Asociaciones con las que he trabajado",
    pastProjectsTitle: "Proyectos de los que he formado parte",
    currentProjectsTitle: "Proyectos de los que formo parte",
    testimonialsTitle: "Testimonios",
    downloadCv: "Descargar CV",
  },
  common: {
    backToTop: "Volver arriba",
    close: "Cerrar",
    enlarge: "Ver en tamaño completo",
    sortByYear: "Ordenar por año",
    sortByName: "Ordenar A–Z",
    clearFilter: "Limpiar filtro",
    nsfwReveal: "Ver a discreción",
    nsfwHide: "Ocultar",
    nsfwLabel: "NSFW",
    tagLabels: {
      nsfw: "NSFW",
      "pixel-art": "Pixel art",
      vector: "Vector",
      "fan-art": "Fan art",
      grime: "Grime",
      tattoo: "Tattoo",
      "bass-series": "Bass series",
      impreso: "Impreso",
    },
  },
  interfaces: {
    titlePrefix: "Diseñador de ",
    titleBold: "Interfaces",
    subtitle: "Encargos previos e ideas personales",
    prototype: "ver prototipo completo",
    prototypeUnavailable: "prototipo no disponible*",
    prototypeUnavailableHint:
      "No puedo compartir el prototipo por privacidad, NDA o decisión del cliente.",
    catPreventas: "Preventas",
    catSistemas: "Sistemas a medida",
    catPersonales: "Personales",
    catSystemDesign: "System design",
    carouselPrev: "Anterior",
    carouselNext: "Siguiente",
    seeMore: "Ver más",
    cmsCta: "¿Te interesa saber cómo funciona mi portfolio?",
    cmsCtaLink: "Explorar el CMS como visitante",
    projectDetail: "Sobre este proyecto",
    client: "Cliente",
    period: "Periodo",
    duration: "Duración",
    detailEmpty: "Más detalles próximamente.",
    viewAsVisitor: "ver como visitante",
    viewLive: "ver en vivo",
    openDetail: "Ver ficha del proyecto",
  },
  grafico: {
    title: "Diseñador Gráfico",
    titlePrefix: "Diseñador ",
    titleBold: "Gráfico",
    subtitle: "Encargos previos y diseños personales",
    covers: "Portadas",
    logos: "Logotipos/Wordmarks",
    brandManuals: "Manuales de marca",
    illustration: "Ilustración",
    personal: "Personales",
    pending: "Pendiente a clasificar",
    emptyManuals: "Pronto: portada + descarga del PDF de cada manual.",
    emptyIllustration: "Espacio listo — mañana sumamos piezas.",
    downloadManual: "Descargar manual",
    viewManual: "Ver manual completo",
    visitLink: "Visitar web",
    expandHint: "Tocá una pieza para ver detalle · Esc para cerrar",
    seeMore: "Ver más",
    seeAll: "Ver todas",
    hintCovers:
      "Artworks y portadas de música / playlists (disco, single, lista).",
    hintLogos: "Marcas, wordmarks e íconos con identidad propia.",
    hintManuals: "Sistemas de marca documentados (portada + PDF).",
    hintIllustration:
      "Hubo dibujo (mano o digital) y la pieza gira alrededor de una figura o escena. Collages / tipografía pura van a otra sección.",
    hintPersonal:
      "Exploraciones propias: tipografía, remixes, memes, experimentos y piezas con carga afectiva.",
    hintPending: "Piezas aún sin categoría definitiva.",
    banners: "Impresos / Banners",
    hintBanners:
      "Piezas digitales hechas para impresión. Al expandir: foto IRL cuando esté.",
    emptyBanners: "Pronto: banners + foto del impreso.",
    relatedTattoo: "Así quedó",
    relatedPrint: "Foto del impreso",
    // Recordatorio: faltan BASS 2021, 2022 y la compilación BASS 20
  },
  footer: {
    social: "Seguime en Redes",
    navigation: "Navegación",
    contact: "Contacto",
    home: "Inicio",
    graphic: "Diseño Gráfico",
    interfaces: "Diseño de Interfaces",
    privacy: "Privacidad",
    email: "nicoayala.design@gmail.com",
    phone: "+54 9 370 434-2174",
    note: "señales de humo o gritame por la calle también sirve",
    responsePromise: "Respondo en 24–48 h hábiles.",
    powered: "powered by PUSH",
    behance: "@nicoasinormal",
    x: "@nicoasinormal",
    instagram: "@nicxayala",
    linkedin: "@nicoayala-design",
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Cómo arranca un proyecto?",
        a: "Arrancamos con un brief corto (objetivos, plazos, referencias). Si hace falta, coordinamos una reunión breve para alinear alcance antes de cotizar.",
      },
      {
        q: "¿Hacés reunión previa?",
        a: "Sí. Prefiero una call o meet corto para entender el trabajo y poder presupuestar con claridad.",
      },
      {
        q: "¿Cómo cotizás?",
        a: "Cada trabajo se cotiza según alcance y plazos. No publico tarifas fijas: te paso propuesta después del brief o la reunión.",
      },
      {
        q: "¿Trabajás remoto?",
        a: "Sí. Estoy en Argentina y trabajo con clientes locales y de otros países de forma remota.",
      },
      {
        q: "¿Qué necesito enviarte para avanzar?",
        a: "Contexto del proyecto, referencias visuales si hay, plazos deseados y un contacto. Con eso armo el siguiente paso.",
      },
    ],
  },
  privacy: {
    title: "Política de privacidad",
    updated: "Última actualización: agosto 2026",
    intro:
      "Este sitio es el portfolio personal de Nico Ayala. Esta política explica qué datos se tratan al visitarlo o contactarme.",
    sections: [
      {
        heading: "Responsable",
        body: "Nicolas Ayala (diseñador freelance). Contacto: nicoayala.design@gmail.com.",
      },
      {
        heading: "Datos que podés enviarme",
        body: "Si me escribís por email, teléfono o redes, usaré esos datos solo para responderte y gestionar el posible trabajo. No vendo ni cedo tu contacto a terceros con fines publicitarios.",
      },
      {
        heading: "Analítica (Google Analytics 4)",
        body: "Si está configurado, este sitio puede usar Google Analytics 4 para medir visitas y uso de páginas (de forma agregada). GA puede usar cookies o identificadores similares. La IP se solicita anonimizada cuando es posible. Podés limitar el tracking desde la configuración de tu navegador o extensiones anti-rastreo.",
      },
      {
        heading: "Cookies",
        body: "Además de lo que use la analítica, el sitio guarda preferencias locales (por ejemplo el tema claro/oscuro) en tu dispositivo. Esas preferencias no se usan para identificarte.",
      },
      {
        heading: "Conservación",
        body: "Los mensajes que me envíes se conservan el tiempo necesario para la conversación o el proyecto. Los datos de analítica se rigen por la retención configurada en Google Analytics.",
      },
      {
        heading: "Tus derechos",
        body: "Podés pedir acceso, corrección o borrado de datos personales que yo tenga por contacto directo, escribiendo a nicoayala.design@gmail.com.",
      },
    ],
  },
  notFound: {
    title: "Página no encontrada",
    body: "Ese enlace no existe o se movió.",
  },
  breadcrumbs: {
    aria: "Migas de navegación",
    home: "Inicio",
  },
};

const en: typeof es = {
  meta: {
    title: "Nico Ayala Design",
    description:
      "Graphic and interface designer. Nico Ayala's portfolio.",
    homeDescription:
      "Nico Ayala's portfolio: graphic design, product interfaces, and personal work. Based in Argentina, available remotely.",
    graphicDescription:
      "Graphic portfolio by Nico Ayala: covers, logos, illustration, print, and personal pieces.",
    interfacesDescription:
      "Interface design projects by Nico Ayala: pitch work, custom systems, system design, and personal ideas.",
    privacyDescription:
      "Privacy policy for Nico Ayala's portfolio: contact data, analytics, and cookies.",
  },
  nav: {
    portfolio: "Home",
    contact: "Contact",
    about: "About",
    backHome: "Back to home",
    lang: "ES",
    themeToggle: "Toggle theme",
    themeLight: "Light",
    themeDark: "Dark",
  },
  home: {
    designer: "Designer",
    graphic: "Graphic",
    interfaces: "Interface",
    contactCta: "Contact",
    companiesTitle: "Companies, Institutions and Associations I've worked with",
    pastProjectsTitle: "Projects I've been part of",
    currentProjectsTitle: "Projects I'm currently part of",
    testimonialsTitle: "Testimonials",
    downloadCv: "Download résumé",
  },
  common: {
    backToTop: "Back to top",
    close: "Close",
    enlarge: "View full size",
    sortByYear: "Sort by year",
    sortByName: "Sort A–Z",
    clearFilter: "Clear filter",
    nsfwReveal: "View at your discretion",
    nsfwHide: "Hide",
    nsfwLabel: "NSFW",
    tagLabels: {
      nsfw: "NSFW",
      "pixel-art": "Pixel art",
      vector: "Vector",
      "fan-art": "Fan art",
      grime: "Grime",
      tattoo: "Tattoo",
      "bass-series": "Bass series",
      impreso: "Print",
    },
  },
  interfaces: {
    titlePrefix: "Interface ",
    titleBold: "Designer",
    subtitle: "Previous commissions and personal ideas",
    prototype: "view full prototype",
    prototypeUnavailable: "prototype unavailable*",
    prototypeUnavailableHint:
      "I can't share the prototype due to privacy, NDA, or the client's decision.",
    catPreventas: "Pre-sales",
    catSistemas: "Custom systems",
    catPersonales: "Personal",
    catSystemDesign: "System design",
    carouselPrev: "Previous",
    carouselNext: "Next",
    seeMore: "See more",
    cmsCta: "Curious how my portfolio works?",
    cmsCtaLink: "Explore the CMS as a visitor",
    projectDetail: "About this project",
    client: "Client",
    period: "Period",
    duration: "Duration",
    detailEmpty: "More details coming soon.",
    viewAsVisitor: "view as visitor",
    viewLive: "view live",
    openDetail: "View project details",
  },
  grafico: {
    title: "Graphic Designer",
    titlePrefix: "Graphic ",
    titleBold: "Designer",
    subtitle: "Previous commissions and personal designs",
    covers: "Covers",
    logos: "Logos/Wordmarks",
    brandManuals: "Brand manuals",
    illustration: "Illustration",
    personal: "Personal",
    pending: "Pending classification",
    emptyManuals: "Soon: cover art + PDF download for each manual.",
    emptyIllustration: "Section ready — pieces coming next.",
    downloadManual: "Download manual",
    viewManual: "View full manual",
    visitLink: "Visit website",
    expandHint: "Tap a piece for details · Esc to close",
    seeMore: "See more",
    seeAll: "See all",
    hintCovers: "Music / playlist artworks and covers (release, single, list).",
    hintLogos: "Brands, wordmarks, and icons with their own identity.",
    hintManuals: "Documented brand systems (cover + PDF).",
    hintIllustration:
      "There was drawing (hand or digital) and the piece centers on a figure or scene. Pure type / collage land elsewhere.",
    hintPersonal:
      "Personal explorations: type, remixes, memes, experiments, and pieces with personal weight.",
    hintPending: "Pieces still awaiting a final category.",
    banners: "Print / Banners",
    hintBanners:
      "Digital pieces made for print. On expand: IRL photo when available.",
    emptyBanners: "Soon: banners + photo of the print.",
    relatedTattoo: "How it turned out",
    relatedPrint: "Print photo",
  },
  footer: {
    social: "Follow me",
    navigation: "Navigation",
    contact: "Contact",
    home: "Home",
    graphic: "Graphic Design",
    interfaces: "Interface Design",
    privacy: "Privacy",
    email: "nicoayala.design@gmail.com",
    phone: "+54 9 370 434-2174",
    note: "smoke signals or yelling at me on the street also works",
    responsePromise: "I reply within 24–48 business hours.",
    powered: "powered by PUSH",
    behance: "@nicoasinormal",
    x: "@nicoasinormal",
    instagram: "@nicxayala",
    linkedin: "@nicoayala-design",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How does a project start?",
        a: "We start with a short brief (goals, timeline, references). If needed, we book a quick call to align scope before quoting.",
      },
      {
        q: "Do you take intro meetings?",
        a: "Yes. I prefer a short call to understand the work so I can quote clearly.",
      },
      {
        q: "How do you price work?",
        a: "Each project is quoted by scope and timeline. I don't publish fixed rates — you'll get a proposal after the brief or meeting.",
      },
      {
        q: "Do you work remotely?",
        a: "Yes. I'm based in Argentina and work with local and international clients remotely.",
      },
      {
        q: "What should I send to get started?",
        a: "Project context, visual references if any, desired timeline, and a contact. That's enough for the next step.",
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "Last updated: August 2026",
    intro:
      "This site is Nico Ayala's personal portfolio. This policy explains what data is handled when you visit or contact me.",
    sections: [
      {
        heading: "Controller",
        body: "Nicolas Ayala (freelance designer). Contact: nicoayala.design@gmail.com.",
      },
      {
        heading: "Data you send me",
        body: "If you email, call, or message me on social media, I'll use that data only to reply and manage possible work. I don't sell or share your contact for advertising.",
      },
      {
        heading: "Analytics (Google Analytics 4)",
        body: "When configured, this site may use Google Analytics 4 to measure visits and page use (in aggregate). GA may use cookies or similar IDs. IP anonymization is requested when possible. You can limit tracking in your browser or with anti-tracking tools.",
      },
      {
        heading: "Cookies",
        body: "Aside from analytics, the site stores local preferences (such as light/dark theme) on your device. Those preferences are not used to identify you.",
      },
      {
        heading: "Retention",
        body: "Messages you send are kept as long as needed for the conversation or project. Analytics data follows the retention set in Google Analytics.",
      },
      {
        heading: "Your rights",
        body: "You can request access, correction, or deletion of personal data I hold from direct contact by emailing nicoayala.design@gmail.com.",
      },
    ],
  },
  notFound: {
    title: "Page not found",
    body: "That link doesn't exist or moved.",
  },
  breadcrumbs: {
    aria: "Breadcrumb",
    home: "Home",
  },
};

export type Dictionary = typeof es;

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
