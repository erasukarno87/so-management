import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure dist-server directory exists
const distServerDir = path.join(__dirname, '..', 'dist-server');
if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
}

// Copy db/index.js with ESM to CJS conversion
const dbContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'server', 'db', 'index.js'), 'utf-8');
const convertedDb = dbContent
  .replace(/import\s+.*from\s+['"]([^'"]+)['"]/g, (match, p1) => {
    if (p1.startsWith('.')) {
      return match;
    }
    return match;
  });

fs.writeFileSync(path.join(distServerDir, 'db.js'), convertedDb);

// Build server with esbuild
esbuild.build({
  entryPoints: [path.join(__dirname, '..', 'src', 'server', 'index.js')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: path.join(distServerDir, 'index.js'),
  format: 'esm',
  external: ['better-sqlite3'],
  sourcemap: true,
  minify: false,
}).then(() => {
  console.log('Server build completed successfully!');
}).catch((error) => {
  console.error('Server build failed:', error);
  process.exit(1);
});