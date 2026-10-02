<script setup lang="js">
import {useI18n} from "vue-i18n";

/** Exposes the available locales from vue-i18n as a toggle. */
const {locale, availableLocales} = useI18n();
</script>

<template>
  <pv-select-button v-model="locale" :options="availableLocales" :allow-empty="false" size="small">
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
</style>