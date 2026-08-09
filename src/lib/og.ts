// Renders on-brand Open Graph images (1200x630) at build time with satori + resvg-wasm.
// Both run in pure JS/WASM, so no native binaries (sharp, cairo, …) are required.
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_TITLE } from '@/consts';

// Resolved from the working directory (always the project root when Astro
// runs) rather than import.meta.url - the latter points into a bundled
// dist/.prerender chunk at build time, which breaks relative lookups.
const root = process.cwd();
const wasmPath = join(root, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  wasmReady ??= initWasm(readFileSync(wasmPath)).catch((err: unknown) => {
    // resvg-wasm's WASM instance is a module-level singleton that survives
    // Vite HMR reloads in `astro dev`, even though our local `wasmReady`
    // cache gets reset on every reload - so a second init attempt throws
    // even though the runtime is already usable. Only this specific error
    // is safe to swallow.
    if (err instanceof Error && err.message.includes('Already initialized')) return;
    throw err;
  });
  return wasmReady;
}

function loadFont(pkg: string, file: string) {
  return readFileSync(join(root, `node_modules/@fontsource/${pkg}/files/${file}`));
}

// Google Fonts (and fontsource) ship Latin diacritics (ą, ć, ę, ł, ń, ó, ś, ź,
// ż - all of Polish) in the separate "latin-ext" subset, not "latin". In the
// browser that's invisible: the bundled CSS lists both @font-face rules with
// unicode-range and the browser picks per-glyph automatically. Satori has no
// unicode-range concept and - unlike a browser - does NOT fall back to a
// same-name font of the same weight for a missing glyph. It does, however,
// resolve a comma-separated `fontFamily` list the way CSS does, so each
// weight is registered under two distinct family names ("X" / "X Ext") and
// every style below sets `fontFamily: 'X, X Ext'`.
function loadSubsets(pkg: string, weight: number) {
  return {
    base: loadFont(pkg, `${pkg}-latin-${weight}-normal.woff`),
    ext: loadFont(pkg, `${pkg}-latin-ext-${weight}-normal.woff`),
  };
}

const displayBlack = loadSubsets('big-shoulders-display', 900);
const mono = loadSubsets('ibm-plex-mono', 500);

const DISPLAY_STACK = 'BSDisplay, BSDisplayExt';
const MONO_STACK = 'PlexMono, PlexMonoExt';

const PAPER = '#E7E9E2';
const INK = '#1B2A3A';
const SIGNAL = '#D6491F';
const GRID = '#7C8B93';

interface OgOptions {
  title: string;
  /** Small mono label top-left - category name or the site brand. */
  eyebrow?: string;
  /** Shown bottom-left, small mono caps - tags or a fallback domain string. */
  meta?: string[];
}

export async function generateOgImage({ title, eyebrow = SITE_TITLE.toUpperCase(), meta = [] }: OgOptions) {
  await ensureWasm();

  const titleSize = title.length > 70 ? 52 : title.length > 40 ? 64 : 80;

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
          backgroundImage: `linear-gradient(${GRID}22 1px, transparent 1px), linear-gradient(90deg, ${GRID}22 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          padding: '76px',
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
                      fontFamily: MONO_STACK,
                      fontSize: 24,
                      letterSpacing: 5,
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
                fontFamily: DISPLAY_STACK,
                fontWeight: 900,
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
                      fontFamily: MONO_STACK,
                      fontSize: 22,
                      color: '#1B2A3A99',
                      textTransform: 'uppercase',
                    },
                    children:
                      meta.length > 0
                        ? meta.slice(0, 4).map((item) => ({
                            type: 'div',
                            props: { style: { display: 'flex' }, children: `#${item}` },
                          }))
                        : [{ type: 'div', props: { style: { display: 'flex' }, children: 'raisly.pl' } }],
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
        { name: 'BSDisplay', data: displayBlack.base, weight: 900, style: 'normal' },
        { name: 'BSDisplayExt', data: displayBlack.ext, weight: 900, style: 'normal' },
        { name: 'PlexMono', data: mono.base, weight: 500, style: 'normal' },
        { name: 'PlexMonoExt', data: mono.ext, weight: 500, style: 'normal' },
      ],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
