// One-off helper: rasterizes public/favicon.svg into the PNG icon sizes
// referenced by src/layouts/BaseLayout.astro. Re-run with `node scripts/gen-icons.mjs`
// whenever favicon.svg changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = fileURLToPath(new URL('..', import.meta.url));
const wasmPath = fileURLToPath(
  import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'),
);
await initWasm(readFileSync(wasmPath));

const svg = readFileSync(`${root}/public/favicon.svg`, 'utf-8');

for (const size of [180, 192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  writeFileSync(`${root}/public/${name}`, png);
  console.log(`wrote public/${name}`);
}
