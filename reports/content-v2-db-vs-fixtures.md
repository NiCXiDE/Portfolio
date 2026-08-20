# Content V2 — MySQL vs Fixtures Drift

Generado: 2026-08-13T21:41:22.836Z

## A. Resumen ejecutivo

| Tabla | MySQL | Fixtures | Idénticos | Solo MySQL | Solo fixtures | Field diffs |
|-------|------:|---------:|----------:|-----------:|--------------:|------------:|
| brands | 7 | 7 | 2 | 0 | 0 | 5 |
| graphicItems | 47 | 47 | 13 | 0 | 0 | 34 |
| uiProjects | 13 | 13 | 1 | 0 | 0 | 12 |
| brandManuals | 1 | 1 | 0 | 0 | 0 | 1 |
| testimonials | 4 | 4 | 0 | 0 | 0 | 4 |
| namedListItems | 40 | 40 | 30 | 10 | 10 | 0 |
| tags | 9 | 9 | 9 | 0 | 0 | 0 |

## B. Conteos por tabla

- **brands**: MySQL=7, fixtures=7, idénticos=2
- **graphicItems**: MySQL=47, fixtures=47, idénticos=13
- **uiProjects**: MySQL=13, fixtures=13, idénticos=1
- **brandManuals**: MySQL=1, fixtures=1, idénticos=0
- **testimonials**: MySQL=4, fixtures=4, idénticos=0
- **namedListItems**: MySQL=40, fixtures=40, idénticos=30
- **tags**: MySQL=9, fixtures=9, idénticos=9

## C. Solo en MySQL

### brands
—

### graphicItems
—

### uiProjects
—

### brandManuals
—

### testimonials
—

### namedListItems
`company|??rbita L??B|13`, `company|Asociaci??n de Profesionales de Salud de la Marina Mercante|1`, `company|Cl??ster de Innovaci??n Tecnol??gica Formosa|4`, `company|Empresa Provincial de Innovaci??n y Conocimiento Abierto|5`, `company|L??dica Tech|11`, `company|Secretar??a de Ciencia y Tecnolog??a de Formosa|16`, `company|Subsecretar??a de Empleo de Formosa|17`, `past_project|EXPEDICI??N POLO|6`, `past_project|Juegos Provinciales Tecnol??gicos|9`, `past_project|La Estaci??n|10`

### tags
—

## D. Solo en fixtures

### brands
—

### graphicItems
—

### uiProjects
—

### brandManuals
—

### testimonials
—

### namedListItems
`company|Asociación de Profesionales de Salud de la Marina Mercante|1`, `company|Clúster de Innovación Tecnológica Formosa|4`, `company|Empresa Provincial de Innovación y Conocimiento Abierto|5`, `company|Lúdica Tech|11`, `company|Secretaría de Ciencia y Tecnología de Formosa|16`, `company|Subsecretaría de Empleo de Formosa|17`, `company|Órbita LΔB|13`, `past_project|EXPEDICIÓN POLO|6`, `past_project|Juegos Provinciales Tecnológicos|9`, `past_project|La Estación|10`

### tags
—

## E. Diferencias de campos (misma clave)

### brands
- **apsmm**: sortOrder
  - sortOrder: mysql=999 | fixtures=4
- **citf**: name, sortOrder
  - name: mysql="Cl??ster de Innovaci??n Tecnol??gica Formosa" | fixtures="Clúster de Innovación Tecnológica Formosa"
  - sortOrder: mysql=999 | fixtures=6
- **ludica**: name
  - name: mysql="L??dica Tech" | fixtures="Lúdica Tech"
- **orbita-l-b**: name
  - name: mysql="??rbita L??B" | fixtures="Órbita LΔB"
- **seyier**: sortOrder
  - sortOrder: mysql=999 | fixtures=5

