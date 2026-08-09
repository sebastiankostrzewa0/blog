// One-off helper: rasterizes public/favicon.svg into every icon file
// referenced by src/layouts/BaseLayout.astro and public/site.webmanifest.
// Re-run with `node scripts/gen-icons.mjs` whenever favicon.svg changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = fileURLToPath(new URL('..', import.meta.url));
const wasmPath = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'));
await initWasm(readFileSync(wasmPath));

const svg = readFileSync(`${root}/public/favicon.svg`, 'utf-8');

// resvg-wasm's bundled fontdb can't decompress WOFF (it only understands raw
// sfnt tables), so the @fontsource .woff file that's embedded as a base64
// @font-face in favicon.svg (for browsers, which do support WOFF natively)
// has to be unpacked into a plain TTF here before handing it to Resvg -
// otherwise the "SK" text silently rasterizes as nothing.
function woffToTtf(woff) {
  if (woff.toString('ascii', 0, 4) !== 'wOFF') throw new Error('Not a WOFF1 file');
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);

  const entries = [];
  let pos = 44;
  for (let i = 0; i < numTables; i++) {
    const tag = woff.toString('ascii', pos, pos + 4);
    const offset = woff.readUInt32BE(pos + 4);
    const compLength = woff.readUInt32BE(pos + 8);
    const origLength = woff.readUInt32BE(pos + 12);
    entries.push({ tag, offset, compLength, origLength });
    pos += 20;
  }

  for (const e of entries) {
    const raw = woff.subarray(e.offset, e.offset + e.compLength);
    e.data = e.compLength < e.origLength ? inflateSync(raw) : Buffer.from(raw);
  }

  let entrySelector = 0;
  while (2 ** (entrySelector + 1) <= numTables) entrySelector++;
  const searchRange = 2 ** entrySelector * 16;
  const rangeShift = numTables * 16 - searchRange;

  const headerSize = 12 + numTables * 16;
  let cursor = headerSize;
  const offsets = entries.map((e) => {
    const start = cursor;
    cursor += Math.ceil(e.data.length / 4) * 4;
    return start;
  });

  const out = Buffer.alloc(cursor);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(rangeShift, 10);

  // Table directory must be sorted ascending by tag.
  const order = entries.map((_, i) => i).sort((a, b) => (entries[a].tag < entries[b].tag ? -1 : 1));

  let dirPos = 12;
  for (const i of order) {
    const e = entries[i];
    const offset = offsets[i];
    e.data.copy(out, offset);

    const padded = Math.ceil(e.data.length / 4) * 4;
    const paddedBuf = Buffer.alloc(padded);
    e.data.copy(paddedBuf);
    let checksum = 0;
    for (let j = 0; j < padded; j += 4) checksum = (checksum + paddedBuf.readUInt32BE(j)) >>> 0;

    out.write(e.tag, dirPos, 4, 'ascii');
    out.writeUInt32BE(checksum, dirPos + 4);
    out.writeUInt32BE(offset, dirPos + 8);
    out.writeUInt32BE(e.data.length, dirPos + 12);
    dirPos += 16;
  }

  return out;
}

const fontBuffer = woffToTtf(
  readFileSync(`${root}/node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff`),
);

function renderPng(size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: {
      fontBuffers: [fontBuffer],
      defaultFontFamily: 'Big Shoulders Display',
      loadSystemFonts: false,
    },
  });
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
