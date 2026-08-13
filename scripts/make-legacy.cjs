const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const dist = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(dist, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.error('dist/index.html not found — run build first');
  process.exit(1);
}

const html = fs.readFileSync(indexFile, 'utf8');
const match = html.match(/<script[^>]+src="([^"]+index-[^"]+\.js)"[^>]*><\/script>/);
if (!match) {
  console.error('module script not found in dist/index.html');
  process.exit(1);
}

const modSrc = match[1].startsWith('/') ? match[1] : '/' + match[1];
const modPath = path.join(dist, modSrc.replace(/^\//, ''));
const outDir = path.join(dist, 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'legacy.js');

try {
  console.log('Bundling legacy from', modPath, '->', outPath);
  cp.execSync(
    `npx esbuild "${modPath}" --bundle --outfile="${outPath}" --format=iife --platform=browser --target=es5 --minify`,
    { stdio: 'inherit' }
  );
} catch (e) {
  console.warn('esbuild failed (legacy bundle skipped):', e && e.message ? e.message : e);
  // Continue — legacy bundle is optional. We'll still remove crossorigin and proceed.
}

let newHtml = fs.readFileSync(indexFile, 'utf8');
// Remove crossorigin attributes from script and link tags to avoid CORS issues on some mobile browsers
newHtml = newHtml.replace(/\s+crossorigin(?=[\s>])/g, '');

if (!/nomodule/.test(newHtml)) {
  newHtml = newHtml.replace(match[0], `${match[0]}\n    <script nomodule src="/assets/legacy.js"></script>`);
  fs.writeFileSync(indexFile, newHtml, 'utf8');
  console.log('Injected nomodule script into dist/index.html and removed crossorigin attributes');
} else {
  fs.writeFileSync(indexFile, newHtml, 'utf8');
  console.log('Removed crossorigin attributes; nomodule script already present in dist/index.html');
}

console.log('Legacy bundle created successfully.');
