<script setup lang="js">
import {useI18n} from "vue-i18n";

const {t} = useI18n();
</script>

<template>
  <section class="pt-6 p-4 md:p-5">
    <div class="flex flex-column gap-3">
      <h1 class="text-4xl font-bold text-color">{{ t('about.title') }}</h1>
      <img src="/edgewatch-logo.svg" alt="EdgeWatch logo" class="w-10rem h-auto"/>
      <p class="m-0 line-height-3 text-color-secondary">{{ t('about.content') }}</p>
    </div>
  </section>
</template>

<style scoped>
</style>