// Luz, la colibrí. Personaje guía de la app.
// Estados: idle (atenta), happy (celebra), sad (anima tras un error), cheer (alas arriba).
const EYES = {
  idle: `<circle cx="74" cy="42" r="8.6" fill="#fff"/><circle cx="76" cy="42.6" r="4.9" fill="#1A1B2E"/><circle cx="77.9" cy="40.6" r="1.8" fill="#fff"/>`,
  happy: `<path d="M66.5 44.5 Q74 34.5 81.5 44.5" stroke="#1A1B2E" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
  sad: `<circle cx="74" cy="43" r="8.6" fill="#fff"/><circle cx="75.4" cy="45.4" r="4.7" fill="#1A1B2E"/><circle cx="77" cy="43.6" r="1.6" fill="#fff"/><path d="M65.5 33.5 Q73 31 82 34.5" stroke="#1A1B2E" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
};
EYES.cheer = EYES.happy;

export function luz(mood = 'idle', size = 120, label = 'Luz, la colibrí') {
  const eyes = EYES[mood] || EYES.idle;
  return `<svg class="luz luz-${mood}" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${label}">
  <g class="luz-body">
    <path d="M40 80 L15 101 L29 98 L23 112 L45 92 Z" fill="#167A5A"/>
    <ellipse cx="52" cy="74" rx="22" ry="27" transform="rotate(-28 52 74)" fill="#1F9D74"/>
    <ellipse cx="58.5" cy="80.5" rx="12.5" ry="17" transform="rotate(-28 58.5 80.5)" fill="#D4F3E2"/>
    <circle cx="68" cy="46" r="21" fill="#1F9D74"/>
    <path d="M60 27 C57 17 66 13 67.5 24 Z" fill="#167A5A"/>
    <path d="M57 59 C62 66 74 67 81 60 C79 68 71 72 64 71 C60 70 57 66 57 59 Z" fill="#E2B53B"/>
    <path d="M86.5 43 L117 37.5 L86.5 50 Z" fill="#26283A"/>
    ${eyes}
    <ellipse cx="62.5" cy="54.5" rx="4.3" ry="2.6" fill="#FF8FA8" opacity=".75"/>
    <path class="luz-wing" d="M50 60 C30 33 15 40 19.5 54.5 C23.5 65 38 68.5 52 67 Z" fill="#46C99D"/>
  </g>
</svg>`;
}
