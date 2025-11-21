const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ASSETS = ['questions.js', 'app.js', 'styles.css'];
const INDEX = 'index.html';

function shortHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(content).digest('hex').slice(0, 8);
}

function fingerprintAssets(hashes) {
  // Create fingerprinted copies like app.<hash>.js next to originals
  ASSETS.forEach(file => {
    const h = hashes[file];
    if (!h) return;
    const dir = path.dirname(file);
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const newName = `${base}.${h}${ext}`;
    const src = path.join(__dirname, '..', file);
    const dest = path.join(__dirname, '..', dir, newName);
    try {
      fs.copyFileSync(src, dest);
      console.log(`Wrote fingerprinted asset: ${dest}`);
      hashes[file] = newName; // replace value with filename for index replacement
    } catch (err) {
      console.error('Error writing fingerprint for', file, err.message);
    }
  });
}

function updateIndex(hashes) {
  let index = fs.readFileSync(INDEX, 'utf8');

  ASSETS.forEach(file => {
    const replacement = hashes[file];
    if (!replacement) return;

    // Replace occurrences of the filename, with or without existing ?v= or query strings
    const escaped = file.replace(/\./g, '\\\\.');
    const re = new RegExp(`${escaped}(?:\\?[^"'\\s>]*)?`, 'g');
    index = index.replace(re, replacement);
  });

  fs.writeFileSync(INDEX, index, 'utf8');
}

function main() {
  const hashes = {};
  ASSETS.forEach(file => {
    const p = path.join(__dirname, '..', file);
    if (fs.existsSync(p)) {
      hashes[file] = shortHash(p);
    } else {
      console.warn('Missing asset:', file);
      hashes[file] = '';
    }
  });

  fingerprintAssets(hashes);
  updateIndex(hashes);
  console.log('Fingerprinting complete. Updated', INDEX);
}

main();
