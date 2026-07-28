# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.1] - 2026-03-20

### Corregido
- Los títulos de las tarjetas de capítulo en la portada se veían casi negros sobre el fondo oscuro. El reset de `button` no incluía `color: inherit`, así que el `<h3>` caía al color por defecto del navegador en vez de heredar el blanco de la sección
- Añadido `color: inherit` al reset global de `button`, que corrige el problema de raíz para cualquier texto anidado dentro de un botón
- Color explícito en el `<h3>` de las tarjetas como salvaguarda

## [2.0.0] - 2026-03-20

### Cambiado
- **Rediseño visual completo.** Nuevo sistema de diseño institucional y editorial, documentado en `docs/DESIGN.md`
- Paleta reconstruida: base `#0B1220`, superficie `#F4F6F8`, sello dorado `#C8A24A`, y un acento propio por camino (azur, verde azulado, ocre, carmesí)
- Tipografía: **Archivo** para display con tracking de −0.035em, **Inter** para interfaz. Sustituye a las fuentes de sistema
- Landing reconstruida: héroe a pantalla completa, rejilla de capítulos, cifras del examen, fuentes oficiales y cierre
- Las cuatro secciones pasan a ser capítulos numerados (01–04) con cabecera propia teñida
- `DisclaimerGate` rediseñado como documento legal editorial con las 13 cláusulas numeradas
- Navegación fija que adapta su color según la vista y se colapsa en móvil

### Agregado
- **Transición de capítulo**: barrido vertical a pantalla completa con emblema, número y título al entrar a cada camino (1220 ms)
- **Cuatro emblemas SVG originales** construidos con los artefactos reales del proceso. El de Estudio dibuja 128 marcas, 20 delineadas y 12 rellenas: la aritmética del examen como ornamento
- **Héroe generativo**: 50 estrellas con parpadeo desfasado sobre 13 franjas diagonales. La bandera descompuesta en datos
- Revelado al desplazar con `IntersectionObserver`
- Estado vacío en la búsqueda de preguntas, con acción para quitar filtros
- Pantalla de cierre al completar los 10 pasos del proceso
- `docs/DESIGN.md` con tokens, movimiento, estructura y lista de verificación

### Accesibilidad
- `prefers-reduced-motion: reduce` anula todas las animaciones
- Foco de teclado visible en todo control (contorno dorado, desplazamiento de 3px)
- Contraste de texto WCAG AA en todos los pares
- Probado a 375, 768, 1024 y 1440px

## [1.1.0] - 2026-03-15

### Agregado
- **Disclaimer legal de 13 cláusulas**: Pantalla de entrada obligatoria bilingüe (ES/EN) con checkbox de aceptación requerido antes de acceder a la aplicación
  - Cláusula anti-notario y anti-UPIL con referencia explícita a 8 CFR § 1.2 y 8 CFR § 292.1
  - Cláusula de no preparación/presentación de formularios ante USCIS o DHS
  - Alcance limitado de la herramienta de elegibilidad (no es determinación oficial)
  - Cláusula de ley aplicable (INA, 8 CFR, leyes estatales)
  - Protección contra fraude migratorio con referencia a uscis.gov/avoid-scams y 1-800-375-5283
  - Limitación de responsabilidad ampliada (daños directos, indirectos, consecuentes, especiales, punitivos)
  - Garantía "as-is" sobre contenido
  - Privacidad: sin recopilación, almacenamiento, ni transmisión de datos
- **Botón de regreso al inicio** en todas las secciones (Elegibilidad, Proceso, Aprender, Simulación)
- **Navegación post-elegibilidad mejorada**: botón principal para ir al checklist, más opciones de inicio y reevaluar
- **Footer con crédito**: Gustavo Valbuena — Fundador de PeopleBot AI
- Toggle Español/English en pantalla de disclaimer

### Cambiado
- Crédito de autoría actualizado a "Fundador de PeopleBot AI"
- Pantalla de resultados de simulación ahora incluye botón de regreso al inicio

## [1.0.0] - 2026-03-15

### Agregado
- **Verificación de Elegibilidad**: Flujo interactivo de 10 preguntas basadas en requisitos oficiales de USCIS con evaluación en tiempo real y mensajes específicos de descalificación
- **Proceso Paso a Paso**: Checklist de 10 pasos con progreso persistente, detalles expandibles sobre documentos, costos ($760 N-400), tiempos, y formularios
- **Aprendizaje de Educación Cívica**: 128 preguntas completas del examen cívico 2025 en inglés y español
  - Modo lista con búsqueda y filtros por sección
  - Modo tarjetas (flashcards) con navegación secuencial y aleatoria
  - Filtro 65/20 para preguntas marcadas con estrella
- **Simulación de Entrevista**: Simulacro realista del examen
  - Configuración personalizable (10, 20, 30, 50 preguntas)
  - Opción de filtrar solo preguntas 65/20
  - Visualización bilingüe (inglés como lo escucharía del oficial + traducción al español)
  - Autoevaluación con conteo de correctas/incorrectas
  - Pantalla de resultados con porcentaje y estado aprobado/no aprobado
- **Diseño responsive**: Mobile-first con breakpoint a 768px
- **Navegación**: Sticky nav con blur backdrop, menú hamburguesa en móvil
- **Iconografía**: Lucide React (sin emojis)
- **Footer**: Crédito de autoría y aviso legal
- Botón de regreso al inicio en todas las secciones
- Navegación post-elegibilidad: opciones para ir al checklist, inicio, o evaluar de nuevo
- Documentación completa: README, LICENSE (MIT), CONTRIBUTING, CHANGELOG, SOURCES

### Fuentes
- USCIS 128 Civics Questions and Answers (2025 version) — M-1778 (09/25)
- USCIS Naturalization Eligibility Requirements
- USCIS Form N-400 Application for Naturalization
- USCIS Naturalization Process (10-step)
- USCIS 65/20 Special Consideration guidelines
