const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ASSETS = ['questions.js', 'app.js', 'styles.css'];
const INDEX = 'index.html';

function shortHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(content).digest('hex').slice(0, 8);
}

function updateIndex(hashes) {
  let index = fs.readFileSync(INDEX, 'utf8');

  ASSETS.forEach(file => {
    const h = hashes[file] || '';
    const re = new RegExp(file.replace(/\./g, '\\.') + "(\\?v=)[0-9a-fA-F]*", 'g');
    if (index.match(re)) {
      index = index.replace(re, `${file}?v=${h}`);
    } else {
      // also handle plain references without ?v=
      const re2 = new RegExp(file.replace(/\./g, '\\.'), 'g');
      index = index.replace(re2, `${file}?v=${h}`);
    }
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

  updateIndex(hashes);
  console.log('Updated', INDEX, 'with hashes:', hashes);
}

main();
