<script setup lang="js">
import {computed, onMounted, reactive, watch} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useProcessMonitoringStore();
const equipment = useEquipmentStore();
const traceability = useTraceabilityStore();

const filters = reactive({hvofSystemId: null, recuperationId: null, from: null, to: null});

const systemOptions = computed(() => equipment.hvofSystems.map(s => ({value: s.id, label: s.code})));
const recuperationOptions = computed(() => traceability.recuperations.map(r => ({value: r.id, label: r.workOrderNumber})));

const filtered = computed(() => store.sessions.filter(s => {
    if (filters.hvofSystemId && s.hvofSystemId !== filters.hvofSystemId) return false;
    if (filters.recuperationId && s.recuperationId !== filters.recuperationId) return false;
    const started = new Date(s.startedAt);
    if (filters.from && started < filters.from) return false;
    if (filters.to) { const end = new Date(filters.to); end.setHours(23, 59, 59, 999); if (started > end) return false; }
    return true;
}));

watch(filtered, (list) => list.forEach(s => store.loadDeviations(s.id)), {immediate: true});

const deviationsOf = (id) => { const n = store.deviations.get(id); return n === undefined ? "…" : n < 0 ? "–" : n; };
const clearFilters = () => Object.assign(filters, {hvofSystemId: null, recuperationId: null, from: null, to: null});

const systemCode = (id) => equipment.getHvofSystemById(id)?.code ?? `#${id}`;
const workOrder = (id) => traceability.getRecuperationById(id)?.workOrderNumber ?? `#${id}`;
const statusSeverity = (status) => ({active: "info", completed: "success", aborted: "danger", interrupted: "warn"}[status]);
const formatDate = (iso) => iso ? new Date(iso).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"}) : "";

const startSession = () => router.push({name: "process-monitoring-session-start"});
const openSession = (id) => router.push({name: "process-monitoring-session-detail", params: {id}});

onMounted(() => {
    if (!store.sessionsLoaded) store.fetchSessions();
    equipment.fetchAll();
    traceability.fetchAll();
});
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('spray-sessions.title') }}</h1>
      <pv-button :label="t('spray-sessions.start')" icon="pi pi-play" @click="startSession"/>
    </div>
    <div class="flex flex-wrap align-items-center gap-2 mb-3">
      <pv-select v-model="filters.hvofSystemId" :options="systemOptions" option-label="label" option-value="value" show-clear :placeholder="t('spray-sessions.filter-system')" class="w-12rem"/>
      <pv-select v-model="filters.recuperationId" :options="recuperationOptions" option-label="label" option-value="value" show-clear :placeholder="t('spray-sessions.filter-recuperation')" class="w-12rem"/>
      <pv-date-picker v-model="filters.from" date-format="yy-mm-dd" show-icon :placeholder="t('spray-sessions.filter-from')" class="w-11rem"/>
      <pv-date-picker v-model="filters.to" date-format="yy-mm-dd" show-icon :placeholder="t('spray-sessions.filter-to')" class="w-11rem"/>
      <pv-button :label="t('spray-sessions.clear-filters')" icon="pi pi-filter-slash" text @click="clearFilters"/>
    </div>
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="filtered" :loading="!store.sessionsLoaded" paginator :rows="10" sort-field="startedAt" :sort-order="-1" striped-rows>
      <template #empty>{{ t('spray-sessions.empty') }}</template>
      <pv-column field="id" :header="t('spray-sessions.id')" sortable style="width: 5rem"/>
      <pv-column field="startedAt" :header="t('spray-sessions.started-at')" sortable>
        <template #body="{ data }">{{ formatDate(data.startedAt) }}</template>
      </pv-column>
      <pv-column :header="t('spray-sessions.hvof-system')">
        <template #body="{ data }">{{ systemCode(data.hvofSystemId) }}</template>
      </pv-column>
      <pv-column :header="t('spray-sessions.recuperation')">
        <template #body="{ data }">{{ workOrder(data.recuperationId) }}</template>
      </pv-column>
      <pv-column :header="t('spray-sessions.recipe')">
        <template #body="{ data }">#{{ data.recipeNumber }}</template>
      </pv-column>
      <pv-column :header="t('spray-sessions.status')">
        <template #body="{ data }"><pv-tag :value="t('spray-sessions.status-option.' + data.status)" :severity="statusSeverity(data.status)"/></template>
      </pv-column>
      <pv-column :header="t('spray-sessions.deviations')" style="width: 7rem">
        <template #body="{ data }">{{ deviationsOf(data.id) }}</template>
      </pv-column>
      <pv-column :header="t('spray-sessions.actions')" style="width: 5rem">
        <template #body="{ data }"><pv-button icon="pi pi-chart-line" text rounded v-tooltip.top="t('spray-sessions.open')" @click="openSession(data.id)"/></template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
