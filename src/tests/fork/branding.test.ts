import { describe, it, expect, beforeAll } from 'vitest';
// @ts-expect-error -- the app's TypeScript project has no @types/node (upstream's tests have the same error)
import { readFileSync, readdirSync } from 'node:fs';

/**
 * SipilFrame fork guard: the locale files are exactly upstream's, and "edubeam" in them is replaced by
 * scripts/viteBrandLocales.ts at build time. If upstream starts mentioning "edubeam" somewhere new,
 * this fails on purpose: decide whether that text gets branded (add the key) or is attribution (keep it).
 */
// Vitest runs from the project root, so project-relative paths are enough.
const localesDir = 'src/locales/';
const localeFiles = readdirSync(localesDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

// The fork's build plugin, loaded through Vite (it lives outside the app's TypeScript project).
interface Branding {
  default: () => { transform: (code: string, id: string) => { code: string } | null };
  BRANDED_KEYS: string[];
  BRAND_NAME: string;
  brandCompiledMessages: (code: string) => string;
}
const pluginModules = import.meta.glob('/scripts/viteBrandLocales.ts');
let branding: Branding;
beforeAll(async () => {
  branding = (await pluginModules['/scripts/viteBrandLocales.ts']()) as Branding;
});

const leaves = (node: unknown, path = ''): [string, string][] =>
  typeof node === 'string'
    ? [[path, node]]
    : Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));

// "edubeam" outside the CSS class `class="edubeam"`, which the stylesheet needs.
const mentions = (text: string) => /edubeam/i.test(text.replace(/class="edubeam"/g, ''));

describe('branding of upstream locale messages', () => {
  it('finds locale files to check', () => {
    expect(localeFiles.length).toBeGreaterThanOrEqual(12);
  });

  it.each(localeFiles)('%s mentions "edubeam" only in the known branded keys', (file) => {
    const data = JSON.parse(readFileSync(localesDir + file, 'utf8'));
    const mentioned = leaves(data)
      .filter(([, text]) => mentions(text))
      .map(([key]) => key);

    for (const key of mentioned)
      expect(branding.BRANDED_KEYS, `new mention of edubeam in ${file}: ${key}`).toContain(key);
  });

  it('replaces the name, including inflected endings, and keeps the CSS class', () => {
    const { brandCompiledMessages, BRAND_NAME } = branding;
    const title = 'Welcome to <span class="edubeam">edubeam</span>!';
    expect(brandCompiledMessages(title)).toBe(`Welcome to <span class="edubeam">${BRAND_NAME}</span>!`);
    expect(brandCompiledMessages('Ústředí edubeamu, kde')).toBe(`Ústředí ${BRAND_NAME}, kde`);
    // The same text as it appears escaped inside compiled (JS string) messages.
    expect(brandCompiledMessages('<span class=\\"edubeam\\">edubeam</span>')).toBe(
      `<span class=\\"edubeam\\">${BRAND_NAME}</span>`
    );
  });

  it('only touches the compiled messages module of the i18n plugin', () => {
    const plugin = branding.default();
    const { BRAND_NAME } = branding;

    expect(plugin.transform('edubeam', '/src/App.vue')).toBeNull();
    expect(plugin.transform('nothing to brand', 'virtual:@intlify/unplugin-vue-i18n/messages')).toBeNull();
    expect(plugin.transform('edubeam', 'virtual:@intlify/unplugin-vue-i18n/messages')?.code).toBe(BRAND_NAME);
  });
});
