// Generates every favicon/icon file from a single source of truth: the "SK"
// mark built here with satori. Re-run with `node scripts/gen-icons.mjs`
// whenever the mark's colors/weight should change.
//
// Why satori instead of a hand-written favicon.svg with `<text>` + an
// embedded @font-face: browsers render SVG favicons as a one-shot snapshot
// and don't reliably wait for an embedded webfont to finish loading before
// taking it, so the tab icon can render blank/solid even though the same
// SVG looks correct when opened as a normal document. Satori sidesteps this
// entirely by shaping the text into fixed vector `<path>` outlines at
// generation time — the output SVG has no text and no font dependency left,
// so it renders identically everywhere (browser tab, PNG rasterization,
// ICO).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = fileURLToPath(new URL('..', import.meta.url));
const wasmPath = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'));
await initWasm(readFileSync(wasmPath));

const fontBuffer = readFileSync(
  `${root}/node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff`,
);

const mark = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1B2A3A',
      borderRadius: 16,
      fontFamily: 'Big Shoulders Display',
      fontWeight: 900,
      fontSize: 54,
      color: '#E7E9E2',
      letterSpacing: -1,
    },
    children: 'SK',
  },
};

const svg = await satori(mark, {
  width: 100,
  height: 100,
  fonts: [{ name: 'Big Shoulders Display', data: fontBuffer, weight: 900, style: 'normal' }],
});

writeFileSync(`${root}/public/favicon.svg`, svg);
console.log('wrote public/favicon.svg');

function renderPng(size) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

const sizes = {
  'apple-touch-icon.png': 180,
  'favicon-192x192.png': 192,
  'favicon-512x512.png': 512,
};

for (const [name, size] of Object.entries(sizes)) {
  writeFileSync(`${root}/public/${name}`, renderPng(size));
  console.log(`wrote public/${name}`);
}

// favicon.ico: modern browsers/OSes accept a PNG-compressed image inside the
// classic ICO container, so no BMP/DIB re-encoding is needed - this avoids
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
