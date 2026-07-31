# Mi Ciudadanía

**Guía interactiva en español para el proceso de naturalización a ciudadano estadounidense.**

Creado por **Gustavo Valbuena** — Fundador de PeopleBot AI

---

## Deploys activos

- **OpenAI Pages:** https://mi-ciudadania-redesign.gusvaltor.chatgpt.site
- **Vercel:** https://mi-ciudadania.vercel.app

Este repositorio mantiene el artefacto estático funcional que Vercel sirve desde
la raíz del proyecto. La configuración actual de `vercel.json` usa
`outputDirectory: "."`, por lo que `index.html`, `app.html`,
`mi-ciudadania.html` y `assets/` deben permanecer sincronizados con el build
validado.

## Descripción

**Mi Ciudadanía** es una aplicación web de página única (SPA) diseñada para hispanohablantes que están en proceso de naturalización a ciudadano de los Estados Unidos. La aplicación ofrece herramientas interactivas para verificar elegibilidad, seguir el proceso paso a paso, estudiar para el examen cívico 2025, y practicar con simulaciones de entrevista.

Toda la información está basada exclusivamente en fuentes oficiales de [USCIS](https://www.uscis.gov) (U.S. Citizenship and Immigration Services).

## Funcionalidades

### Diseño

Sistema visual institucional documentado en [docs/DESIGN.md](docs/DESIGN.md).

- Cuatro caminos, cada uno con color, emblema y número de capítulo propios
- Transición cinematográfica de capítulo al entrar a cada sección
- Emblemas SVG originales construidos con los artefactos reales del proceso
- Tipografía Archivo (display) e Inter (interfaz)
- Responsivo a 375, 768, 1024 y 1440px
- `prefers-reduced-motion` respetado, foco de teclado visible, contraste WCAG AA

### Disclaimer Legal Bilingüe
- Pantalla de entrada obligatoria con 13 cláusulas legales en inglés y español
- Toggle de idioma (ES/EN)
- Checkbox de aceptación requerido antes de acceder a la aplicación
- Referencias a regulación federal (8 CFR § 1.2, 8 CFR § 292.1, INA)
- Protección contra UPIL (Unauthorized Practice of Immigration Law)

### 1. Verificación de Elegibilidad
- Flujo guiado de 10 preguntas basadas en los requisitos oficiales de USCIS
- Evaluación en tiempo real de si el usuario califica para naturalización
- Explicación detallada de por qué no califica y qué debe hacer en cada caso
- Navegación directa al checklist de proceso tras confirmación de elegibilidad

### 2. Proceso Paso a Paso (Checklist)
- 10 pasos completos desde la verificación hasta post-ciudadanía
- Checklist interactivo con progreso persistente por sesión
- Detalles expandibles por cada paso: documentos, costos, tiempos, formularios
- Barra de progreso visual

### 3. Aprendizaje de Educación Cívica
- Las **128 preguntas** completas del examen cívico 2025
- Cada pregunta en **inglés y español** (bilingüe)
- **Modo lista**: navegación, búsqueda, filtros por sección
- **Modo tarjetas (flashcards)**: estudio interactivo con navegación y aleatorio
- Filtro **65/20**: preguntas marcadas con estrella para personas mayores de 65 años con 20+ años de residencia permanente
- Todas las respuestas aceptadas por USCIS incluidas

### 4. Simulación de Entrevista
- Simulacro realista del examen cívico de naturalización
- Configuración personalizable: 10, 20, 30 o 50 preguntas
- Opción de filtrar solo preguntas 65/20
- Pregunta mostrada en inglés (como la escucharía del oficial) y español (traducción)
- Autoevaluación: el usuario marca si acertó o falló
- Pantalla de resultados con porcentaje, aprobado/no aprobado, y desglose

## Requisitos del Examen Cívico 2025

| Detalle | Valor |
|---------|-------|
| Total de preguntas para estudiar | 128 |
| Preguntas en el examen | Hasta 20 |
| Correctas para aprobar | 12 (60%) |
| Incorrectas para reprobar | 9 |
| Preguntas 65/20 (con estrella) | 20 |
| Correctas 65/20 para aprobar | 6 de 10 |

Fuente: [USCIS — 128 Civics Questions and Answers (2025 version)](https://www.uscis.gov/citizenship)

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **React** | Framework de UI (functional components, hooks) |
| **Lucide React** | Iconografía (sin emojis) |
| **CSS-in-JS + hoja global** | Estilizado, tokens y animaciones |
| **Google Fonts** | Archivo (display) e Inter (interfaz) |
| **SVG** | Emblemas y héroe generativo, dibujados a mano |
| **JavaScript ES6+** | Lógica de aplicación |

### Dependencias

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "lucide-react": "^0.383.0"
}
```

## Estructura del Proyecto

```
mi-ciudadania/
├── citizenship-app.jsx    # Aplicación principal (SPA - single file)
├── README.md              # Este archivo
├── LICENSE                # Licencia del proyecto
├── CONTRIBUTING.md        # Guía de contribución
├── CHANGELOG.md           # Historial de cambios
└── docs/
    ├── SOURCES.md         # Fuentes oficiales utilizadas
    └── DESIGN.md          # Sistema de diseño completo
```

## Arquitectura de la Aplicación

La aplicación está construida como un **single-file React component** con las siguientes secciones:

```
App (root)
├── GlobalStyle        — Tokens, keyframes, breakpoints, reduced-motion
├── DisclaimerGate     — Documento legal editorial bilingüe (13 cláusulas)
├── ChapterWipe        — Transición cinematográfica entre caminos
├── Nav                — Navegación fija, adapta color según la vista
├── Landing            — Héroe generativo → capítulos → cifras → fuentes → cierre
├── PathHero           — Banda de cabecera teñida, compartida por los 4 caminos
├── EligibilityView    — 01 · Verificación de elegibilidad
├── ChecklistView      — 02 · Proceso de 10 pasos
├── StudyView          — 03 · 128 preguntas (lista + tarjetas)
├── SimulationView     — 04 · Simulacro de entrevista
└── Footer
```

### Emblemas

Cada camino tiene un dibujo vectorial original que codifica algo cierto del proceso.
El de Estudio son 128 marcas en rejilla de 16×8: veinte delineadas (las que le
preguntan) y doce rellenas (las que debe acertar).

### Datos

- `CIVICS_QUESTIONS` — Array de 128 objetos con preguntas bilingües, respuestas, sección, y marcador 65/20
- `ELIGIBILITY_QUESTIONS` — Array de 10 preguntas de elegibilidad con mensajes de descalificación
- `PROCESS_STEPS` — Array de 10 pasos del proceso de naturalización

## Instalación y Uso

### Opción 1: Claude.ai Artifacts
La aplicación fue diseñada para ejecutarse directamente como un **React artifact** en Claude.ai. Simplemente carga el archivo `.jsx`.

### Opción 2: Proyecto React local

```bash
# Crear proyecto
npx create-react-app mi-ciudadania
cd mi-ciudadania

# Instalar dependencias
npm install lucide-react

# Reemplazar src/App.jsx con el contenido de citizenship-app.jsx
cp citizenship-app.jsx src/App.jsx

# Ejecutar
npm start
```

### Opción 3: Vite

```bash
npm create vite@latest mi-ciudadania -- --template react
cd mi-ciudadania
npm install lucide-react
cp citizenship-app.jsx src/App.jsx
npm run dev
```

## Diseño

- **Filosofía**: Estilo Apple — limpio, minimalista, con atención al detalle tipográfico
- **Tipografía**: SF Pro Display / Helvetica Neue / system fonts
- **Colores principales**:
  - Azul primario: `#0071E3`
  - Verde éxito: `#34C759`
  - Naranja alerta: `#FF9500`
  - Rojo error: `#FF3B30`
  - Púrpura acento: `#AF52DE`
- **Responsive**: Diseñado mobile-first con breakpoint a 768px
- **Iconografía**: Lucide React (sin emojis)
- **Navegación**: Sticky nav con blur backdrop, menú hamburguesa en móvil

## Fuentes Oficiales

Toda la información de esta aplicación proviene exclusivamente de fuentes oficiales:

- [USCIS — U.S. Citizenship and Immigration Services](https://www.uscis.gov)
- [USCIS — Citizenship Resource Center](https://www.uscis.gov/citizenship)
- [USCIS — 128 Civics Questions and Answers (2025)](https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test)
- [USCIS — Test Updates](https://www.uscis.gov/citizenship/testupdates)
- [USCIS — Form N-400](https://www.uscis.gov/n-400)
- [USCIS — Naturalization Eligibility Worksheet (M-480)](https://www.uscis.gov/sites/default/files/document/guides/M-480.pdf)

## Aviso Legal y Conformidad Regulatoria

> **Esta aplicación es una herramienta informativa y educativa gratuita.** No constituye asesoría legal, representación legal, ni consejo jurídico de ningún tipo. Su uso no establece relación abogado-cliente. El creador no es abogado, consultor de inmigración, ni representante acreditado por el DOJ.

La aplicación incluye un **disclaimer legal de 13 cláusulas** (en inglés y español) como pantalla de entrada obligatoria con checkbox de aceptación. El disclaimer cubre:

1. No constituye asesoría legal
2. No establece relación abogado-cliente
3. No es "notario", consultor de inmigración, ni representante acreditado (8 CFR § 292.1)
4. No prepara, completa, ni presenta formularios de inmigración
5. Obligación de consultar con profesional autorizado
6. Alcance limitado de la herramienta de elegibilidad
7. Información potencialmente desactualizada
8. Sin garantía de resultados — contenido ofrecido "as-is"
9. Limitación de responsabilidad (daños directos, indirectos, consecuentes, punitivos)
10. Fuentes de información y uso gratuito
11. Protección contra fraude migratorio (referencia a uscis.gov/avoid-scams)
12. Ley aplicable (INA, 8 CFR, leyes estatales)
13. Privacidad — sin recopilación de datos

### Marco regulatorio de referencia

| Regulación | Cobertura |
|------------|-----------|
| 8 CFR § 1.2 | Definición de "práctica" de ley de inmigración |
| 8 CFR § 292.1 | Quién está autorizado para representar en materia de inmigración |
| INA (Immigration and Nationality Act) | Ley federal de inmigración |
| Leyes estatales anti-UPIL | Protecciones contra práctica no autorizada en estados individuales |

> **Nota**: Este disclaimer está diseñado para ser robusto, pero no reemplaza una revisión legal profesional. Si planea distribuir la aplicación a gran escala, consulte con un abogado en su jurisdicción.

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre cómo contribuir al proyecto.

## Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## Autor

**Gustavo Valbuena**  
Fundador de PeopleBot AI  
[LinkedIn](https://www.linkedin.com) · [PeopleBot](https://peoplebot.com)

---

*Hecho con el propósito de ayudar a la comunidad hispanohablante en su camino a la ciudadanía americana.*
