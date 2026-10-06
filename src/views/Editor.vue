<template>
  <div ref="rootRef" class="d-flex fill-height" :class="dock.isRight ? 'flex-row dock-right' : 'flex-column'">
    <div style="height: 100%; width: 100%; position: absolute; pointer-events: none">
      <TransitionGroup name="fade">
        <Widget v-for="widget of layoutStore.widgets" :key="widget.title" :widget="widget" />
      </TransitionGroup>
    </div>
    <HelloWorld class="fill-height dock-main" style="min-height: 0" />
    <div
      v-show="!dockCollapsed"
      class="resizer"
      :data-direction="dock.isRight ? 'horizontal' : 'vertical'"
      @pointerdown="dockResize.onPointerDown"
      @pointermove="dockResize.onPointerMove"
      @pointerup="dockResize.onPointerUp"
      @pointercancel="dockResize.onPointerUp"
    ></div>
    <!-- Stays mounted when collapsed on the right: BottomBar also reacts to events while closed. -->
    <div
      v-if="!appStore.inViewerMode"
      v-show="!dockCollapsed"
      class="dock-panel"
      :style="dock.isRight ? { width: `${dockWidth}px` } : undefined"
    >
      <BottomBar :height="computedBottomBarHeight" class="d-block" />
    </div>
    <div v-if="dockCollapsed" class="dock-rail">
      <v-btn
        color="primary"
        density="compact"
        icon="mdi-window-restore"
        variant="text"
        @click="appStore.bottomBarOpen = true"
      ></v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue';
import BottomBar from '@/components/BottomBar.vue';
import Widget from '@/components/Widget.vue';

import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useAppStore } from '@/store/app';
import { useProjectStore } from '@/store/project';
import { useLayoutStore } from '@/store/layout';
import { useDockStore } from '@/store/dock';
import { useDockResize } from '@/utils/dockResize';

const appStore = useAppStore();
const projectStore = useProjectStore();
const layoutStore = useLayoutStore();
const dock = useDockStore();
const dockResize = useDockResize();

const rootRef = ref<HTMLElement | null>(null);
const { height: rootHeight } = useElementSize(rootRef);

const MIN_BOTTOM_BAR_HEIGHT = 193;

const drag = ref(false);

const computedBottomBarHeight = computed(() => {
  if (appStore.inViewerMode) return 0;

  // Docked right, the panel fills the full height of the editor; BottomBar sizes its tables from it.
  if (dock.isRight) return Math.max(rootHeight.value, MIN_BOTTOM_BAR_HEIGHT);

  return appStore.bottomBarOpen ? appStore.bottomBarHeight : 36;
});

/** Docked right and minimized: the panel is hidden and a slim rail with a restore button remains. */
const dockCollapsed = computed(() => dock.isRight && !appStore.bottomBarOpen && !appStore.inViewerMode);

const dockWidth = computed(() => Math.min(dock.width, dock.maxWidth));

// The last pointer position, not `movementY`: for touch pointers browsers report no movement.
let dragLastY = 0;

/**
 * A press on the tab strip may yet turn out to be a tab tap, so it becomes a resize only once the
 * pointer has travelled: the dedicated handle drags at once, a shared one has to earn it.
 */
const TAB_STRIP_DRAG_THRESHOLD_PX = 8;
let pendingDragStartY: number | null = null;
let dragStartedOnTabs = false;

/** A drag across the tabs must not leave a click behind that switches the tab it ended on. */
const swallowNextClick = () => {
  const swallow = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  window.addEventListener('click', swallow, { capture: true });
  window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 300);
};

const mouseMove = (e: PointerEvent) => {
  if (pendingDragStartY !== null && Math.abs(e.clientY - pendingDragStartY) > TAB_STRIP_DRAG_THRESHOLD_PX) {
    pendingDragStartY = null;
    dragStartedOnTabs = true;
    drag.value = true;
    dragLastY = e.clientY;

    // Dragging the strip of a collapsed bar opens it at its smallest, and grows from there.
    if (!appStore.bottomBarOpen) {
      appStore.bottomBarOpen = true;
      appStore.bottomBarHeight = MIN_BOTTOM_BAR_HEIGHT;
    }
  }

  if (drag.value) {
    const val = appStore.bottomBarHeight - (e.clientY - dragLastY);
    dragLastY = e.clientY;

    document.getSelection().removeAllRanges();

    if (val < MIN_BOTTOM_BAR_HEIGHT) return (appStore.bottomBarHeight = MIN_BOTTOM_BAR_HEIGHT);
    if (val > window.innerHeight / 2) return (appStore.bottomBarHeight = window.innerHeight / 2);

    appStore.bottomBarHeight = val;
  }
};

const onMouseDown = (e: PointerEvent) => {
  if (!(e.target instanceof Element)) return;
  // Height resize does not apply when docked right (see dockResize.ts for the width resize).
  if (dock.isRight) return;

  if (e.target instanceof HTMLElement && e.target.dataset.direction === 'vertical') {
    drag.value = true;
    dragLastY = e.clientY;
    return;
  }

  if (e.target.closest('[data-resize-handle="vertical"]')) pendingDragStartY = e.clientY;
};

