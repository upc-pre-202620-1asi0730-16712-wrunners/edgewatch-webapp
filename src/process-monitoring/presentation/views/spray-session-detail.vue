<script setup lang="js">
import {computed, onMounted, onUnmounted, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import ParameterCard from "@/process-monitoring/presentation/components/parameter-card.vue";
import {classify, ProcessReading} from "@/process-monitoring/domain/model/process-reading.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useProcessMonitoringStore();
const equipment = useEquipmentStore();
const traceability = useTraceabilityStore();

const isDev = import.meta.env.DEV;
const sessionId = computed(() => parseInt(route.params.id));
const session = computed(() => store.getSessionById(sessionId.value));
const system = computed(() => session.value ? equipment.getHvofSystemById(session.value.hvofSystemId) : null);
const recuperation = computed(() => session.value ? traceability.getRecuperationById(session.value.recuperationId) : null);
const recipe = computed(() => session.value ? equipment.recipeByNumber(session.value.hvofSystemId, session.value.recipeNumber) : null);
const cards = computed(() => [...store.latestByParameter.values()]);

const formatDate = (iso) => iso ? new Date(iso).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"}) : "";
const formatTime = (d) => d ? d.toLocaleTimeString("es-PE") : "";

/** Polls while the session is active, loads once otherwise. */
watch(session, (s, previous) => {
    if (!s || (previous && previous.id === s.id && previous.status === s.status)) return;
    s.isActive ? store.startPolling(s.id) : (store.stopPolling(), store.loadReadings(s.id));
}, {immediate: true});

const recipeParameterOf = (parameter) => recipe.value?.parameterFor(parameter) ?? null;

const simulateReading = () => {
    const s = session.value, r = recipe.value;
    if (!s || !r || r.parameters.length === 0) return;
    const p = r.parameters[Math.floor(Math.random() * r.parameters.length)];
    const spread = (p.upperShutdown - p.lowerShutdown) * 0.35;
    const value = Math.round((p.setpoint + (Math.random() - 0.5) * spread) * 10) / 10;
    const mapping = system.value?.tagMappings.find(m => m.parameter === p.parameter);
    store.addReading(new ProcessReading({
        spraySessionId: s.id, epochMillis: Date.now(), tagPath: mapping?.tagPath ?? p.parameter, parameter: p.parameter,
        subsystemId: mapping?.subsystemId ?? null, partId: mapping?.partId ?? null, value,
        unitSymbol: p.unitSymbol, unitCategory: p.unitCategory, band: classify(value, p), mappingPending: !mapping
    }));
};

const back = () => router.push({name: "process-monitoring-spray-sessions"});

onMounted(() => {
    if (!store.sessionsLoaded) store.fetchSessions();
    equipment.fetchAll();
    traceability.fetchAll();
});
onUnmounted(() => store.clearReadings());
</script>

<template>
  <section class="p-4 md:p-5">
    <pv-button :label="t('session-detail.back')" icon="pi pi-arrow-left" text @click="back"/>
    <template v-if="session">
      <h1 class="mt-2 mb-2 text-3xl font-bold text-color flex align-items-center gap-3">
        {{ t('session-detail.title') }} #{{ session.id }}
        <span v-if="session.isActive" class="live text-sm">● {{ t('session-detail.live') }}</span>
      </h1>
      <div class="flex flex-wrap gap-2 mb-3">
        <pv-chip :label="t('session-detail.system') + ': ' + (system?.code ?? session.hvofSystemId)"/>
        <pv-chip :label="t('session-detail.order') + ': ' + (recuperation?.workOrderNumber ?? session.recuperationId)"/>
        <pv-chip :label="t('session-detail.recipe') + ': #' + session.recipeNumber + ' ' + (recipe?.name ?? '')"/>
        <pv-chip :label="t('session-detail.started') + ': ' + formatDate(session.startedAt)"/>
        <pv-chip v-if="session.endedAt" :label="t('session-detail.ended') + ': ' + formatDate(session.endedAt)"/>
        <pv-tag :value="t('spray-sessions.status-option.' + session.status)"/>
      </div>

      <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>

      <div class="flex align-items-center flex-wrap gap-2 mb-3 text-sm">
        <span>{{ store.readings.length }} {{ t('session-detail.readings') }}</span>
        <span class="dot band-nominal"></span>{{ store.bandCounts.nominal }}
        <span class="dot band-out_of_nominal"></span>{{ store.bandCounts.out_of_nominal }}
        <span class="dot band-warning"></span>{{ store.bandCounts.warning }}
        <span class="dot band-shutdown"></span>{{ store.bandCounts.shutdown }}
        <span v-if="store.lastUpdate" class="text-color-secondary">· {{ t('session-detail.last-update') }} {{ formatTime(store.lastUpdate) }}</span>
      </div>

      <p v-if="cards.length === 0" class="text-color-secondary">{{ t('session-detail.no-readings') }}</p>
      <div class="grid">
        <div v-for="reading in cards" :key="reading.parameter" class="col-12 md:col-6 lg:col-4 xl:col-3">
          <parameter-card :reading="reading" :recipe-parameter="recipeParameterOf(reading.parameter)"/>
        </div>
      </div>

      <div v-if="session.isActive" class="flex gap-2 mt-3">
        <pv-button v-if="isDev" :label="t('session-detail.simulate')" icon="pi pi-wifi" outlined @click="simulateReading"/>
      </div>
    </template>
  </section>
</template>

<style scoped>
.live { color: #b91c1c; animation: blink 1.2s infinite; }
@keyframes blink { 50% { opacity: .3; } }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-left: 8px; }
.band-nominal { background: #15803d; } .band-out_of_nominal { background: #ca8a04; }
.band-warning { background: #ea580c; } .band-shutdown { background: #b91c1c; }
</style>
