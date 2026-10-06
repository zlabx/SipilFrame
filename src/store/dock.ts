import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { isMobile } from '@/utils';

export type DockSide = 'bottom' | 'right';

/** Below this viewport width (or on a mobile device) the panel always sits at the bottom. */
export const DOCK_MIN_VIEWPORT_WIDTH = 768;

export const MIN_DOCK_WIDTH = 320;
export const DEFAULT_DOCK_WIDTH = 520;

/**
 * Where the bottom bar (nodes / elements / loads / ... panel) is docked.
 *
 * Fork-owned store: kept out of `app.ts` on purpose so pulling upstream never conflicts here.
 * `preferredSide` is the user's choice; `side` is what is actually used - mobile and narrow
 * viewports are forced to the bottom, and the preference is kept for when the screen grows again.
 */
export const useDockStore = defineStore(
  'dock',
  () => {
    const preferredSide = ref<DockSide>('bottom');
    const width = ref(DEFAULT_DOCK_WIDTH);

    const { width: viewportWidth } = useWindowSize();

    const forcedBottom = computed(() => {
      // Reading the reactive width makes this recompute on resize / rotation.
      void viewportWidth.value;
      return isMobile() || viewportWidth.value < DOCK_MIN_VIEWPORT_WIDTH;
    });

    const side = computed<DockSide>(() => (forcedBottom.value ? 'bottom' : preferredSide.value));
    const isRight = computed(() => side.value === 'right');

    const maxWidth = computed(() => Math.max(MIN_DOCK_WIDTH, Math.floor(viewportWidth.value * 0.7)));

    const setWidth = (value: number) => {
      width.value = Math.min(Math.max(value, MIN_DOCK_WIDTH), maxWidth.value);
    };

    const toggle = () => {
      preferredSide.value = preferredSide.value === 'right' ? 'bottom' : 'right';
    };

    return { preferredSide, width, side, isRight, forcedBottom, maxWidth, setWidth, toggle };
  },
  {
    persist: {
      pick: ['preferredSide', 'width'],
    },
  }
);
