// Generate PWA icons as simple colored PNGs using Canvas
// Run: node generate-icons.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#f59e0b');
  gradient.addColorStop(1, '#d97706');
  ctx.fillStyle = gradient;
  
  // Rounded rect background
  const r = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Lightning bolt emoji / text
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.35}px sans-serif`;
  ctx.fillText('SC', size / 2, size / 2 - size * 0.05);
  
  ctx.font = `${size * 0.12}px sans-serif`;
  ctx.fillText('⚡', size / 2, size / 2 + size * 0.2);

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath}`);
}

generateIcon(192, 'pwa-192x192.png');
generateIcon(512, 'pwa-512x512.png');
generateIcon(180, 'apple-touch-icon.png');
console.log('Done!');
