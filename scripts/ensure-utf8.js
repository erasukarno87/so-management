#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
      files.push(...walk(full));
    } else if (e.isFile() && exts.has(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

function hasReplacementChar(s) {
  return s.indexOf('\uFFFD') !== -1;
}

function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const files = walk(root + '/src');
  const bad = [];
  for (const f of files) {
    const buf = fs.readFileSync(f);
    const s = buf.toString('utf8');
    if (hasReplacementChar(s)) {
      bad.push(f);
    }
  }

  if (bad.length === 0) {
    console.log('All checked files appear to be valid UTF-8.');
    process.exit(0);
  }

  console.log('Files with invalid UTF-8 sequences:');
  bad.forEach(f => console.log(' -', path.relative(root, f)));

  if (!fix) {
    console.log('\nRun with --fix to convert these files from Windows-1252 (CP1252) to UTF-8 (will create .bak backups).');
    process.exit(2);
  }

  for (const f of bad) {
    const buf = fs.readFileSync(f);
    const decoded = iconv.decode(buf, 'win1252');
    const bak = f + '.bak';
    if (!fs.existsSync(bak)) fs.copyFileSync(f, bak);
    fs.writeFileSync(f, decoded, { encoding: 'utf8' });
    console.log('Converted:', path.relative(root, f));
  }

  console.log('Conversion complete. Please rebuild the client (`npm run build:client`).');
}

main();
