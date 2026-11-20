/**
 * =============================================================================
 *  CONFIGURACIÓN DEL SITIO
 * =============================================================================
 *  Textos fijos de la web: identidad, «Sobre mí», contacto y SEO.
 *  Los PROYECTOS no se editan aquí: están en src/config/proyectos.ts.
 *
 *  Plantilla original diseñada y desarrollada por Electro.
 * =============================================================================
 */

export const siteConfig = {
  /** ---------------------------------------------------------------- IDENTIDAD */
  /** Nombre que acompaña al logo en la cabecera, la portada y el pie. */
  name: "Diego",
  age: 17,
  country: "España",

  /** Titular de la portada. La segunda parte va en el rojo del template. */
  headline: { lead: "Desarrollo para", accent: "Minecraft y Discord" },
  tagline:
    "Creo plugins propios de Minecraft, desarrollo bots de Discord y configuro networks y splitters.",
  specialties: ["Plugins de Minecraft", "Bots de Discord", "Networks y splitters"],

  /** ------------------------------------------------------------------ SOBRE MÍ */
  about: {
    title: "Desarrollo lo que necesita tu servidor",
    intro:
      "Soy Diego, tengo 17 años y soy de España. Programo mis propios plugins de Minecraft, desarrollo bots de Discord y configuro networks y splitters para servidores y comunidades.",
    paragraphs: [
      "Me gusta convertir una idea en algo que funcione dentro del servidor: un comando nuevo, un bot que recibe a la gente o una network en la que cada jugador llega a su modalidad.",
      "En la sección de proyectos verás en qué estoy trabajando y lo que ya he terminado, con capturas y, cuando es posible, una forma de probarlo.",
    ],
  },

  /** ------------------------------------------------------------------ CONTACTO */
  contact: {
    heading: "¿Tienes una idea para tu servidor?",
    text: "Escríbeme por Discord y cuéntame qué necesitas.",
    /** Usuario público de Discord. Solo es un dato de contacto. */
    discord: "ethsynx",
  },

  /** -------------------------------------------------------------------- PIE */
  footer: {
    description: "Plugins de Minecraft, bots de Discord y configuración de networks y splitters.",
  },

  /** --------------------------------------------------------------------- SEO */
  seo: {
    title: "Diego · Plugins de Minecraft, bots de Discord y networks",
    description:
      "Portfolio de Diego: plugins propios de Minecraft, bots de Discord y configuración de networks y splitters.",
  },
} as const;

export const navLinks = [
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Contacto", href: "#contacto" },
];
