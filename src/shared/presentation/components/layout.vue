<script setup lang="js">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import AuthenticationSection from "@/iam/presentation/components/authentication-section.vue";
import useIamStore from "@/iam/application/iam.store.js";

/**
 * Application shell: navy sidebar with grouped navigation, top bar with session actions and the routed view.
 * On narrow screens the sidebar becomes a drawer.
 */
const {t} = useI18n();
const iam = useIamStore();
const drawerVisible = ref(false);

const groups = computed(() => [
  {label: t("nav.group.overview"), options: [
    {label: t("option.home"),           to: "/home",                              icon: "pi pi-th-large",             visible: iam.isSignedIn},
    {label: t("option.spray-sessions"), to: "/process-monitoring/spray-sessions", icon: "pi pi-chart-line",           visible: iam.isSupplier},
    {label: t("option.fault-cases"),    to: "/fault-diagnosis/fault-cases",       icon: "pi pi-exclamation-triangle", visible: iam.isSupplier}
  ]},
  {label: t("nav.group.traceability"), options: [
    {label: t("option.recuperations"),  to: "/traceability/recuperations",        icon: "pi pi-wrench",               visible: iam.isSupplier},
    {label: t("option.components"),     to: "/traceability/components",           icon: "pi pi-box",                  visible: iam.isSupplier},
    {label: t("option.customers"),      to: "/traceability/customers",            icon: "pi pi-building",             visible: iam.isSupplier}
  ]},
  {label: t("nav.group.equipment"), options: [
    {label: t("option.hvof-systems"),   to: "/equipment/hvof-systems",            icon: "pi pi-cog",                  visible: iam.isSupplier}
  ]},
  {label: t("nav.group.account"), options: [
    {label: t("option.users"),          to: "/iam/users",                         icon: "pi pi-users",                visible: iam.isAdmin},
    {label: t("option.subscription"),   to: "/billing/subscription",              icon: "pi pi-credit-card",          visible: iam.isAdmin},
    {label: t("option.about"),          to: "/about",                             icon: "pi pi-info-circle",          visible: true}
  ]}
].map(g => ({...g, options: g.options.filter(o => o.visible)})).filter(g => g.options.length));
</script>

<template>
  <div class="shell">
    <aside class="sidebar hidden md:flex">
      <router-link to="/home" class="brand">
        <img src="/edgewatch-logo.svg" alt="EdgeWatch logo" class="logo"/>
        <span>Edge<em>Watch</em></span>
      </router-link>
      <template v-for="group in groups" :key="group.label">
        <p class="group-label">{{ group.label }}</p>
        <router-link v-for="option in group.options" :key="option.to" :to="option.to" custom v-slot="{ navigate, isActive }">
          <a class="nav-item" :class="{active: isActive}" :href="option.to" @click.prevent="navigate">
            <i :class="option.icon"></i><span>{{ option.label }}</span>
          </a>
        </router-link>
      </template>
      <div v-if="iam.isSignedIn" class="session-box">
        <span class="session-type">{{ t('nav.segment.' + (iam.organizationType ?? 'GUEST')) }}</span>
        <strong>{{ iam.email }}</strong>
      </div>
    </aside>

    <pv-drawer v-model:visible="drawerVisible" header="EdgeWatch" class="w-18rem">
      <nav class="flex flex-column gap-1">
        <template v-for="group in groups" :key="group.label">
          <p class="text-xs uppercase text-color-secondary mt-3 mb-1 px-2">{{ group.label }}</p>
          <router-link v-for="option in group.options" :key="option.to" :to="option.to" custom v-slot="{ navigate }">
            <pv-button :label="option.label" :icon="option.icon" text class="justify-content-start" @click="navigate(); drawerVisible = false"/>
          </router-link>
        </template>
      </nav>
    </pv-drawer>

    <div class="content">
      <header class="topbar">
        <pv-button icon="pi pi-bars" text rounded class="md:hidden" @click="drawerVisible = true"/>
        <span class="md:hidden font-bold">EdgeWatch</span>
        <div class="flex-grow-1"></div>
        <language-switcher/>
        <authentication-section/>
      </header>
      <main class="flex-grow-1">
        <router-view/>
      </main>
      <footer-content/>
    </div>
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; display: flex; }
.sidebar { width: 240px; flex-shrink: 0; box-sizing: border-box; background: var(--edgewatch-navy); color: #fff; flex-direction: column; gap: 2px; padding: 22px 14px; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 20px; color: #fff; text-decoration: none; font-size: 20px; font-weight: 700; }
.brand em { font-style: normal; color: var(--edgewatch-orange); }
.logo { height: 28px; }
.group-label { margin: 14px 14px 4px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #7d8a9c; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; color: #c9d1dc; text-decoration: none; font-size: 14px; }
.nav-item i { width: 1.1rem; text-align: center; }
.nav-item:hover { background: var(--edgewatch-navy-soft); color: #fff; }
.nav-item.active { background: var(--edgewatch-orange); color: #fff; font-weight: 600; }
.session-box { margin-top: auto; padding: 14px; border-radius: 12px; background: var(--edgewatch-navy-soft); font-size: 12px; color: #c9d1dc; display: flex; flex-direction: column; gap: 4px; }
.session-type { text-transform: uppercase; letter-spacing: .06em; font-size: 10px; color: var(--edgewatch-orange); }
.session-box strong { color: #fff; word-break: break-all; }
.content { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.topbar { display: flex; align-items: center; gap: 12px; padding: 8px 24px; background: var(--edgewatch-card); border-bottom: 1px solid var(--edgewatch-border); position: sticky; top: 0; z-index: 5; }
</style>
