const fs = require('fs');
const path = require('path');

const directory = 'C:\\Users\\Melih\\Documents\\Projects\\mindhouse';

const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'terminals'];
const ignoreExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac', '.woff', '.woff2', '.ttf', '.eot', '.otf'];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        processDirectory(fullPath);
      }
    } else {
      if (!ignoreExtensions.includes(path.extname(file))) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace Mindhouse, Mindhouse, Mindhouse with Mindhouse
    content = content.replace(/Mindhouse/g, 'Mindhouse');
    content = content.replace(/Mindhouse/g, 'Mindhouse');
    content = content.replace(/Mindhouse/g, 'Mindhouse');
    
    // For lower case mindhouse, we should be careful. 
    // Let's replace 'mindhouse' with 'mindhouse' in texts
    content = content.replace(/mindhouse/g, 'mindhouse');
    
    // For upper case MINDHOUSE
    content = content.replace(/MINDHOUSE/g, 'MINDHOUSE');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (e) {
    console.error(`Failed to process ${filePath}: ${e.message}`);
  }
}

processDirectory(directory);
console.log('Done');
