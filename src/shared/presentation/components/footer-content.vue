<script setup lang="js">
import {useI18n} from "vue-i18n";

const {t} = useI18n();
</script>

<template>
  <footer class="bg-primary p-3 mt-4">
    <div class="flex flex-column align-items-center justify-content-center gap-1 text-center text-white">
      <p class="m-0 text-sm font-medium">Copyright &copy; 2026 WebRunners. {{ t('footer.rights') }}</p>
      <router-link to="/terms" class="text-sm text-white font-bold">{{ t('footer.terms') }}</router-link>
      <p class="m-0 text-sm line-height-3">
        {{ t('authoring-phrase.intro') }}
        <i class="pi pi-heart text-pink-300" aria-hidden="true"/>
        {{ t('authoring-phrase.use') }}
        <a href="https://primevue.org/" target="_blank" rel="noopener noreferrer" class="text-white font-bold">PrimeVue</a>
        {{ t('authoring-phrase.author', {brand: 'WebRunners'}) }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
</style>