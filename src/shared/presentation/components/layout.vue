<script setup lang="js">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import AuthenticationSection from "@/iam/presentation/components/authentication-section.vue";
import useIamStore from "@/iam/application/iam.store.js";

/**
 * Application shell: toolbar with the navigation options and the routed view.
 */
const {t} = useI18n();
const iam = useIamStore();
const drawerVisible = ref(false);

const options = computed(() => [
  {label: t("option.home"),           to: "/home",                              icon: "pi pi-home",        visible: iam.isSignedIn},
  {label: t("option.recuperations"),  to: "/traceability/recuperations",        icon: "pi pi-wrench",      visible: iam.isSupplier},
  {label: t("option.components"),     to: "/traceability/components",           icon: "pi pi-box",         visible: iam.isSupplier},
  {label: t("option.customers"),      to: "/traceability/customers",            icon: "pi pi-building",    visible: iam.isSupplier},
  {label: t("option.hvof-systems"),   to: "/equipment/hvof-systems",            icon: "pi pi-cog",         visible: iam.isSupplier},
  {label: t("option.spray-sessions"), to: "/process-monitoring/spray-sessions", icon: "pi pi-chart-line",  visible: iam.isSupplier},
  {label: t("option.about"),          to: "/about",                             icon: "pi pi-info-circle", visible: true}
].filter(o => o.visible));
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
        <nav class="hidden md:flex align-items-center gap-1"><authentication-section/><language-switcher class="ml-2"/>
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
    <footer-content/>
  </div>
</template>

<style scoped>
</style>