const onMouseUp = () => {
  if (drag.value && dragStartedOnTabs) swallowNextClick();

  drag.value = false;
  dragStartedOnTabs = false;
  pendingDragStartY = null;
};

onMounted(() => {
  window.addEventListener('pointermove', mouseMove);
  window.addEventListener('pointerup', onMouseUp);
  window.addEventListener('pointercancel', onMouseUp);
  window.addEventListener('pointerdown', onMouseDown);
});

onUnmounted(() => {
  window.removeEventListener('pointermove', mouseMove);
  window.removeEventListener('pointerup', onMouseUp);
  window.removeEventListener('pointercancel', onMouseUp);
  window.removeEventListener('pointerdown', onMouseDown);
});
</script>

<style lang="scss">
.resizer[data-direction='horizontal'] {
  background-color: #cbd5e0;
  cursor: ew-resize;
  height: 100%;
  width: 2px;
}
.resizer[data-direction='vertical'] {
  cursor: ns-resize;
  height: 0px;
  width: 100%;
  display: flex;
  position: relative;
  /* The drag is ours: without this a touch drag scrolls the page instead of resizing. */
  touch-action: none;
}

.resizer[data-direction='vertical']::after {
  content: '';
  background-color: transparent;
  cursor: ns-resize;
  height: 12px;
  margin-top: -6px;
  width: 100%;
  display: flex;
  position: absolute;
  z-index: 100;
}

/* A 12 px strip is a mouse target; a finger needs more to grab. */
@media (pointer: coarse) {
  .resizer[data-direction='vertical']::after {
    height: 24px;
    margin-top: -12px;
  }
}

/*
 * The bottom bar tab strip doubles as a resize handle - a whole bar to grab rather than a line.
 * Horizontal panning stays with the browser, so the tabs themselves can still be scrolled.
 */
[data-resize-handle='vertical'] {
  touch-action: pan-x;
}

/* ---- Dock (fork): bottom bar docked to the right on wide screens ---- */
.dock-panel {
  flex: none;
  min-width: 0;
  overflow: hidden;
}

.dock-rail {
  flex: none;
  width: 36px;
  display: flex;
  justify-content: center;
  padding-top: 4px;
  background-color: rgb(var(--v-theme-primary));
}

.dock-right > .dock-main {
  flex: 1 1 0;
  min-width: 0;
}

.dock-right .resizer[data-direction='horizontal'] {
  flex: none;
  position: relative;
  /* The drag is ours: without this a touch drag scrolls the page instead of resizing. */
  touch-action: none;
}

.dock-right .resizer[data-direction='horizontal']::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -6px;
  width: 14px;
  cursor: ew-resize;
  z-index: 100;
}

@media (pointer: coarse) {
  .dock-right .resizer[data-direction='horizontal']::after {
    left: -12px;
    width: 26px;
  }
}

/* The panel is bordered by the resize line on its left, not by a top edge. */
.dock-right #bottomBar {
  border-top: 0 !important;
}

/*
 * Docked right, the tab strip becomes a vertical strip on the panel's right edge (like AutoCAD
 * palettes): #bottomBar turns into a grid and the header wrapper dissolves (display: contents) so
 * its two children - the tabs and the button group - can be placed independently.
 */
.dock-right #bottomBar {
  display: grid !important;
  /* A definite height, so the 1fr row (and the vertical tab strip) cannot grow with its content. */
  height: 100%;
  grid-template-columns: minmax(0, 1fr) 36px;
  grid-template-rows: 36px minmax(0, 1fr);
}

.dock-right #bottomBar > [data-resize-handle] {
  display: contents !important;
}

/* Help, dock and minimize buttons: top row, left of the vertical strip. */
.dock-right #bottomBar > [data-resize-handle] > div:not(.v-tabs) {
  grid-column: 1;
  grid-row: 1;
  justify-content: flex-end;
}

.dock-right #bottomBar > .v-window {
  grid-column: 1;
  grid-row: 2;
}

.dock-right #bottomBar .v-tabs {
  grid-column: 2;
  grid-row: 1 / span 2;
  width: 36px;
  /* Stretch to the grid area instead of growing with the tabs, so overflow scrolls (arrows). */
  height: auto;
  align-self: stretch;
  min-height: 0;
  overflow: hidden;
}

/* Scroll arrows of the strip point up / down instead of left / right. */
.dock-right #bottomBar .v-slide-group__prev .v-icon,
.dock-right #bottomBar .v-slide-group__next .v-icon {
  transform: rotate(90deg);
}

/* Tab text runs top to bottom; the icon is turned back upright. */
.dock-right #bottomBar .v-tab.v-btn {
  writing-mode: vertical-rl;
  width: 36px;
  min-width: 0;
  height: auto;
  padding: 10px 0;
}

.dock-right #bottomBar .v-tab .v-icon {
  transform: rotate(-90deg);
  margin-right: 0 !important;
  margin-bottom: 6px;
}
</style>
