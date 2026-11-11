<script setup lang="js">
import {useI18n} from "vue-i18n";

const {t} = useI18n();

const sections = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
</script>

<template>
  <section class="pt-6 p-4 md:p-5">
    <article class="flex flex-column gap-3 max-w-50rem" aria-labelledby="terms-title">
      <h1 id="terms-title" class="m-0 text-4xl font-bold text-color">{{ t('terms.title') }}</h1>
      <p class="m-0 text-sm text-color-secondary">{{ t('terms.updated') }}</p>
      <p class="m-0 line-height-3 text-color">{{ t('terms.intro') }}</p>
      <section v-for="section in sections" :key="section" class="flex flex-column gap-2">
        <h2 class="m-0 text-xl font-semibold text-color">{{ t(`terms.${section}.title`) }}</h2>
        <p class="m-0 line-height-3 text-color-secondary">{{ t(`terms.${section}.content`) }}</p>
      </section>
    </article>
  </section>
</template>

<style scoped>
</style>
