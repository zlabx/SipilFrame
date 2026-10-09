import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { DOCK_MIN_VIEWPORT_WIDTH, MIN_DOCK_WIDTH, useDockStore } from '@/store/dock';

/** SipilFrame fork guard: the panel docks right on wide screens and at the bottom on mobile / narrow ones. */
const DESKTOP_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

const original = { width: window.innerWidth, ua: navigator.userAgent };

const viewport = async (width: number, ua = DESKTOP_UA) => {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
  window.dispatchEvent(new Event('resize'));
  await nextTick();
};

describe('dock store', () => {
  beforeEach(() => setActivePinia(createPinia()));
  afterEach(async () => viewport(original.width, original.ua));

  it('docks right on a wide desktop screen', async () => {
    await viewport(1366);
    const dock = useDockStore();
    expect(dock.side).toBe('right');
    expect(dock.isRight).toBe(true);
  });

  it('docks at the bottom below the width threshold', async () => {
    await viewport(DOCK_MIN_VIEWPORT_WIDTH - 1);
    expect(useDockStore().side).toBe('bottom');
  });

  it('docks right exactly at the threshold', async () => {
    await viewport(DOCK_MIN_VIEWPORT_WIDTH);
    expect(useDockStore().side).toBe('right');
  });

  it('always docks at the bottom on a mobile device, however wide', async () => {
    await viewport(1366, PHONE_UA);
    expect(useDockStore().side).toBe('bottom');
  });

  it('re-docks live when the window is resized', async () => {
    await viewport(1366);
    const dock = useDockStore();
    expect(dock.side).toBe('right');

    await viewport(600);
    expect(dock.side).toBe('bottom');

    await viewport(1366);
    expect(dock.side).toBe('right');
  });

  it('keeps the dragged width within its limits', async () => {
    await viewport(1366);
    const dock = useDockStore();

    dock.setWidth(50);
    expect(dock.width).toBe(MIN_DOCK_WIDTH);

    dock.setWidth(5000);
    expect(dock.width).toBe(dock.maxWidth);
    expect(dock.maxWidth).toBe(Math.floor(1366 * 0.7));

    dock.setWidth(600);
    expect(dock.width).toBe(600);
  });
});
