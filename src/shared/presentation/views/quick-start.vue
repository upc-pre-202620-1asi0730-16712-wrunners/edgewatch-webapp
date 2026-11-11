<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {QuickStartService} from "@/shared/application/quick-start.service.js";
import {QUICK_START_STEPS} from "@/shared/domain/model/demo-plant.js";

/**
 * Quick start: shows which prerequisites of a spray session are missing and provisions a demo plant
 * in one click, then starts the first session, without hopping between the Equipment and Traceability pages.
 */
const {t} = useI18n();
const router = useRouter();
const service = new QuickStartService();

const loading = ref(true);
const running = ref(false);
const failed = ref(false);
const provisioned = ref(null);
const progress = reactive(Object.fromEntries(QUICK_START_STEPS.map(k => [k, "pending"])));
const readiness = ref([]);

const refresh = () => { readiness.value = service.readiness(); };
const isReady = computed(() => readiness.value.length > 0 && readiness.value.every(s => s.done));
const missingCount = computed(() => readiness.value.filter(s => !s.done).length);

onMounted(() => service.load().finally(() => { refresh(); loading.value = false; }));

const iconOf = (status) => ({pending: "pi pi-circle", running: "pi pi-spin pi-spinner", done: "pi pi-check-circle", skipped: "pi pi-check-circle"})[status];

const provision = () => {
    running.value = true; failed.value = false; provisioned.value = null;
    QUICK_START_STEPS.forEach(k => progress[k] = "pending");
    service.provision((key, status) => { progress[key] = status; })
        .then(result => { provisioned.value = result; })
        .catch(error => { console.error(error); failed.value = true; })
        .finally(() => { refresh(); running.value = false; });
};

const startSession = () => {
    running.value = true;
    service.startSession(provisioned.value)
        .then(session => session && router.push({name: "process-monitoring-session-detail", params: {id: session.id}}))
        .finally(() => { running.value = false; });
};

const provisionAndStart = () => {
    running.value = true; failed.value = false;
    QUICK_START_STEPS.forEach(k => progress[k] = "pending");
    service.provision((key, status) => { progress[key] = status; })
        .then(result => { provisioned.value = result; return service.startSession(result); })
        .then(session => session && router.push({name: "process-monitoring-session-detail", params: {id: session.id}}))
        .catch(error => { console.error(error); failed.value = true; })
        .finally(() => { refresh(); running.value = false; });
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="page-title">{{ t('quick-start.title') }}</h1>
    <p class="mt-1 mb-4 text-color-secondary">{{ t('quick-start.subtitle') }}</p>

    <div class="grid">
      <div class="col-12 lg:col-5">
        <pv-card class="h-full">
          <template #title><span class="text-base">{{ t('quick-start.checklist') }}</span></template>
          <template #content>
            <p v-if="loading" class="text-color-secondary m-0"><i class="pi pi-spin pi-spinner mr-2"></i>{{ t('quick-start.loading') }}</p>
            <ul v-else class="list-none p-0 m-0 flex flex-column gap-2">
              <li v-for="item in readiness" :key="item.key" class="flex align-items-center gap-3 p-2 border-round-lg" :class="item.done ? 'ok' : 'missing'">
                <i :class="item.done ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                <div class="flex-grow-1">
                  <div class="font-semibold">{{ t('quick-start.step.' + item.key) }}</div>
                  <small class="text-color-secondary">{{ t('quick-start.count', {count: item.count}) }}</small>
                </div>
                <pv-button icon="pi pi-arrow-right" text rounded size="small" @click="router.push(item.route)"/>
              </li>
            </ul>
            <pv-message v-if="!loading" :severity="isReady ? 'success' : 'warn'" class="mt-3" :closable="false">
              {{ isReady ? t('quick-start.ready') : t('quick-start.missing', {count: missingCount}) }}
            </pv-message>
          </template>
        </pv-card>
      </div>

      <div class="col-12 lg:col-7">
        <pv-card class="h-full demo-card">
          <template #title><span class="text-base">{{ t('quick-start.demo-title') }}</span></template>
          <template #content>
            <p class="mt-0 text-color-secondary">{{ t('quick-start.demo-description') }}</p>
            <ol class="list-none p-0 m-0 mb-3 flex flex-column gap-1">
              <li v-for="key in QUICK_START_STEPS" :key="key" class="flex align-items-center gap-2 py-1" :class="'status-' + progress[key]">
                <i :class="iconOf(progress[key])"></i>
                <span>{{ t('quick-start.step.' + key) }}</span>
                <small v-if="progress[key] === 'skipped'" class="text-color-secondary">· {{ t('quick-start.already-exists') }}</small>
              </li>
            </ol>
            <pv-message v-if="failed" severity="error" :closable="false" class="mb-3">{{ t('quick-start.failed') }}</pv-message>
            <pv-message v-if="provisioned" severity="success" :closable="false" class="mb-3">{{ t('quick-start.provisioned') }}</pv-message>
            <div class="flex flex-wrap gap-2">
              <pv-button :label="t('quick-start.load-and-start')" icon="pi pi-bolt" :loading="running" :disabled="loading" @click="provisionAndStart"/>
              <pv-button :label="t('quick-start.load-only')" icon="pi pi-database" severity="secondary" outlined :loading="running" :disabled="loading" @click="provision"/>
              <pv-button v-if="provisioned" :label="t('quick-start.start-session')" icon="pi pi-play" severity="success" :loading="running" @click="startSession"/>
              <pv-button v-else-if="isReady && !loading" :label="t('quick-start.go-to-start')" icon="pi pi-play" severity="success" outlined @click="router.push({name: 'process-monitoring-session-start'})"/>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ok { background: #ecfdf3; }
.ok i { color: #15803d; }
.missing { background: #fff7ed; }
.missing i { color: #c2410c; }
.status-pending { color: #7d8a9c; }
.status-running { color: var(--edgewatch-blue); }
.status-done i, .status-skipped i { color: #15803d; }
.demo-card { border-top: 4px solid var(--edgewatch-orange); }
</style>
