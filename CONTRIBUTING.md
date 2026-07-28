# Contribuir a Mi Ciudadanía

Gracias por tu interés en contribuir a **Mi Ciudadanía**. Este proyecto tiene como objetivo ayudar a la comunidad hispanohablante en su proceso de naturalización a ciudadano estadounidense.

## Principios del Proyecto

1. **Solo fuentes oficiales**: Toda la información debe provenir exclusivamente de USCIS (uscis.gov). No se acepta información inventada, supuesta, o de fuentes no oficiales.
2. **Bilingüe**: Toda pregunta, respuesta, e instrucción debe estar disponible en inglés y español.
3. **Accesible**: La aplicación debe funcionar correctamente en dispositivos móviles y de escritorio.
4. **Sin asesoría legal**: La aplicación es informativa. Nunca debe posicionarse como sustituto de asesoría legal profesional.

## Cómo Contribuir

### Reportar un Error

1. Verifica que el error no haya sido reportado previamente en [Issues](../../issues).
2. Crea un nuevo issue con:
   - Descripción clara del error
   - Pasos para reproducirlo
   - Comportamiento esperado vs. actual
   - Capturas de pantalla (si aplica)
   - Dispositivo y navegador

### Sugerir una Mejora

1. Abre un issue con la etiqueta `enhancement`
2. Describe la mejora propuesta y su beneficio para el usuario
3. Si es posible, incluye mockups o ejemplos visuales

### Contribuir Código

1. Haz fork del repositorio
2. Crea una rama para tu cambio: `git checkout -b feature/mi-mejora`
3. Realiza tus cambios siguiendo las guías de estilo
4. Verifica que la aplicación funcione correctamente
5. Haz commit con un mensaje descriptivo: `git commit -m "Agrega funcionalidad X"`
6. Push a tu fork: `git push origin feature/mi-mejora`
7. Abre un Pull Request

### Actualizar Preguntas del Examen

Si USCIS actualiza las preguntas o respuestas del examen cívico:

1. Verifica la fuente oficial en [uscis.gov/citizenship/testupdates](https://www.uscis.gov/citizenship/testupdates)
2. Actualiza el array `CIVICS_QUESTIONS` en `citizenship-app.jsx`
3. Incluye enlace a la fuente oficial en tu Pull Request
4. Actualiza `CHANGELOG.md`

### Modificar el Disclaimer Legal

El disclaimer legal es un componente crítico del proyecto. Cualquier modificación debe:

1. Mantener o reforzar las protecciones existentes — nunca reducirlas
2. Mantener la paridad completa entre la versión en español y la versión en inglés
3. Preservar las referencias a regulaciones federales (8 CFR § 1.2, 8 CFR § 292.1, INA)
4. No eliminar cláusulas existentes sin una justificación legal documentada
5. Ser revisada idealmente por un profesional legal antes de fusionarse
6. Documentar el cambio en `CHANGELOG.md` y `docs/SOURCES.md` si se agregan nuevas fuentes

## Guía de Estilo

### Diseño

Lea [docs/DESIGN.md](docs/DESIGN.md) antes de tocar cualquier interfaz. Reglas que no se negocian:

1. Sin emojis. Iconos de Lucide o los emblemas SVG propios
2. Los tokens de color y tipografía viven en `T` y `PATHS` en un solo lugar. No introduzca hex sueltos
3. Cada camino conserva su acento. No los intercambie ni añada un quinto sin justificarlo
4. Todo control accionable necesita `cursor: pointer`, estado hover y foco de teclado visible
5. Respete `prefers-reduced-motion` en cualquier animación nueva
6. Contraste mínimo de 4.5:1. El color nunca es el único portador de significado
7. Pruebe a 375, 768, 1024 y 1440px antes de abrir el Pull Request

### Código
- React functional components con hooks
- Inline styles (CSS-in-JS) para consistencia con la arquitectura existente
- Lucide React para iconografía (no emojis)
- Nombres de variables y funciones en inglés
- Contenido de interfaz de usuario en español (con inglés donde sea necesario para el examen)

### Diseño
- Seguir la estética Apple: limpio, minimalista, espacioso
- Colores del sistema: azul `#0071E3`, verde `#34C759`, naranja `#FF9500`, rojo `#FF3B30`
- Border radius: 12-24px según contexto
- Tipografía: system fonts (SF Pro Display, Helvetica Neue)

## Código de Conducta

- Sé respetuoso y constructivo
- Este proyecto ayuda a personas en un proceso legal importante; trata la información con seriedad
- No se tolerará discriminación de ningún tipo

## Preguntas

Si tienes preguntas sobre cómo contribuir, abre un issue con la etiqueta `question`.

---

Gracias por ayudar a hacer esta herramienta mejor para la comunidad.
