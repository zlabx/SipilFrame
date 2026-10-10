import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { isMobile } from '@/utils';

export type DockSide = 'bottom' | 'right';

/** Below this viewport width (or on a mobile device) the panel always sits at the bottom. */
export const DOCK_MIN_VIEWPORT_WIDTH = 768;

export const MIN_DOCK_WIDTH = 320;
export const DEFAULT_DOCK_WIDTH = 600;

/**
 * Where the bottom bar (nodes / elements / loads / ... panel) is docked, decided by screen size:
 * right on wide screens, bottom on mobile devices and narrow viewports. There is no manual
 * switch; the decision follows the window, so rotating or resizing re-docks it live.
 *
 * Fork-owned store: kept out of `app.ts` on purpose so pulling upstream never conflicts here.
 */
export const useDockStore = defineStore(
  'dock',
  () => {
    const width = ref(DEFAULT_DOCK_WIDTH);

    const { width: viewportWidth } = useWindowSize();

    const side = computed<DockSide>(() => {
      // Reading the reactive width makes this recompute on resize / rotation.
      const narrow = viewportWidth.value < DOCK_MIN_VIEWPORT_WIDTH;
      return isMobile() || narrow ? 'bottom' : 'right';
    });
    const isRight = computed(() => side.value === 'right');

    const maxWidth = computed(() => Math.max(MIN_DOCK_WIDTH, Math.floor(viewportWidth.value * 0.7)));

    const setWidth = (value: number) => {
      width.value = Math.min(Math.max(value, MIN_DOCK_WIDTH), maxWidth.value);
    };

    return { width, side, isRight, maxWidth, setWidth };
  },
  {
    // Only the width the user dragged to is remembered.
    persist: {
      pick: ['width'],
    },
  }
);

declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Set by Editor.vue. Lets BottomBar.vue read the dock side from its template alone, so that
     * file needs no import or setup code of ours (fewer merge conflicts with upstream).
     */
    $dock?: ReturnType<typeof useDockStore>;
  }
}
