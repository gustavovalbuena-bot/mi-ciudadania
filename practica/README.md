# Mi Ciudadanía Estudio

App de práctica diaria para el examen cívico de naturalización (banco 2025, 128 preguntas). Lecciones de cinco minutos, racha diaria, XP y un camino por unidades, con Luz, la colibrí, como guía.

La app corre en la web en `/practica/` y está lista para empaquetarse en iOS y Android con Capacitor.

## Arquitectura

```
practica/
  www/                    lo que se publica (web) y lo que Capacitor mete en la app
    index.html            shell
    app.js                pantallas, lógica de lecciones, estado
    app.css               estilos (claro/oscuro, safe areas, movimiento reducido)
    data.js               128 preguntas, 9 grupos de memoria, 12 gráficos
    mascot.js             Luz en SVG (idle, happy, sad, cheer)
    platform.js           única capa que cambia entre web y nativo
    sw.js, manifest       PWA: instalable y sin conexión
    icons/                192, 512, maskable, apple-touch, 1024 (tiendas)
  capacitor.config.json
  package.json
```

No hay compilación. Son módulos ES que el navegador y el WebView cargan tal cual.

`platform.js` decide en tiempo de ejecución:

| Función | En la app (Capacitor) | En la web |
|---|---|---|
| Voz en inglés | `@capacitor-community/text-to-speech` | `speechSynthesis` |
| Vibración | `@capacitor/haptics` | `navigator.vibrate` |
| Recordatorio diario | `@capacitor/local-notifications` | no se muestra |
| Botón atrás de Android | `@capacitor/app` | no aplica |
| Responder hablando | `@capacitor-community/speech-recognition` | `SpeechRecognition` (Chrome, Safari) |
| Sin conexión | archivos dentro del paquete | `sw.js` |

El progreso se guarda en `localStorage` con la clave `mc-estudio.v1`. El único servidor es el del registro con código (ver abajo).

## Lógica de aprendizaje

- 9 unidades, en orden de dificultad: lugares, presidente, números, personas, fechas, enmiendas, listas, el porqué y las que cambian.
- Cada lección enseña 3 preguntas nuevas: tarjeta con respuesta, truco de memoria y gráfico; luego opción múltiple en español y práctica en inglés: escuchar, elegir, completar el espacio, armar la respuesta, responder en voz alta y unir parejas. Cierra con 2 preguntas débiles de lecciones anteriores.
- Las opciones incorrectas son de la misma categoría (`www/distractors.js`): si la respuesta es un estado, las demás también son estados. Las preguntas que piden varias respuestas ("nombre cinco") se contestan eligiendo 5 de 10.
- Puntos: granitos de café por cada acierto, con niveles de cosecha. Racha: el cafecito diario, con un día de descanso por semana.
- Si falla una, vuelve al final de la lección una vez.
- Unidad "Cambian": no se califica. Lleva al sitio oficial y guarda la respuesta del usuario.
- Examen de práctica: 20 preguntas, aprueba con 12, termina al llegar a 12 o al fallar 9. Modo 65/20: 10 preguntas marcadas en español, aprueba con 6.

## Desarrollo local

```bash
npm run dev
```

Abra http://localhost:5180.

## Publicar en las tiendas

Requisitos: Mac con Xcode (iOS), Android Studio (Android), cuenta Apple Developer (99 USD al año) y Google Play Console (25 USD, pago único).

```bash
npm install
npx cap add ios
npx cap add android
npm run ios        # abre Xcode
npm run android    # abre Android Studio
```

Antes de enviar:

1. Cambie `appId` en `capacitor.config.json` si el dominio de la empresa es otro. No se puede cambiar después de publicar.
2. Genere íconos y pantallas de inicio desde `www/icons/icon-1024.png` (por ejemplo con `@capacitor/assets`).
3. Agregue los permisos de micrófono. iOS (`Info.plist`): `NSMicrophoneUsageDescription` y `NSSpeechRecognitionUsageDescription`, por ejemplo "Para escuchar sus respuestas en inglés". Android: `RECORD_AUDIO` en `AndroidManifest.xml`.
4. Pruebe en un dispositivo real la voz, la vibración, el botón atrás y el recordatorio. Los plugins se usan vía `window.Capacitor.Plugins`.
5. Escriba la política de privacidad: la app pide correo y teléfono para la cuenta; el progreso queda en el dispositivo; el reconocimiento de voz lo hace el sistema operativo o el navegador.
6. En la ficha de la tienda, diga que no es una app del gobierno ni de USCIS. Apple y Google rechazan apps que lo sugieran.

Después de cada cambio en `www/`, ejecute `npx cap sync` y suba `VERSION` en `www/sw.js`.

## Registro con código por correo

Antes de la ruta, la app pide correo y teléfono, muestra el aviso legal con casilla obligatoria y envía un código de 6 números al correo. Sin el código no se entra.

- `api/registro/enviar.js` crea el código, lo envía con [Resend](https://resend.com) y devuelve un token firmado (el código no se guarda en ningún servidor).
- `api/registro/verificar.js` comprueba el código (vence en 10 minutos) y devuelve la sesión.
- Variables en Vercel → Settings → Environment Variables:
  - `OTP_SECRET`: cadena aleatoria larga (`openssl rand -base64 48`).
  - `RESEND_API_KEY`: clave de Resend.
  - `EMAIL_FROM`: remitente de un dominio verificado en Resend, p. ej. `Mi Ciudadanía <codigo@sudominio.com>`.
  - `REGISTRO_WEBHOOK_URL` (opcional): recibe `{email, telefono, fecha}` de cada registro, por ejemplo una hoja de Google o Zapier.
- Sin `OTP_SECRET`, `RESEND_API_KEY` y `EMAIL_FROM` el registro responde "todavía no está configurado" y nadie puede entrar.
- Límite conocido: sin base de datos no hay tope de intentos por código. Para producción con mucho tráfico, agregue un límite (Upstash o Vercel KV).
- El progreso sigue guardándose en el dispositivo; la cuenta no lo sincroniza todavía.
