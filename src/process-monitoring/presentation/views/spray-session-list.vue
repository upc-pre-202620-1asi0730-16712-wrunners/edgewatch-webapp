<script setup lang="js">
import {computed, onMounted} from "vue";
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

const sessions = computed(() => store.sessions);
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
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="sessions" :loading="!store.sessionsLoaded" paginator :rows="10" sort-field="startedAt" :sort-order="-1" striped-rows>
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
      <pv-column :header="t('spray-sessions.actions')" style="width: 5rem">
        <template #body="{ data }"><pv-button icon="pi pi-chart-line" text rounded v-tooltip.top="t('spray-sessions.open')" @click="openSession(data.id)"/></template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
