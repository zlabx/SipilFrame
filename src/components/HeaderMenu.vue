<template>
  <nav class="header-menu" :aria-label="t('common.openProject')">
    <v-btn
      v-for="item in items"
      :key="item.id"
      class="header-menu-btn"
      variant="text"
      :title="item.label"
      :aria-label="item.label"
      @click="emit(item.id)"
    >
      <v-icon>{{ item.icon }}</v-icon>
      <span class="header-menu-label">{{ item.label }}</span>
    </v-btn>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Second row of the app bar: the same six actions as the left drawer, as buttons. The labels
 * collapse to icon-only on narrower screens (see the media query below; tooltips keep the names).
 * It only emits; App.vue owns the actual handlers, so the logic is not duplicated here.
 */
type MenuAction = 'open' | 'save' | 'exportImage' | 'share' | 'examples' | 'clear';

const emit = defineEmits<{ (e: MenuAction): void }>();

const { t } = useI18n();

const items = computed<{ id: MenuAction; icon: string; label: string }[]>(() => [
  { id: 'open', icon: 'mdi-folder-open-outline', label: t('common.openProject') },
  { id: 'save', icon: 'mdi-folder-arrow-down-outline', label: t('common.saveProject') },
  { id: 'exportImage', icon: 'mdi-image-outline', label: t('exportImage.title') },
  { id: 'share', icon: 'mdi-share', label: t('common.shareModel') },
  { id: 'examples', icon: 'mdi-bookshelf', label: t('examples.title') },
  { id: 'clear', icon: 'mdi-delete-empty', label: t('common.clearMesh') },
]);
</script>

<style scoped lang="scss">
/*
 * Symmetric by construction: one grid row whose six columns are all the same width (1fr sizes them to
 * the widest label), equal gaps, and the whole cluster centered in the bar.
 */
.header-menu {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(148px, 1fr);
  gap: 4px;
  align-items: center;
  width: max-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 8px;
}

.header-menu-btn {
  height: 36px;
}

.header-menu-label {
  margin-left: 6px;
  white-space: nowrap;
}

/* Icon-only: six equal square-ish buttons that shrink together so they always fit, even on a 320px phone. */
@media (max-width: 1099.98px) {
  .header-menu {
    grid-auto-columns: minmax(0, 72px);
    gap: 2px;
    width: 100%;
    justify-content: center;
    padding: 0 4px;
  }

  .header-menu-btn {
    min-width: 0;
    padding: 0;
  }

  .header-menu-label {
    display: none;
  }
}
</style>
