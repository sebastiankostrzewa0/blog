// One-off helper: rasterizes public/favicon.svg into every icon file
// referenced by src/layouts/BaseLayout.astro and public/site.webmanifest.
// Re-run with `node scripts/gen-icons.mjs` whenever favicon.svg changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = fileURLToPath(new URL('..', import.meta.url));
const wasmPath = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'));
await initWasm(readFileSync(wasmPath));

const svg = readFileSync(`${root}/public/favicon.svg`, 'utf-8');

function renderPng(size) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

const sizes = {
  'apple-touch-icon.png': 180,
  'favicon-192x192.png': 192,
  'favicon-512x512.png': 512,
};

const pngs = {};
for (const [name, size] of Object.entries(sizes)) {
  pngs[name] = renderPng(size);
  writeFileSync(`${root}/public/${name}`, pngs[name]);
  console.log(`wrote public/${name}`);
}

// favicon.ico: modern browsers/OSes accept a PNG-compressed image inside the
// classic ICO container, so no BMP/DIB re-encoding is needed — this avoids
// pulling in an image-processing dependency just to wrap one small icon.
function buildIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256px)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // image data size
  entry.writeUInt32LE(header.length + entry.length, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

const icoPng = renderPng(48);
writeFileSync(`${root}/public/favicon.ico`, buildIco(Buffer.from(icoPng), 48));
console.log('wrote public/favicon.ico');
