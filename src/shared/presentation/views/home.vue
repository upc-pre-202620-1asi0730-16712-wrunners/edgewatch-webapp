<script setup lang="js">
import {computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useFaultDiagnosisStore from "@/fault-diagnosis/application/fault-diagnosis.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import KpiCard from "@/shared/presentation/components/kpi-card.vue";
import SessionsPerDayChart from "@/shared/presentation/components/dashboard/sessions-per-day-chart.vue";
import FaultCasesByParameterChart from "@/shared/presentation/components/dashboard/fault-cases-by-parameter-chart.vue";

/**
 * Home: operations dashboard for recuperation suppliers, welcome message for everyone else.
 */
const {t} = useI18n();
const router = useRouter();
const iam = useIamStore();
const monitoring = useProcessMonitoringStore();
const faults = useFaultDiagnosisStore();
const equipment = useEquipmentStore();
const traceability = useTraceabilityStore();

const DAYS = 14;
const since = computed(() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (DAYS - 1)); return d; });
const recentSessions = computed(() => monitoring.sessions.filter(s => new Date(s.startedAt) >= since.value));
const abortedShare = computed(() => {
    const ended = recentSessions.value.filter(s => s.status !== "active");
    return ended.length ? Math.round(ended.filter(s => s.status === "aborted").length / ended.length * 100) : 0;
});
const recuperationsInProgress = computed(() => traceability.recuperations.filter(r => r.status === "IN_PROGRESS").length);
const plantIsEmpty = computed(() => equipment.hvofSystemsLoaded && equipment.hvofSystems.length === 0);
const latestOpenCases = computed(() => [...faults.openCases].sort((a, b) => b.epochMillis - a.epochMillis).slice(0, 5));
const formatDate = (d) => new Date(d).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"});

onMounted(() => {
    if (!iam.isSupplier) return;
    monitoring.fetchSessions();
    faults.fetchFaultCases();
    equipment.fetchAll();
    traceability.fetchAll();
});
</script>

<template>
  <section class="p-4 md:p-5">
    <template v-if="iam.isSupplier">
      <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h1 class="m-0 text-3xl font-bold text-color">{{ t('dashboard.title') }}</h1>
          <p class="m-0 text-color-secondary">{{ t('dashboard.subtitle', {days: DAYS}) }}</p>
        </div>
        <pv-button :label="t('spray-sessions.start')" icon="pi pi-play" @click="router.push({name: 'process-monitoring-session-start'})"/>
      </div>

      <pv-card v-if="plantIsEmpty" class="mb-3 empty-plant">
        <template #content>
          <div class="flex flex-wrap align-items-center gap-3">
            <span class="empty-icon flex align-items-center justify-content-center border-circle"><i class="pi pi-bolt"></i></span>
            <div class="flex-grow-1">
              <h2 class="m-0 text-xl">{{ t('dashboard.empty-title') }}</h2>
              <p class="m-0 text-color-secondary">{{ t('dashboard.empty-description') }}</p>
            </div>
            <pv-button :label="t('dashboard.empty-action')" icon="pi pi-bolt" @click="router.push({name: 'quick-start'})"/>
          </div>
        </template>
      </pv-card>

      <div class="grid mb-2">
        <div class="col-12 sm:col-6 lg:col-3"><kpi-card :label="t('dashboard.active-sessions')" :value="monitoring.activeSessions.length" icon="pi pi-play-circle" severity="info"/></div>
        <div class="col-12 sm:col-6 lg:col-3"><kpi-card :label="t('dashboard.open-fault-cases')" :value="faults.openCasesCount" icon="pi pi-exclamation-triangle" :severity="faults.openCasesCount ? 'danger' : 'success'"/></div>
        <div class="col-12 sm:col-6 lg:col-3"><kpi-card :label="t('dashboard.recent-sessions')" :value="recentSessions.length" icon="pi pi-history" :hint="t('dashboard.aborted-share', {percent: abortedShare})" severity="primary"/></div>
        <div class="col-12 sm:col-6 lg:col-3"><kpi-card :label="t('dashboard.recuperations-in-progress')" :value="recuperationsInProgress" icon="pi pi-wrench" :hint="t('dashboard.active-systems', {count: equipment.activeHvofSystems.length})" severity="warn"/></div>
      </div>

      <div class="grid">
        <div class="col-12 lg:col-7">
          <pv-card>
            <template #title><span class="text-base">{{ t('dashboard.sessions-per-day') }}</span></template>
            <template #content><sessions-per-day-chart :sessions="recentSessions" :days="DAYS"/></template>
          </pv-card>
        </div>
        <div class="col-12 lg:col-5">
          <pv-card>
            <template #title><span class="text-base">{{ t('dashboard.fault-cases-by-parameter') }}</span></template>
            <template #content><fault-cases-by-parameter-chart :fault-cases="faults.faultCases"/></template>
          </pv-card>
        </div>
      </div>

      <pv-card class="mt-3">
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <span class="text-base">{{ t('dashboard.latest-open-cases') }}</span>
            <pv-button :label="t('dashboard.see-all')" link @click="router.push({name: 'fault-diagnosis-cases'})"/>
          </div>
        </template>
        <template #content>
          <pv-data-table :value="latestOpenCases" size="small">
            <template #empty>{{ t('dashboard.no-open-cases') }}</template>
            <pv-column :header="t('fault-cases.detected-at')"><template #body="{ data }">{{ formatDate(data.detectedAt) }}</template></pv-column>
            <pv-column :header="t('fault-cases.session')"><template #body="{ data }">#{{ data.spraySessionId }}</template></pv-column>
            <pv-column :header="t('fault-cases.parameter')"><template #body="{ data }">{{ t('session-detail.parameter.' + data.parameter, data.parameter) }}</template></pv-column>
            <pv-column :header="t('fault-cases.band')"><template #body="{ data }"><pv-tag :value="t('session-detail.band.' + data.band)" :severity="data.band === 'shutdown' ? 'danger' : 'warn'"/></template></pv-column>
            <pv-column field="recommendedAction" :header="t('fault-cases.recommended-action')"/>
          </pv-data-table>
        </template>
      </pv-card>
    </template>

    <div v-else class="pt-4 flex flex-column gap-3">
      <h1 class="text-4xl font-bold text-color">{{ t('home.title') }}</h1>
      <p class="m-0 line-height-3 text-color-secondary">{{ t('home.content') }}</p>
    </div>
  </section>
</template>

<style scoped>
.empty-plant { border-left: 5px solid var(--edgewatch-orange); background: var(--edgewatch-orange-soft); }
.empty-icon { width: 3rem; height: 3rem; background: var(--edgewatch-orange); color: #fff; font-size: 1.3rem; }
</style>
