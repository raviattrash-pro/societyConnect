const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\eef62e9e-4782-415f-b90f-f30ee7150689';
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
