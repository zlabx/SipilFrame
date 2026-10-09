import { describe, it, expect } from 'vitest';
// @ts-expect-error -- the app's TypeScript project has no @types/node (upstream's tests have the same error)
import { readFileSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';

/**
 * SipilFrame fork guard. The fork's right-hand dock, light header and two-row header are plain CSS
 * (src/assets/fork.scss, the <style> of views/Editor.vue) that hooks onto upstream's markup. When
 * an upstream merge reshapes that markup, git can merge cleanly while the layout silently breaks.
 * These tests pin the markup the CSS relies on, so such a merge fails here instead of in production.
 */
interface Prop {
  type: number;
  name: string;
  value?: { content: string };
  arg?: { content: string };
  exp?: { content: string };
}
interface El {
  type: number;
  tag: string;
  props: Prop[];
  children: El[];
}

// Vitest runs from the project root, so project-relative paths are enough.
const read = (rel: string) => readFileSync(rel, 'utf8');

const templateRoot = (source: string): El => {
  const ast = parse(source).descriptor.template?.ast as unknown as { children: El[] };
  const root = ast.children.find((n) => n.type === 1);
  if (!root) throw new Error('template has no root element');
  return root;
};

const elements = (node: El) => (node.children ?? []).filter((c) => c.type === 1);
const find = (node: El, test: (n: El) => boolean): El | undefined =>
  test(node) ? node : elements(node).reduce<El | undefined>((hit, child) => hit ?? find(child, test), undefined);
const staticAttr = (node: El, name: string) => node.props.find((p) => p.type === 6 && p.name === name);
const bound = (node: El, arg: string) =>
  node.props.find((p) => p.type === 7 && p.name === 'bind' && p.arg?.content === arg);
const listeners = (node: El) => node.props.filter((p) => p.type === 7 && p.name === 'on').map((p) => p.arg?.content);

describe('markup the dock CSS hooks onto', () => {
  const bottomBar = templateRoot(read('src/components/BottomBar.vue'));

  it('BottomBar: #bottomBar is a header row followed directly by the v-window', () => {
    expect(staticAttr(bottomBar, 'id')?.value?.content).toBe('bottomBar');
    const children = elements(bottomBar).map((e) => e.tag);
    expect(children.slice(0, 2)).toEqual(['div', 'v-window']);
    // Anything after them must be an overlay (rendered outside the layout), not a third grid cell.
    for (const extra of children.slice(2)) expect(['v-snackbar', 'v-dialog', 'v-menu']).toContain(extra);
  });

  it('BottomBar: the header is the resize handle and holds the tabs, then the button group', () => {
    const header = elements(bottomBar)[0];
    expect(staticAttr(header, 'data-resize-handle')).toBeDefined();

    const [tabs, buttons] = elements(header);
    expect(tabs.tag).toBe('v-tabs');
    expect(staticAttr(tabs, 'bg-color')?.value?.content).toBe('primary');
    expect(buttons.tag).toBe('div');
    expect(find(buttons, (n) => staticAttr(n, 'id')?.value?.content === 'bottomBarHelp')).toBeDefined();
  });

  it('BottomBar: the tabs turn vertical from the fork dock store', () => {
    const tabs = elements(elements(bottomBar)[0])[0];
    expect(bound(tabs, 'direction')?.exp?.content).toContain('$dock');
  });

  it('Editor: lays out the dock and exposes it to templates', () => {
    const source = read('src/views/Editor.vue');
    const root = templateRoot(source);

    expect(bound(root, 'class')?.exp?.content).toContain('dock-right');
    expect(
      find(root, (n) => n.tag === 'HelloWorld' && staticAttr(n, 'class')?.value?.content.includes('dock-main') === true)
    ).toBeDefined();
    expect(find(root, (n) => staticAttr(n, 'class')?.value?.content === 'dock-panel')).toBeDefined();
    expect(find(root, (n) => staticAttr(n, 'class')?.value?.content === 'resizer')).toBeDefined();
    expect(find(root, (n) => n.tag === 'BottomBar')).toBeDefined();
    expect(source).toContain('globalProperties.$dock');
    expect(source).toContain("import '@/assets/fork.scss'");
  });

  it('HelloWorld: the Viewer / Settings tab bar stays hidden', () => {
    expect(read('src/components/HelloWorld.vue')).toMatch(/const showTabBar = false;/);
  });

  it('App: the app bar has a second row that carries the header menu', () => {
    const appBar = find(templateRoot(read('src/App.vue')), (n) => n.tag === 'v-app-bar');
    expect(appBar).toBeDefined();
    expect(staticAttr(appBar!, 'extended')).toBeDefined();
    expect(staticAttr(appBar!, 'extension-height')).toBeDefined();

    const menu = find(appBar!, (n) => n.tag === 'HeaderMenu');
    expect(menu).toBeDefined();
    expect(listeners(menu!).sort()).toEqual(['clear', 'examples', 'export-image', 'open', 'save', 'share']);
  });

  it('App: the tour skips the hidden help step and clears the taller header', () => {
    const source = read('src/App.vue');
    expect(source).toContain("'#bottomBarHelp'");
    expect(source).toContain('belowHeader');
    expect(source).toContain('dock.isRight');
  });

  it('HeaderMenu: emits the six actions App.vue listens for', () => {
    const source = read('src/components/HeaderMenu.vue');
    for (const id of ['open', 'save', 'exportImage', 'share', 'examples', 'clear'])
      expect(source).toContain(`id: '${id}'`);
  });
});

describe('stylesheet hooks', () => {
  const fork = read('src/assets/fork.scss');
  const editor = read('src/views/Editor.vue');

  it('fork.scss targets the structure above', () => {
    for (const hook of ['.v-app-bar', '#bottomBar', '[data-resize-handle]', '.v-window', '.v-tabs', '.dock-right']) {
      expect(fork + editor, `missing ${hook}`).toContain(hook);
    }
  });

  it('fork.scss keeps the two layout overrides that upstream values would break', () => {
    expect(fork).toContain('--v-layout-top'); // main.scss hard-codes a 48px header
    expect(fork).toContain('--v-onboarding-step-z'); // tour card must stay above the taller header
  });
});
