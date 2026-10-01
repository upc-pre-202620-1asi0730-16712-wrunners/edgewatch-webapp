<script setup lang="js">
import {ref} from "vue";

/**
 * Application shell: toolbar with the navigation options and the routed view.
 */
const drawerVisible = ref(false);

const options = [
  {label: "Home",           to: "/home",                              icon: "pi pi-home"},
  {label: "Recuperations",  to: "/traceability/recuperations",        icon: "pi pi-wrench"},
  {label: "Components",     to: "/traceability/components",           icon: "pi pi-box"},
  {label: "Customers",      to: "/traceability/customers",            icon: "pi pi-building"},
  {label: "HVOF Systems",   to: "/equipment/hvof-systems",            icon: "pi pi-cog"},
  {label: "Spray Sessions", to: "/process-monitoring/spray-sessions", icon: "pi pi-chart-line"},
  {label: "About",          to: "/about",                             icon: "pi pi-info-circle"}
];
</script>

<template>
  <div class="flex flex-column min-h-screen">
    <pv-toolbar class="bg-primary border-noround shadow-2 px-3">
      <template #start>
        <div class="flex align-items-center gap-2">
          <pv-button icon="pi pi-bars" text rounded class="text-white md:hidden" @click="drawerVisible = true"/>
          <img src="/edgewatch-logo.svg" alt="EdgeWatch logo" class="h-2rem text-white"/>
          <h1 class="m-0 text-xl font-bold text-white">EdgeWatch</h1>
        </div>
      </template>
      <template #end>
        <nav class="hidden md:flex align-items-center gap-1">
          <router-link v-for="option in options" :key="option.to" :to="option.to" custom v-slot="{ navigate, isActive }">
            <pv-button :label="option.label" :icon="option.icon" text class="text-white" :class="{'font-bold underline': isActive}" @click="navigate"/>
          </router-link>
        </nav>
      </template>
    </pv-toolbar>

    <pv-drawer v-model:visible="drawerVisible" header="EdgeWatch">
      <nav class="flex flex-column gap-2">
        <router-link v-for="option in options" :key="option.to" :to="option.to" custom v-slot="{ navigate }">
          <pv-button :label="option.label" :icon="option.icon" text class="justify-content-start" @click="navigate(); drawerVisible = false"/>
        </router-link>
      </nav>
    </pv-drawer>

    <main class="flex-grow-1">
      <router-view/>
    </main>
  </div>
</template>

<style scoped>
</style>