### graphicItems
- **apsmm**: alt, detail
  - alt: mysql="Asociaci??n de Profesionales de Salud de la Marina Mercante" | fixtures="Asociación de Profesionales de Salud de la Marina Mercante"
  - detail: mysql={"en":"Merchant Navy Health Professionals Association","es":"Asociaci??n de Profesionales de Salud de la Marina Mercante"} | fixtures={"en":"Merchant Navy Health Professionals Association","es":"Asociación de Profesionales de Salud de la Marina Mercante"}
- **banana-thinking**: detail, hrefLabel
  - detail: mysql={"en":"Personal design","es":"Dise??o personal"} | fixtures={"en":"Personal design","es":"Diseño personal"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **banner-alfaj-metro**: detail
  - detail: mysql={"en":"Printed piece ?? IRL photo TBD","es":"Pieza impresa ?? foto IRL pendiente"} | fixtures={"en":"Printed piece · IRL photo TBD","es":"Pieza impresa · foto IRL pendiente"}
- **banner-cluster**: detail
  - detail: mysql={"en":"Printed piece ?? IRL photo TBD","es":"Pieza impresa ?? foto IRL pendiente"} | fixtures={"en":"Printed piece · IRL photo TBD","es":"Pieza impresa · foto IRL pendiente"}
- **banner-push**: detail
  - detail: mysql={"en":"Printed piece ?? IRL photo TBD","es":"Pieza impresa ?? foto IRL pendiente"} | fixtures={"en":"Printed piece · IRL photo TBD","es":"Pieza impresa · foto IRL pendiente"}
- **banner-samsung**: detail
  - detail: mysql={"en":"Printed piece ?? IRL photo TBD","es":"Pieza impresa ?? foto IRL pendiente"} | fixtures={"en":"Printed piece · IRL photo TBD","es":"Pieza impresa · foto IRL pendiente"}
- **barely-alive**: detail
  - detail: mysql={"en":"Playlist cover ?? own artwork","es":"Portada de playlist ?? artwork propio"} | fixtures={"en":"Playlist cover · own artwork","es":"Portada de playlist · artwork propio"}
- **bass2025**: detail
  - detail: mysql={"en":"Playlist cover ??? Bass series","es":"Portada de playlist ??? Bass series"} | fixtures={"en":"Playlist cover — Bass series","es":"Portada de playlist — Bass series"}
- **bass2026**: detail
  - detail: mysql={"en":"Playlist cover ??? Bass series ?? NICXIDE","es":"Portada de playlist ??? Bass series ?? NICXIDE"} | fixtures={"en":"Playlist cover — Bass series · NICXIDE","es":"Portada de playlist — Bass series · NICXIDE"}
- **bass2k24**: detail
  - detail: mysql={"en":"Playlist cover ??? Bass series","es":"Portada de playlist ??? Bass series"} | fixtures={"en":"Playlist cover — Bass series","es":"Portada de playlist — Bass series"}
- **brigado-crew**: detail
  - detail: mysql={"en":"Promotional piece for Brigado Crew / JBC.","es":"Pieza de difusi??n para Brigado Crew / JBC."} | fixtures={"en":"Promotional piece for Brigado Crew / JBC.","es":"Pieza de difusión para Brigado Crew / JBC."}
- **demon-no-scape**: alt, detail, hrefLabel
  - alt: mysql="Demon illustration ??? No Scape" | fixtures="Demon illustration — No Scape"
  - detail: mysql={"en":"Personal design","es":"Dise??o personal"} | fixtures={"en":"Personal design","es":"Diseño personal"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **expedicion-polo**: title, alt, detail
  - title: mysql={"en":"EXPEDICI??N POLO","es":"EXPEDICI??N POLO"} | fixtures={"en":"EXPEDICIÓN POLO","es":"EXPEDICIÓN POLO"}
  - alt: mysql="EXPEDICI??N POLO" | fixtures="EXPEDICIÓN POLO"
  - detail: mysql={"en":"Event at the Science, Technology and Innovation Hub (PCT&I) showcasing the work and activities carried out at the hub.","es":"Evento en el Polo Cient??fico, Tecnol??gico y de Innovaci??n (PCT&I) para exhibir el trabajo y las actividades que se desarrollan en el polo."} | fixtures={"en":"Event at the Science, Technology and Innovation Hub (PCT&I) showcasing the work and activities carried out at the hub.","es":"Evento en el Polo Científico, Tecnológico y de Innovación (PCT&I) para exhibir el trabajo y las actividades que se desarrollan en el polo."}
- **futulab**: title, alt
  - title: mysql={"en":"futul??b","es":"futul??b"} | fixtures={"en":"futulΔb","es":"futulΔb"}
  - alt: mysql="futul??b" | fixtures="futulΔb"
- **grime-marauda**: title, alt, detail, hrefLabel
  - title: mysql={"en":"Grime ??? Marauda","es":"Grime ??? Marauda"} | fixtures={"en":"Grime — Marauda","es":"Grime — Marauda"}
  - alt: mysql="Grime ??? Marauda" | fixtures="Grime — Marauda"
  - detail: mysql={"en":"Personal design","es":"Dise??o personal"} | fixtures={"en":"Personal design","es":"Diseño personal"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **grime-pawn**: alt, detail, hrefLabel
  - alt: mysql="Grime pawn ??? Ayala" | fixtures="Grime pawn — Ayala"
  - detail: mysql={"en":"Personal design","es":"Dise??o personal"} | fixtures={"en":"Personal design","es":"Diseño personal"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **ive-no-idea**: detail
  - detail: mysql={"en":"Playlist cover ?? own artwork","es":"Portada de playlist ?? artwork propio"} | fixtures={"en":"Playlist cover · own artwork","es":"Portada de playlist · artwork propio"}
- **juegos-provinciales**: galleryPaths, title, alt, detail
  - galleryPaths: mysql=[{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-musica.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-robotica.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-gaming.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-espacios.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/mapa.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/mapa-story.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/afiche.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-identidad.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-gonzalito.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-axel.png"},{"src":"/assets/grafico/eventos/juegos-provinciales/flyer-lucas-sub21.png"}] | fixtures=["/assets/grafico/eventos/juegos-provinciales/flyer-musica.png","/assets/grafico/eventos/juegos-provinciales/flyer-robotica.png","/assets/grafico/eventos/juegos-provinciales/flyer-gaming.png","/assets/grafico/eventos/juegos-provinciales/flyer-espacios.png","/assets/grafico/eventos/juegos-provinciales/mapa.png","/assets/grafico/eventos/juegos-provinciales/mapa-story.png","/assets/grafico/eventos/juegos-provinciales/afiche.png","/assets/grafico/eventos/juegos-provinciales/flyer-identidad.png","/assets/grafico/eventos/juegos-provinciales/flyer-gonzalito.png","/assets/grafico/eventos/juegos-provinciales/flyer-axel.png","/assets/grafico/eventos/juegos-provinciales/flyer-lucas-sub21.png"]
  - title: mysql={"en":"Provincial Technology Games","es":"Juegos Provinciales Tecnol??gicos"} | fixtures={"en":"Provincial Technology Games","es":"Juegos Provinciales Tecnológicos"}
  - alt: mysql="Juegos Provinciales Tecnol??gicos" | fixtures="Juegos Provinciales Tecnológicos"
  - detail: mysql={"en":"Promo campaign for the Government of Formosa: gaming, robotics, and live music. Science, Technology and Innovation Hub ?? 21 June.","es":"Campa??a de difusi??n para el Gobierno de Formosa: gaming, rob??tica y m??sica en vivo. Polo Cient??fico, Tecnol??gico y de Innovaci??n ?? 21 de junio."} | fixtures={"en":"Promo campaign for the Government of Formosa: gaming, robotics, and live music. Science, Technology and Innovation Hub · 21 June.","es":"Campaña de difusión para el Gobierno de Formosa: gaming, robótica y música en vivo. Polo Científico, Tecnológico y de Innovación · 21 de junio."}
- **kadaver-jez-ebel**: detail
  - detail: mysql={"en":"SoundCloud cover ??? KADAVER ?? Jez_ebel bootleg","es":"Portada en SoundCloud ??? KADAVER ?? Jez_ebel bootleg"} | fixtures={"en":"SoundCloud cover — KADAVER · Jez_ebel bootleg","es":"Portada en SoundCloud — KADAVER · Jez_ebel bootleg"}
- **magic-cell**: detail
  - detail: mysql={"en":"Phone-case venture ?? wordmark","es":"Emprendimiento de fundas ?? logotipo"} | fixtures={"en":"Phone-case venture · wordmark","es":"Emprendimiento de fundas · logotipo"}
- **mantis**: hrefLabel
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **marauda-type-logo-ayala**: alt, detail, hrefLabel
  - alt: mysql="Marauda type logo ??? Ayala" | fixtures="Marauda type logo — Ayala"
  - detail: mysql={"en":"Personal take inspired by Marauda (~2020)","es":"Interpretaci??n propia inspirada en Marauda (~2020)"} | fixtures={"en":"Personal take inspired by Marauda (~2020)","es":"Interpretación propia inspirada en Marauda (~2020)"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **nick-tdt-beach**: detail
  - detail: mysql={"en":"Pixel art illustration ?? no background","es":"Ilustraci??n pixel art ?? sin fondo"} | fixtures={"en":"Pixel art illustration · no background","es":"Ilustración pixel art · sin fondo"}
- **nicoide-geometry-dash**: alt, detail, hrefLabel
  - alt: mysql="NICOIDE ??? Geometry Dash wordmark" | fixtures="NICOIDE — Geometry Dash wordmark"
  - detail: mysql={"en":"Origin of the brand N ?? built in Geometry Dash, later vectorized","es":"Origen de la N de marca ?? armado en Geometry Dash, luego vectorizado"} | fixtures={"en":"Origin of the brand N · built in Geometry Dash, later vectorized","es":"Origen de la N de marca · armado en Geometry Dash, luego vectorizado"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **nicoide-not-impostor**: detail, hrefLabel
  - detail: mysql={"en":"Personal design","es":"Dise??o personal"} | fixtures={"en":"Personal design","es":"Diseño personal"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **odyssey-plant-head**: alt, detail
  - alt: mysql="Odyssey ??? plant head figure" | fixtures="Odyssey — plant head figure"
  - detail: mysql={"en":"Digital illustration","es":"Ilustraci??n digital"} | fixtures={"en":"Digital illustration","es":"Ilustración digital"}
- **penguin-knife**: title
  - title: mysql={"en":"Penguin","es":"Ping??ino"} | fixtures={"en":"Penguin","es":"Pingüino"}
- **push**: detail
  - detail: mysql={"en":"Software factory ?? brand identity","es":"Software factory ?? identidad de marca"} | fixtures={"en":"Software factory · brand identity","es":"Software factory · identidad de marca"}
- **sad-machine-makenix**: title, detail, hrefLabel
  - title: mysql={"en":"Sad Machine ??? Makenix Remix","es":"Sad Machine ??? Makenix Remix"} | fixtures={"en":"Sad Machine — Makenix Remix","es":"Sad Machine — Makenix Remix"}
  - detail: mysql={"en":"Fan art ?? not an official cover ?? Makenix remix","es":"Fan art ?? no es portada oficial ?? remix de Makenix"} | fixtures={"en":"Fan art · not an official cover · Makenix remix","es":"Fan art · no es portada oficial · remix de Makenix"}
  - hrefLabel: mysql={"en":"See more","es":"Ver m??s"} | fixtures={"en":"See more","es":"Ver más"}
- **summit-holding**: detail
  - detail: mysql={"en":"Vector identity for a commission ?? holding / financial entity (investments, portfolios).","es":"Identidad vectorial para encargo ?? entidad tipo holding / financiera (inversiones, carteras)."} | fixtures={"en":"Vector identity for a commission · holding / financial entity (investments, portfolios).","es":"Identidad vectorial para encargo · entidad tipo holding / financiera (inversiones, carteras)."}
- **tdt**: alt, detail
  - alt: mysql="TDT ??? The Dream Team" | fixtures="TDT — The Dream Team"
  - detail: mysql={"en":"The Dream Team ?? isotype","es":"The Dream Team ?? isotipo"} | fixtures={"en":"The Dream Team · isotype","es":"The Dream Team · isotipo"}
- **twenty-twenty-3**: detail
  - detail: mysql={"en":"Playlist cover ??? Bass series","es":"Portada de playlist ??? Bass series"} | fixtures={"en":"Playlist cover — Bass series","es":"Portada de playlist — Bass series"}
- **twenty-twenty-two-spotify**: detail
  - detail: mysql={"en":"Playlist cover ??? Bass series","es":"Portada de playlist ??? Bass series"} | fixtures={"en":"Playlist cover — Bass series","es":"Portada de playlist — Bass series"}
- **we-are-barely-world**: alt
  - alt: mysql="We Are Barely Alive ??? Mario world parody" | fixtures="We Are Barely Alive — Mario world parody"

### uiProjects
- **adapto-pay**: meta
  - meta: mysql={"en":"Collaboration with @aicore - November 2024","es":"Colaboraci??n con @aicore - noviembre 2024"} | fixtures={"en":"Collaboration with @aicore - November 2024","es":"Colaboración con @aicore - noviembre 2024"}
- **aicore-inventariado**: title, meta
  - title: mysql={"en":"AICORE IT Specialists ??? inventory","es":"AICORE IT Specialists ??? inventariado"} | fixtures={"en":"AICORE IT Specialists — inventory","es":"AICORE IT Specialists — inventariado"}
  - meta: mysql={"en":"Pre-sales ?? commercial management backoffice","es":"Preventa ?? backoffice de gesti??n comercial"} | fixtures={"en":"Pre-sales · commercial management backoffice","es":"Preventa · backoffice de gestión comercial"}
- **aml-casinos**: title, meta
  - title: mysql={"en":"Anti-Money Laundering Analysis for Digital Casinos","es":"An??lisis contra el Lavado de Dinero en Casinos Digitales"} | fixtures={"en":"Anti-Money Laundering Analysis for Digital Casinos","es":"Análisis contra el Lavado de Dinero en Casinos Digitales"}
  - meta: mysql={"en":"Collaboration with @aicore - September 2024","es":"Colaboraci??n con @aicore - septiembre 2024"} | fixtures={"en":"Collaboration with @aicore - September 2024","es":"Colaboración con @aicore - septiembre 2024"}
- **aml-general**: title, meta
  - title: mysql={"en":"Anti-Money Laundering Analysis","es":"An??lisis contra el Lavado de Dinero"} | fixtures={"en":"Anti-Money Laundering Analysis","es":"Análisis contra el Lavado de Dinero"}
  - meta: mysql={"en":"Collaboration with @aicore - October 2024","es":"Colaboraci??n con @aicore - octubre 2024"} | fixtures={"en":"Collaboration with @aicore - October 2024","es":"Colaboración con @aicore - octubre 2024"}
- **apsmm**: title, meta
  - title: mysql={"en":"Management system ??? APSMM","es":"Sistema de gesti??n ??? APSMM"} | fixtures={"en":"Management system — APSMM","es":"Sistema de gestión — APSMM"}
  - meta: mysql={"en":"Merchant Navy Health Professionals Association ?? UI interface","es":"Asociaci??n de Profesionales de Salud de la Marina Mercante ?? interfaz UI"} | fixtures={"en":"Merchant Navy Health Professionals Association · UI interface","es":"Asociación de Profesionales de Salud de la Marina Mercante · interfaz UI"}
- **asesor-financiero**: meta, summary
  - meta: mysql={"en":"Mobile app ?? demo","es":"App mobile ?? demo"} | fixtures={"en":"Mobile app · demo","es":"App mobile · demo"}
  - summary: mysql={"en":"Demo app for investment portfolio recommendations based on risk profile and preferences.","es":"Demo de app para recomendaci??n de carteras de inversi??n seg??n perfil y preferencias."} | fixtures={"en":"Demo app for investment portfolio recommendations based on risk profile and preferences.","es":"Demo de app para recomendación de carteras de inversión según perfil y preferencias."}
- **casiba**: title, meta
  - title: mysql={"en":"Air Treatment Units Management System - CASIBA","es":"Sistema de Gesti??n de Unidades de Tratamiento de Aire - CASIBA"} | fixtures={"en":"Air Treatment Units Management System - CASIBA","es":"Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA"}
  - meta: mysql={"en":"Collaboration with @aicore - September 2024","es":"Colaboraci??n con @aicore - septiembre 2024"} | fixtures={"en":"Collaboration with @aicore - September 2024","es":"Colaboración con @aicore - septiembre 2024"}
- **clearwater**: title, meta
  - title: mysql={"en":"Purchase & Investment Report Generation - CLEARWATER","es":"Generaci??n de Informes para compra e inversi??n - CLEARWATER"} | fixtures={"en":"Purchase & Investment Report Generation - CLEARWATER","es":"Generación de Informes para compra e inversión - CLEARWATER"}
  - meta: mysql={"en":"Collaboration with @aicore - January 2024","es":"Colaboraci??n con @aicore - enero 2024"} | fixtures={"en":"Collaboration with @aicore - January 2024","es":"Colaboración con @aicore - enero 2024"}
- **cms-portfolio**: title, meta, summary, duration
  - title: mysql={"en":"Portfolio content management system","es":"Sistema de gesti??n de contenido del portfolio"} | fixtures={"en":"Portfolio content management system","es":"Sistema de gestión de contenido del portfolio"}
  - meta: mysql={"en":"Custom CMS ?? this site's admin panel","es":"CMS propio ?? panel de administraci??n de este sitio"} | fixtures={"en":"Custom CMS · this site's admin panel","es":"CMS propio · panel de administración de este sitio"}
  - summary: mysql={"en":"Custom admin panel for this portfolio: type, graphic/interfaces layers, inbox, brands, testimonials and media. Built so content can ship without code changes. Explore it in read-only visitor mode.","es":"Panel de administraci??n hecho a medida para este portfolio: tipograf??as, capas gr??fico/interfaces, bandeja de pendientes, marcas, testimonios y media. Pensado para publicar sin tocar c??digo. Pod??s recorrerlo en modo visitante (solo lectura)."} | fixtures={"en":"Custom admin panel for this portfolio: type, graphic/interfaces layers, inbox, brands, testimonials and media. Built so content can ship without code changes. Explore it in read-only visitor mode.","es":"Panel de administración hecho a medida para este portfolio: tipografías, capas gráfico/interfaces, bandeja de pendientes, marcas, testimonios y media. Pensado para publicar sin tocar código. Podés recorrerlo en modo visitante (solo lectura)."}
  - duration: mysql={"en":"ongoing","es":"en evoluci??n continua"} | fixtures={"en":"ongoing","es":"en evolución continua"}
- **mikrobiol**: meta
  - meta: mysql={"en":"Collaboration with @aicore - October 2024","es":"Colaboraci??n con @aicore - octubre 2024"} | fixtures={"en":"Collaboration with @aicore - October 2024","es":"Colaboración con @aicore - octubre 2024"}
- **omnigroup**: title, meta, summary
  - title: mysql={"en":"Omnigroup ??? backoffice and totem","es":"Omnigroup ??? backoffice y t??tem"} | fixtures={"en":"Omnigroup — backoffice and totem","es":"Omnigroup — backoffice y tótem"}
  - meta: mysql={"en":"Pre-sales ?? web + self-service totem","es":"Preventa ?? web + t??tem de autoservicio"} | fixtures={"en":"Pre-sales · web + self-service totem","es":"Preventa · web + tótem de autoservicio"}
  - summary: mysql={"en":"Web backoffice for merchants and a self-service totem: points of interest, totem management, and a vertical device flow.","es":"Backoffice web para comercios y t??tem de autoservicio: puntos de inter??s, gesti??n de t??tems y flujo en dispositivo vertical."} | fixtures={"en":"Web backoffice for merchants and a self-service totem: points of interest, totem management, and a vertical device flow.","es":"Backoffice web para comercios y tótem de autoservicio: puntos de interés, gestión de tótems y flujo en dispositivo vertical."}
- **proxi**: meta
  - meta: mysql={"en":"Collaboration with @aicore - January 2024","es":"Colaboraci??n con @aicore - enero 2024"} | fixtures={"en":"Collaboration with @aicore - January 2024","es":"Colaboración con @aicore - enero 2024"}

### brandManuals
- **citf**: meta
  - meta: mysql={"en":"Formosa Technology Innovation Cluster","es":"Cl??ster de Innovaci??n Tecnol??gica Formosa"} | fixtures={"en":"Formosa Technology Innovation Cluster","es":"Clúster de Innovación Tecnológica Formosa"}

### testimonials
- **ezequiel**: quote
  - quote: mysql={"en":"While we worked together, Nico showed great responsibility and professionalism. His proposals always added value to the product and the user experience, achieving visible results aligned with project goals.","es":"Durante el tiempo que trabajamos juntos, Nico demostr?? gran responsabilidad y profesionalismo. Sus propuestas siempre aportaron valor al producto y a la experiencia del usuario, logrando resultados visibles y alineados con los objetivos del proyecto."} | fixtures={"en":"While we worked together, Nico showed great responsibility and professionalism. His proposals always added value to the product and the user experience, achieving visible results aligned with project goals.","es":"Durante el tiempo que trabajamos juntos, Nico demostró gran responsabilidad y profesionalismo. Sus propuestas siempre aportaron valor al producto y a la experiencia del usuario, logrando resultados visibles y alineados con los objetivos del proyecto."}
- **facundo**: quote
  - quote: mysql={"en":"Nico is more than an exceptional professional ??? he's a great person. His programming knowledge lets him communicate effectively with developers, and his passion for projects leads him to take on extra roles. He's a valuable and standout member of any team.","es":"Nico es m??s que un profesional excepcional, es una gran persona. Su conocimiento en programaci??n le permite comunicarse de manera efectiva con los desarrolladores, y su pasi??n por los proyectos lo lleva a involucrarse al punto de asumir roles adicionales. Sin duda, es un miembro valioso y distinguido en cualquier equipo."} | fixtures={"en":"Nico is more than an exceptional professional — he's a great person. His programming knowledge lets him communicate effectively with developers, and his passion for projects leads him to take on extra roles. He's a valuable and standout member of any team.","es":"Nico es más que un profesional excepcional, es una gran persona. Su conocimiento en programación le permite comunicarse de manera efectiva con los desarrolladores, y su pasión por los proyectos lo lleva a involucrarse al punto de asumir roles adicionales. Sin duda, es un miembro valioso y distinguido en cualquier equipo."}
- **joaquin**: name, quote, role, companyName
  - name: mysql="Amarilla Joaqu??n" | fixtures="Amarilla Joaquín"
  - quote: mysql={"en":"Great creativity and solid understanding of project needs.","es":"Gran creatividad y buena compresi??n para las necesidades de los proyectos."} | fixtures={"en":"Great creativity and solid understanding of project needs.","es":"Gran creatividad y buena compresión para las necesidades de los proyectos."}
  - role: mysql={"en":"CEO of L??dica Tech","es":"CEO de L??dica Tech"} | fixtures={"en":"CEO of Lúdica Tech","es":"CEO de Lúdica Tech"}
  - companyName: mysql="L??dica Tech" | fixtures="Lúdica Tech"
- **matias**: hidden, name, role, companyName
  - hidden: mysql=false | fixtures=true
  - name: mysql="Mendoza Mat??as" | fixtures="Mendoza Matías"
  - role: mysql={"en":"CEO of ??rbita L??B","es":"CEO de ??rbita L??B"} | fixtures={"en":"CEO of Órbita LΔB","es":"CEO de Órbita LΔB"}
  - companyName: mysql="??rbita L??B" | fixtures="Órbita LΔB"

### namedListItems
_Sin diferencias de campos._

### tags
_Sin diferencias de campos._
