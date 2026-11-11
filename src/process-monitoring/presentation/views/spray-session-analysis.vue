<script setup lang="js">
import {computed, onMounted, onUnmounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import NormalizedDeviationChart from "@/process-monitoring/presentation/components/normalized-deviation-chart.vue";
import BandDistributionChart from "@/process-monitoring/presentation/components/band-distribution-chart.vue";
import {complianceOf, groupByParameter, statisticsOf} from "@/process-monitoring/domain/model/reading-series.js";
import {downloadCsv, toCsv} from "@/shared/infrastructure/csv-exporter.js";

/**
 * Analysis of a spray session against its recipe: compliance, statistics per parameter, deviations and CSV export.
 */
const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useProcessMonitoringStore();
const equipment = useEquipmentStore();
const traceability = useTraceabilityStore();

const sessionId = computed(() => parseInt(route.params.id));
const session = computed(() => store.getSessionById(sessionId.value));
const system = computed(() => session.value ? equipment.getHvofSystemById(session.value.hvofSystemId) : null);
const recuperation = computed(() => session.value ? traceability.getRecuperationById(session.value.recuperationId) : null);
const recipe = computed(() => session.value ? equipment.recipeByNumber(session.value.hvofSystemId, session.value.recipeNumber) : null);

const compliance = computed(() => complianceOf(store.readings));
const deviations = computed(() => store.readings.filter(r => r.band === "warning" || r.band === "shutdown"));

const statistics = computed(() => [...groupByParameter(store.readings).entries()].map(([parameter, list]) => {
    const p = recipe.value?.parameterFor(parameter);
    return {parameter, label: t("session-detail.parameter." + parameter), unit: list[0]?.unitSymbol ?? p?.unitSymbol ?? "",
        setpoint: p?.setpoint ?? null, nominalMin: p?.nominalMin ?? null, nominalMax: p?.nominalMax ?? null, compliance: complianceOf(list), ...statisticsOf(list)};
}));

const format = (v, digits = 1) => v === null || v === undefined ? "–" : Number(v).toLocaleString("es-PE", {maximumFractionDigits: digits});
const formatDate = (iso) => iso ? new Date(iso).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"}) : "";
const formatTime = (ms) => new Date(ms).toLocaleTimeString("es-PE");
const complianceSeverity = (value) => value === null ? "secondary" : value >= 95 ? "success" : value >= 80 ? "warn" : "danger";

const exportReadings = () => downloadCsv(`edgewatch-session-${sessionId.value}-readings.csv`, toCsv(store.readings, [
    {key: "epochMillis", header: "timestamp", value: r => new Date(r.epochMillis).toISOString()},
    {key: "parameter", header: "parameter"}, {key: "value", header: "value"}, {key: "unitSymbol", header: "unit"},
    {key: "band", header: "band"}, {key: "tagPath", header: "tag_path"}
]));

const exportStatistics = () => downloadCsv(`edgewatch-session-${sessionId.value}-statistics.csv`, toCsv(statistics.value, [
    {key: "parameter", header: "parameter"}, {key: "unit", header: "unit"}, {key: "count", header: "count"},
    {key: "min", header: "min"}, {key: "max", header: "max"}, {key: "mean", header: "mean"}, {key: "stdDev", header: "std_dev"},
    {key: "setpoint", header: "setpoint"}, {key: "nominalMin", header: "nominal_min"}, {key: "nominalMax", header: "nominal_max"},
    {key: "compliance", header: "compliance_percent"}
]));

const back = () => router.push({name: "process-monitoring-session-detail", params: {id: sessionId.value}});

onMounted(() => {
    (store.sessionsLoaded ? Promise.resolve() : store.fetchSessions()).then(() => store.loadReadings(sessionId.value));
    equipment.fetchAll();
    traceability.fetchAll();
});
onUnmounted(() => store.clearReadings());
</script>

<template>
  <section class="p-4 md:p-5">
    <pv-button :label="t('analysis.back')" icon="pi pi-arrow-left" text @click="back"/>
    <template v-if="session">
      <div class="flex align-items-center justify-content-between flex-wrap gap-2 mt-2 mb-3">
        <h1 class="m-0 text-3xl font-bold text-color">{{ t('analysis.title') }} #{{ session.id }}</h1>
        <div class="flex gap-2">
          <pv-button :label="t('analysis.export-readings')" icon="pi pi-download" outlined :disabled="!store.readings.length" @click="exportReadings"/>
          <pv-button :label="t('analysis.export-statistics')" icon="pi pi-file-excel" outlined :disabled="!statistics.length" @click="exportStatistics"/>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-3">
        <pv-chip :label="t('session-detail.system') + ': ' + (system?.code ?? session.hvofSystemId)"/>
        <pv-chip :label="t('session-detail.order') + ': ' + (recuperation?.workOrderNumber ?? session.recuperationId)"/>
        <pv-chip :label="t('session-detail.recipe') + ': #' + session.recipeNumber + ' ' + (recipe?.name ?? '')"/>
        <pv-chip :label="t('session-detail.started') + ': ' + formatDate(session.startedAt)"/>
        <pv-tag :value="t('spray-sessions.status-option.' + session.status)"/>
      </div>

      <div class="grid mb-2">
        <div class="col-6 md:col-3"><pv-card><template #content>
          <div class="text-color-secondary text-sm">{{ t('analysis.compliance') }}</div>
          <div class="text-3xl font-bold"><pv-tag :value="format(compliance) + ' %'" :severity="complianceSeverity(compliance)" class="text-xl"/></div>
        </template></pv-card></div>
        <div class="col-6 md:col-3"><pv-card><template #content>
          <div class="text-color-secondary text-sm">{{ t('analysis.duration') }}</div>
          <div class="text-3xl font-bold">{{ session.durationMinutes }} <span class="text-base font-normal">min</span></div>
        </template></pv-card></div>
        <div class="col-6 md:col-3"><pv-card><template #content>
          <div class="text-color-secondary text-sm">{{ t('analysis.readings') }}</div>
          <div class="text-3xl font-bold">{{ store.readings.length }}</div>
        </template></pv-card></div>
        <div class="col-6 md:col-3"><pv-card><template #content>
          <div class="text-color-secondary text-sm">{{ t('analysis.deviations') }}</div>
          <div class="text-3xl font-bold" :class="deviations.length ? 'text-red-600' : ''">{{ deviations.length }}</div>
        </template></pv-card></div>
      </div>

      <div class="grid">
        <div class="col-12 lg:col-8">
          <pv-card>
            <template #title><span class="text-base">{{ t('analysis.normalized-title') }}</span></template>
            <template #subtitle>{{ t('analysis.normalized-hint') }}</template>
            <template #content><normalized-deviation-chart :readings="store.readings" :recipe="recipe"/></template>
          </pv-card>
        </div>
        <div class="col-12 lg:col-4">
          <pv-card>
            <template #title><span class="text-base">{{ t('charts.band-distribution') }}</span></template>
            <template #content><band-distribution-chart :counts="store.bandCounts" height="300px"/></template>
          </pv-card>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-4 mb-2">{{ t('analysis.statistics-title') }}</h2>
      <pv-data-table :value="statistics" size="small" striped-rows>
        <template #empty>{{ t('charts.no-data') }}</template>
        <pv-column field="label" :header="t('analysis.parameter')"/>
        <pv-column field="unit" :header="t('analysis.unit')"/>
        <pv-column field="count" :header="t('analysis.count')"/>
        <pv-column :header="t('analysis.min')"><template #body="{ data }">{{ format(data.min) }}</template></pv-column>
        <pv-column :header="t('analysis.mean')"><template #body="{ data }">{{ format(data.mean) }}</template></pv-column>
        <pv-column :header="t('analysis.max')"><template #body="{ data }">{{ format(data.max) }}</template></pv-column>
        <pv-column :header="t('analysis.std-dev')"><template #body="{ data }">{{ format(data.stdDev, 2) }}</template></pv-column>
        <pv-column :header="t('analysis.setpoint')"><template #body="{ data }">{{ format(data.setpoint) }}</template></pv-column>
        <pv-column :header="t('analysis.nominal-range')"><template #body="{ data }">{{ format(data.nominalMin) }} – {{ format(data.nominalMax) }}</template></pv-column>
        <pv-column :header="t('analysis.compliance')"><template #body="{ data }"><pv-tag :value="format(data.compliance) + ' %'" :severity="complianceSeverity(data.compliance)"/></template></pv-column>
      </pv-data-table>

      <h2 class="text-xl font-semibold mt-4 mb-2">{{ t('analysis.deviations-title') }}</h2>
      <pv-data-table :value="deviations" size="small" paginator :rows="10" striped-rows>
        <template #empty>{{ t('analysis.no-deviations') }}</template>
        <pv-column :header="t('analysis.time')"><template #body="{ data }">{{ formatTime(data.epochMillis) }}</template></pv-column>
        <pv-column :header="t('analysis.parameter')"><template #body="{ data }">{{ t('session-detail.parameter.' + data.parameter) }}</template></pv-column>
        <pv-column :header="t('analysis.value')"><template #body="{ data }">{{ format(data.value) }} {{ data.unitSymbol }}</template></pv-column>
        <pv-column :header="t('analysis.band')"><template #body="{ data }"><pv-tag :value="t('session-detail.band.' + data.band)" :severity="data.band === 'shutdown' ? 'danger' : 'warn'"/></template></pv-column>
        <pv-column field="tagPath" :header="t('analysis.tag')"/>
      </pv-data-table>
    </template>
  </section>
</template>

<style scoped>
</style>
