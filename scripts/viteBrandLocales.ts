import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

/**
 * SipilFrame (fork): names the app "SipilFrame" in the few locale messages that say "edubeam",
 * at build time, so the upstream locale files stay exactly as upstream ships them (no merge
 * conflicts on them, and new upstream locales are branded automatically).
 *
 * Why not at runtime: production messages are precompiled to ASTs, not strings.
 */
export const BRAND_NAME = 'SipilFrame';

/**
 * Message keys (same path in every locale) whose text names the app. A test fails if "edubeam"
 * shows up anywhere else, so a new mention is a decision (brand it, or keep it as attribution).
 */
export const BRANDED_KEYS = ['welcome.title', 'tour.bottomBar.description'];

// "edubeam" plus inflected endings (Czech "edubeamu"); the CSS class `class="edubeam"` must stay.
const BRAND_PATTERN = /(?<!class=")edubeam\w*/gi;

export function brandLocaleJson(text: string): string {
  const data = JSON.parse(text);

  for (const key of BRANDED_KEYS) {
    const path = key.split('.');
    const last = path.pop() as string;

    let node = data;
    for (const part of path) node = node?.[part];

    if (node && typeof node[last] === 'string') node[last] = node[last].replace(BRAND_PATTERN, BRAND_NAME);
  }

  return JSON.stringify(data);
}

/** Vite plugin: serves the branded version of src/locales/<locale>.json to the i18n plugin. */
export default function brandLocales(): Plugin {
  return {
    name: 'sipilframe:brand-locales',
    enforce: 'pre',
    load(id) {
      const file = id.split('?')[0];
      if (!/[\\/]src[\\/]locales[\\/][^\\/]+\.json$/.test(file)) return null;

      return brandLocaleJson(readFileSync(file, 'utf8'));
    },
  };
}
