import type { Plugin } from 'vite';

/**
 * SipilFrame (fork): names the app "SipilFrame" in the few locale messages that say "edubeam",
 * at build time, so the upstream locale files stay exactly as upstream ships them (no merge
 * conflicts on them, and new upstream locales are branded automatically).
 *
 * It works on the *compiled* messages: the virtual module `@intlify/unplugin-vue-i18n/messages`. That
 * plugin reads the locale files straight from disk, so a `load` hook never sees them, and in
 * production the messages are ASTs, not strings, so a runtime replacement would be fragile.
 */
export const BRAND_NAME = 'SipilFrame';

/**
 * Message keys (same path in every locale) that say "edubeam" today. Only used by the test that
 * guards this: if "edubeam" shows up anywhere else, that is a decision (brand it, or keep it as
 * attribution), not something to replace silently.
 */
export const BRANDED_KEYS = ['welcome.title', 'tour.bottomBar.description'];

// "edubeam" plus inflected endings (Czech "edubeamu"); the CSS class `class="edubeam"` must stay.
const BRAND_PATTERN = /(?<!class=\\?")edubeam\w*/gi;

export function brandCompiledMessages(code: string): string {
  return code.replace(BRAND_PATTERN, BRAND_NAME);
}

/** Vite plugin: brands the compiled messages module of the i18n plugin. */
export default function brandLocales(): Plugin {
  return {
    name: 'sipilframe:brand-locales',
    transform(code, id) {
      if (!id.includes('unplugin-vue-i18n/messages') || !/edubeam/i.test(code)) return null;

      return { code: brandCompiledMessages(code), map: null };
    },
  };
}
