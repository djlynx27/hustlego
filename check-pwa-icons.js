#!/usr/bin/env node
// Script de vérification d'intégrité des images PWA
// Place ce fichier dans le dossier racine et exécute : node check-pwa-icons.js

import fs from 'node:fs';
import path from 'node:path';

const icons = [
  { name: 'pwa-icon-192.png', minSize: 192 },
  { name: 'pwa-icon-512.png', minSize: 512 },
];

let allOk = true;

for (const icon of icons) {
  const filePath = path.join(process.cwd(), 'public', icon.name);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier manquant : ${icon.name}`);
    allOk = false;
    continue;
  }
  const data = fs.readFileSync(filePath);
  // Vérifie l'en-tête PNG
  const isPng = data.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (!isPng) {
    console.error(`❌ ${icon.name} n'est pas un PNG valide !`);
    allOk = false;
    continue;
  }
  // Vérifie la taille de l'image (largeur/hauteur)
  // Largeur/hauteur sont aux offsets 16-23 (4 octets chacun, big-endian)
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width < icon.minSize || height < icon.minSize) {
    console.error(
      `❌ ${icon.name} trop petite : ${width}x${height} (min ${icon.minSize}x${icon.minSize})`
    );
    allOk = false;
    continue;
  }
  console.log(`✅ ${icon.name} : PNG valide, ${width}x${height}`);
}

if (allOk) {
  console.log('Toutes les icônes PWA sont valides !');
  process.exit(0);
} else {
  console.error('Erreur : au moins une icône PWA est invalide ou manquante.');
  process.exit(1);
}
