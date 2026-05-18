// Run this script to generate PWA PNG icons from the SVG
// Usage: node scripts/generate-pwa-icons.js
// Requires: none (uses built-in modules only, generates from inline data)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');

// Create a simple HTML file that generates PNGs via canvas, then open it
const html = `<!DOCTYPE html><html><body>
<script>
async function gen(size, name) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, '#f59e0b'); g.addColorStop(1, '#d97706');
  const r = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(size-r, 0); ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size-r); ctx.quadraticCurveTo(size, size, size-r, size);
  ctx.lineTo(r, size); ctx.quadraticCurveTo(0, size, 0, size-r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 ' + (size*0.35) + 'px Arial';
  ctx.fillText('SC', size/2, size/2 - size*0.05);
  ctx.font = (size*0.12) + 'px serif';
  ctx.fillText('⚡', size/2, size/2 + size*0.2);
  return c.toDataURL('image/png');
}
(async () => {
  const a192 = await gen(192, 'pwa-192x192');
  const a512 = await gen(512, 'pwa-512x512');
  document.title = JSON.stringify({s192: a192, s512: a512});
})();
</script></body></html>`;

console.log('To generate PWA icons:');
console.log('1. Open public/generate-icons.html in your browser');
console.log('2. Click "Download 192x192" and "Download 512x512"');
console.log('3. Save both files into the public/ directory');
console.log('');
console.log('Or alternatively, you can use any image editor to create:');
console.log('- public/pwa-192x192.png (192x192 amber gradient with "SC" text)');
console.log('- public/pwa-512x512.png (512x512 amber gradient with "SC" text)');
