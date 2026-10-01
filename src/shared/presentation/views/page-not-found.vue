<script setup lang="js">
import {useRoute} from "vue-router";

const route = useRoute();
const unavailableRoute = route.path;
</script>

<template>
  <section class="pt-6 p-4 md:p-5">
    <div class="flex flex-column gap-3">
      <h1 class="text-4xl font-bold text-color">Page Not Found</h1>
      <p class="m-0 line-height-3 text-color-secondary">The path {{ unavailableRoute }} is not available.</p>
      <router-link to="/home" class="text-primary font-medium">Go Home</router-link>
    </div>
  </section>
</template>

<style scoped>
</style>