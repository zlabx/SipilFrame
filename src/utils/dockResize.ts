import { ref } from 'vue';
import { useDockStore } from '@/store/dock';

/**
 * Horizontal resize for the right-docked panel. Pointer capture keeps the drag on the handle even
 * when the pointer leaves it, so no window-level listeners are needed and the upstream vertical
 * drag logic in Editor.vue stays untouched.
 */
export function useDockResize() {
  const dock = useDockStore();
  const dragging = ref(false);

  let startX = 0;
  let startWidth = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (!dock.isRight) return;

    dragging.value = true;
    startX = e.clientX;
    startWidth = Math.min(dock.width, dock.maxWidth);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.value) return;

    // The panel is on the right, so dragging left makes it wider.
    dock.setWidth(startWidth - (e.clientX - startX));
    document.getSelection()?.removeAllRanges();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragging.value) return;

    dragging.value = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return { dragging, onPointerDown, onPointerMove, onPointerUp };
}
