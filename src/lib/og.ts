// Renders on-brand Open Graph images (1200x630) at build time with satori + resvg-wasm.
// Both run in pure JS/WASM, so no native binaries (sharp, cairo, …) are required.
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Resolved from the working directory (always the project root when Astro
// runs) rather than import.meta.url — the latter points into a bundled
// dist/.prerender chunk at build time, which breaks relative lookups.
const root = process.cwd();
const wasmPath = join(root, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  wasmReady ??= initWasm(readFileSync(wasmPath));
  return wasmReady;
}

function loadFont(pkg: string, file: string) {
  return readFileSync(join(root, `node_modules/@fontsource/${pkg}/files/${file}`));
}

const fonts = {
  displayBlack: loadFont('big-shoulders-display', 'big-shoulders-display-latin-800-normal.woff'),
  body: loadFont('inter', 'inter-latin-400-normal.woff'),
  bodyBold: loadFont('inter', 'inter-latin-700-normal.woff'),
  mono: loadFont('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
};

const PAPER = '#E7E9E2';
const INK = '#1B2A3A';
const SIGNAL = '#D6491F';

interface OgOptions {
  title: string;
  eyebrow?: string;
  tags?: string[];
}

export async function generateOgImage({ title, eyebrow = 'MERIDIAN', tags = [] }: OgOptions) {
  await ensureWasm();

  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 84;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '76px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '18px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: 30,
                      height: 30,
                      background: INK,
                      display: 'flex',
                      position: 'relative',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'IBM Plex Mono',
                      fontSize: 26,
                      letterSpacing: 6,
                      color: SIGNAL,
                      textTransform: 'uppercase',
                      display: 'flex',
                    },
                    children: eyebrow,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Big Shoulders Display',
                fontWeight: 800,
                fontSize: titleSize,
                lineHeight: 1.02,
                textTransform: 'uppercase',
                color: INK,
                display: 'flex',
                maxWidth: '95%',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '22px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { height: 2, background: '#1B2A3A26', display: 'flex', width: '100%' },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '16px',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: 22,
                      color: '#1B2A3A99',
                      textTransform: 'uppercase',
                    },
                    children:
                      tags.length > 0
                        ? tags.slice(0, 4).map((tag) => ({
                            type: 'div',
                            props: { style: { display: 'flex' }, children: `#${tag}` },
                          }))
                        : [{ type: 'div', props: { style: { display: 'flex' }, children: 'blog.example.com' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Big Shoulders Display', data: fonts.displayBlack, weight: 800, style: 'normal' },
        { name: 'Inter', data: fonts.body, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bodyBold, weight: 700, style: 'normal' },
        { name: 'IBM Plex Mono', data: fonts.mono, weight: 500, style: 'normal' },
      ],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
