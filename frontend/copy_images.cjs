const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\a9f3f3b0-dd84-4444-a2a1-21ffb6007e83';
const destDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.png')) {
    // Simplify names
    let targetName = file;
    if (file.startsWith('hero_illustration')) targetName = 'hero.png';
    if (file.startsWith('plumbing_service')) targetName = 'plumbing.png';
    if (file.startsWith('electrician_service')) targetName = 'electrician.png';
    
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, targetName));
    console.log(`Copied ${file} to ${targetName}`);
  }
});
