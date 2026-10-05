<script setup lang="js">
import {watch} from "vue";
import {useI18n} from "vue-i18n";

/** Exposes the available locales from vue-i18n as a toggle and keeps the document language in sync. */
const {t, locale, availableLocales} = useI18n();

watch(locale, (value) => { document.documentElement.lang = value; }, {immediate: true});
</script>

<template>
  <pv-select-button v-model="locale" :options="availableLocales" :allow-empty="false" size="small" :aria-label="t('language-switcher.label')">
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
</style>
