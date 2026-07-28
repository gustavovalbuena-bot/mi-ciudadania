# Sistema de Diseño — Mi Ciudadanía v2.0

Documentación del lenguaje visual. Léalo antes de modificar cualquier interfaz.

---

## Dirección

Institucional y editorial, en la tradición de los sitios de infraestructura y aeroespacio: fondo profundo, tipografía grande y disciplinada, fotografía sustituida por gráficos vectoriales originales, y secciones que se leen como capítulos.

La referencia estructural es **boeing.com**: héroe a sangre completa, etiquetas *eyebrow* en versalitas, titular editorial, subtítulo en gris, y rejillas de tarjetas donde cada categoría tiene su propio mundo visual (Commercial / Defense / Space). Aquí ese mismo sistema organiza los cuatro caminos del proceso de naturalización.

**Lo que evitamos deliberadamente:** crema cálido con serif de alto contraste, gradientes morado-rosa de producto de IA, sombras difusas de tarjeta genérica, y esquinas muy redondeadas. Ninguno comunica autoridad civil.

---

## Color

| Token | Hex | Uso |
| --- | --- | --- |
| `ink` | `#0B1220` | Superficie base oscura, héroes, pie de página |
| `ink2` | `#131D30` | Superficie oscura elevada (tarjetas sobre oscuro) |
| `paper` | `#F4F6F8` | Superficie de trabajo clara, frío y documental |
| `card` | `#FFFFFF` | Tarjetas y paneles sobre `paper` |
| `gold` | `#C8A24A` | El sello del certificado. Acento de marca, con mucha moderación |
| `muted` | `#5B6779` | Texto secundario |
| `faint` | `#8A94A6` | Texto terciario, iconos inactivos |
| `line` | `#E1E6EC` | Reglas y bordes en claro |

### Acento por camino

Cada camino es un mundo con su propio color. El acento aparece en el borde superior del héroe, la barra de progreso, los números de capítulo y los botones primarios de esa sección.

| Camino | Acento | Profundo | Suave |
| --- | --- | --- | --- |
| 01 Elegibilidad | `#2F6FE4` | `#1B4FB0` | `#E8F0FE` |
| 02 El Proceso | `#12776A` | `#0B554B` | `#E4F2EF` |
| 03 Estudio | `#B26B12` | `#8A5210` | `#FBF0E2` |
| 04 Simulación | `#A32F42` | `#7C2231` | `#FBEAED` |

Todos los pares texto/fondo cumplen contraste WCAG AA (4.5:1).

---

## Tipografía

| Rol | Familia | Pesos | Ajuste |
| --- | --- | --- | --- |
| Display | **Archivo** | 700, 800 | `letter-spacing: -0.035em`, `line-height: 0.98` |
| Cuerpo e interfaz | **Inter** | 400, 500, 600 | Por defecto |
| Eyebrow | Inter | 600 | 11px, versalitas, `letter-spacing: 0.18em` |
| Números | Archivo | 700 | `font-variant-numeric: tabular-nums` |

Archivo es un grotesco de señalética civil. Da peso institucional sin caer en el serif editorial que se ha vuelto el recurso por defecto. Inter mantiene la legibilidad máxima, que aquí no es negociable: el público es bilingüe, de alfabetización digital variable, y lo que está en juego es alto.

Escala de titulares: `clamp()` en todos los casos. Ejemplo del héroe principal: `clamp(44px, 8.6vw, 116px)`.

---

## Elemento firma

Dos piezas acopladas. Toda la audacia del diseño vive aquí; el resto se mantiene callado.

### 1. La transición de capítulo

Al elegir un camino desde el inicio, un panel a pantalla completa en el color profundo de ese camino sube desde abajo, muestra el emblema, el número de capítulo y el nombre, y luego se retira hacia arriba revelando la sección.

```
usuario elige  →  panel sube (580ms)  →  etiqueta (1160ms)  →  panel sale (580ms)
                  cubic-bezier(.76, 0, .24, 1)
```

