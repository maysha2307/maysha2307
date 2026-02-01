const fs = require('fs');
const path = require('path');

const animDir = path.join(__dirname, 'src', 'assets', 'animations');
const files = ['Book.json', 'Love.json', 'LoveLine.json', 'pencil.json'];

files.forEach(file => {
  const filePath = path.join(animDir, file);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    try {
      const minified = JSON.stringify(JSON.parse(raw));
      fs.writeFileSync(filePath, minified, 'utf8');
      console.log(`Minified: ${file}`);
    } catch (e) {
      console.error(`Error minifying ${file}:`, e.message);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});
