import type { Locale } from "./config";

const es = {
  meta: {
    title: "Nico Ayala Design",
    description:
      "Diseñador gráfico y de interfaces. Portfolio de Nico Ayala.",
  },
  nav: {
    portfolio: "Portfolio",
    contact: "Contacto",
    about: "Acerca de mi",
    lang: "EN",
  },
  home: {
    designer: "Diseñador",
    graphic: "Gráfico",
    interfaces: "de Interfaces",
    companiesTitle:
      "Empresas, Instituciones y Asociaciones con las que he trabajado",
    pastProjectsTitle: "Proyectos de los que he formado parte",
    currentProjectsTitle: "Proyectos de los que formo parte",
    testimonialsTitle: "Testimonios",
  },
  interfaces: {
    titlePrefix: "Diseñador de ",
    titleBold: "Interfaces",
    subtitle: "Encargos previos e ideas personales",
    prototype: "ver prototipo completo",
    prototypeUnavailable: "prototipo no disponible*",
    prototypeUnavailableHint:
      "No puedo compartir el prototipo por privacidad, NDA o decisión del cliente.",
  },
  grafico: {
    title: "Diseñador Gráfico",
    subtitle: "Encargos previos y diseños personales",
    covers: "Portadas",
    logos: "Logotipos/Wordmarks",
    personal: "Diseños Personales",
  },
  footer: {
    social: "Seguime en Redes",
    navigation: "Navegación",
    contact: "Contacto",
    home: "Inicio",
    graphic: "Diseño Gráfico",
    interfaces: "Diseño de Interfaces",
    email: "nicoayala.desing@gmail.com",
    phone: "+54 9 370 434-2174",
    note: "señales de humo o gritame por la calle también sirve",
    powered: "powered by PUSH",
    behance: "@nicoasinormal",
    x: "@nicoasinormal",
    instagram: "@nicxayala",
    linkedin: "@nicoayala-design",
  },
};

const en: typeof es = {
  meta: {
    title: "Nico Ayala Design",
    description:
      "Graphic and interface designer. Nico Ayala's portfolio.",
  },
  nav: {
    portfolio: "Portfolio",
    contact: "Contact",
    about: "About me",
    lang: "ES",
  },
  home: {
    designer: "Designer",
    graphic: "Graphic",
    interfaces: "Interface",
    companiesTitle: "Companies, Institutions and Associations I've worked with",
    pastProjectsTitle: "Projects I've been part of",
    currentProjectsTitle: "Projects I'm currently part of",
    testimonialsTitle: "Testimonials",
  },
  interfaces: {
    titlePrefix: "Interface ",
    titleBold: "Designer",
    subtitle: "Previous commissions and personal ideas",
    prototype: "view full prototype",
    prototypeUnavailable: "prototype unavailable*",
    prototypeUnavailableHint:
      "I can't share the prototype due to privacy, NDA, or the client's decision.",
  },
  grafico: {
    title: "Graphic Designer",
    subtitle: "Previous commissions and personal designs",
    covers: "Covers",
    logos: "Logos/Wordmarks",
    personal: "Personal Designs",
  },
  footer: {
    social: "Follow me",
    navigation: "Navigation",
    contact: "Contact",
    home: "Home",
    graphic: "Graphic Design",
    interfaces: "Interface Design",
    email: "nicoayala.desing@gmail.com",
    phone: "+54 9 370 434-2174",
    note: "smoke signals or yelling at me on the street also works",
    powered: "powered by PUSH",
    behance: "@nicoasinormal",
    x: "@nicoasinormal",
    instagram: "@nicxayala",
    linkedin: "@nicoayala-design",
  },
};

export type Dictionary = typeof es;

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