Ciclo total: 1220 ms. El cambio de vista ocurre a los 620 ms, con el panel cubriendo la pantalla.

### 2. Los cuatro emblemas

Dibujos vectoriales originales construidos con los artefactos reales del proceso. No son iconos decorativos: cada uno codifica algo cierto.

| Emblema | Qué dibuja |
| --- | --- |
| Elegibilidad | Un escudo de franjas que se llenan progresivamente, con una marca de verificación |
| El Proceso | Una escalera de diez peldaños en perspectiva, con bandera en el último |
| Estudio | **128 marcas en rejilla de 16×8. Veinte aparecen delineadas (las que le preguntan). Doce están rellenas (las que debe acertar).** La aritmética del examen como ornamento |
| Simulación | Dos formas de diálogo enfrentadas, con tres puntos de pregunta entre ellas |

El emblema de Estudio es el que mejor resume la intención del sistema: la estructura decorativa lleva información verdadera.

---

## Movimiento

| Momento | Comportamiento | Duración |
| --- | --- | --- |
| Carga de héroe | Entrada escalonada de eyebrow, titular, subtítulo y botones | 850 ms, retraso de 90 ms entre elementos |
| Transición de capítulo | Barrido vertical con etiqueta | 1220 ms total |
| Revelado al desplazar | `IntersectionObserver`, opacidad y desplazamiento de 22px | 750 ms |
| Hover de tarjeta | Elevación de 6px, la flecha avanza 6px, el emblema aumenta opacidad | 320 ms |
| Barras de progreso | Ancho animado | 500–600 ms |
| Campo del héroe | Deriva ambiental de las estrellas, parpadeo desfasado | 34 s en bucle |

`prefers-reduced-motion: reduce` anula todo lo anterior. Las animaciones se reducen a 0.01 ms y los elementos con revelado quedan visibles de entrada.

---

## Estructura

```
DisclaimerGate      Documento legal editorial, oscuro, ES/EN, 13 cláusulas numeradas
   ↓ aceptar
Landing             Héroe a pantalla completa (bandera como dato)
                    → Los cuatro caminos (rejilla de capítulos)
                    → El examen en números (128 / 20 / 12 / 20)
                    → Fuentes oficiales
                    → Cierre con llamada a la acción
   ↓ elegir camino → ChapterWipe
PathHero            Banda oscura teñida con el acento del camino
                    Número de capítulo, título, lede, emblema
Superficie          Interfaz de trabajo sobre `paper`
Footer              Créditos y los cuatro caminos
```

### El héroe

Un campo generativo: cincuenta estrellas en rejilla de nueve filas alternas (6-5-6-5…) que parpadean con retrasos desfasados, atravesado por trece franjas diagonales con degradado azul a dorado. La bandera descompuesta en sus datos. Es el objeto más característico del mundo del tema, que es lo que un héroe debe abrir.

---

## Puntos de quiebre

| Ancho | Comportamiento |
| --- | --- |
| ≥ 1025px | Rejilla de capítulos a 4 columnas, navegación completa, emblema visible en el héroe de cada camino |
| 769–1024px | Rejilla de capítulos a 2 columnas |
| ≤ 768px | Todo a una columna, menú hamburguesa, se ocultan emblemas de cabecera, márgenes de 20px |

Probado a 375, 768, 1024 y 1440px.

---

## Lista de verificación antes de publicar

- [ ] Sin emojis. Solo SVG (Lucide o los emblemas propios)
- [ ] `cursor: pointer` en todo elemento accionable
- [ ] Estados hover con transición de 150–320 ms
- [ ] Contraste de texto mínimo 4.5:1
- [ ] Foco de teclado visible (contorno dorado, desplazamiento de 3px)
- [ ] `prefers-reduced-motion` respetado
- [ ] Responsivo a 375, 768, 1024 y 1440px
- [ ] Los números del examen coinciden con uscis.gov
- [ ] Ningún color de acento sustituye al texto como único portador de significado

---

*Mantenido por Gustavo Valbuena — Fundador de PeopleBot AI*
