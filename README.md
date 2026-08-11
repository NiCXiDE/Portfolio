# Nico Ayala Design — Portfolio

Sitio y CMS personal de **Nicolas Ayala**, diseñador gráfico y de interfaces.  
Portfolio vivo en [nicoayala.com.ar](https://nicoayala.com.ar) (cuando esté publicado).

Este repositorio **no es una plantilla genérica de Next.js** ni un starter para clonar y republicar con el contenido incluido. Las piezas, firmas, fotos, CV y textos son del autor. Si alguien mira el código, es para ver cómo está armado el producto; no para levantar “el portfolio de Nico” listo para hospedar.

---

## Qué muestra el sitio público

Tres capas principales (navegación tipo paneles):

- **Inicio** — identidad, bio, empresas/proyectos en marquees, testimonios, contacto y FAQ.
- **Gráfico** — portadas, logos, ilustración, impresos/banners y piezas personales (filtros, tags, expansión de detalle).
- **Interfaces** — proyectos UI por categoría (preventas, sistemas a medida, system design, personales), con ficha modal, carrusel y enlace a prototipo / visita CMS / live según el caso.

Extras de producto: tema claro/oscuro, i18n ES/EN, SEO básico (títulos, `robots.txt`, sitemap, imagen OG, schema Person), política de privacidad y cableado opcional de analytics.

---

## Qué puede hacer el CMS (`/admin`)

Backoffice propio para gestionar contenido **sin tocar código** en el día a día:

- Piezas gráficas por sección, tags, media y publicación.
- Proyectos de interfaces (galería, meta, cliente, periodo, CTA).
- Bio, testimonios, marcas, listas del home, settings del sitio.
- Bandeja de pendientes / ocultos, auditoría y control de acceso.
- **Modo visitante (showcase):** recorrido guiado de solo lectura para mostrar cómo funciona el panel sin guardar cambios.

---

## Stack (resumen)

- **Next.js** (App Router) + React
- **MySQL** + TypeORM
- Media en storage S3-compatible (cuando está configurado)
- Deploy pensado para contenedor / **Kubernetes** (no es un proyecto “one-click Vercel”)

Variables de entorno y secretos quedan **fuera** del repositorio (ver `.gitignore`). No se documenta aquí un onboarding para terceros con el contenido del autor.

---

## Alcance de este repo

| Sí | No |
|----|----|
| Código del portfolio + CMS | Kit listo para “fork y publicá mi bio” |
| Descripción de capacidades | Guía de setup para terceros |
| Referencia técnica de cómo está hecho | Plantilla vacía open-source (eso sería otro repo, otro día) |

Si en el futuro existiera una versión *starter* sin assets personales, iría en un proyecto separado: seed vacío, placeholders y licencia clara. **Ese no es este repo.**

---

## Contacto

- Mail: [nicoayala.design@gmail.com](mailto:nicoayala.design@gmail.com)
- Portfolio: [nicoayala.com.ar](https://nicoayala.com.ar)
