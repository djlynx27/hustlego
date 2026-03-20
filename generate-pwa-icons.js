// Génère deux PNG noirs (192x192 et 512x512) pour PWA
// Place ce fichier à la racine et exécute : node generate-pwa-icons.js
import { createCanvas } from 'canvas';
import fs from 'node:fs';

const icons = [
  { name: 'pwa-icon-192.png', size: 192 },
  { name: 'pwa-icon-512.png', size: 512 },
];

for (const icon of icons) {
  const canvas = createCanvas(icon.size, icon.size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, icon.size, icon.size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${icon.name}`, buffer);
  console.log(`✅ ${icon.name} généré (${icon.size}x${icon.size})`);
}
console.log('Icônes PWA générées dans le dossier public/');
