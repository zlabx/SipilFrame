<template>
  <v-btn
    v-if="!dock.forcedBottom"
    v-tooltip="{ text: label, location: 'top' }"
    color="primary"
    density="compact"
    :icon="dock.isRight ? 'mdi-dock-bottom' : 'mdi-dock-right'"
    @click="dock.toggle()"
  ></v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDockStore } from '@/store/dock';

const dock = useDockStore();
const { t } = useI18n();

// Default messages keep this independent of the upstream locale files.
const label = computed(() =>
  dock.isRight ? t('dock.toBottom', 'Dock to bottom') : t('dock.toRight', 'Dock to right')
);
</script>
