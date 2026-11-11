<script setup lang="js">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useFaultDiagnosisStore from "@/fault-diagnosis/application/fault-diagnosis.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {FAULT_CASE_STATUSES} from "@/fault-diagnosis/domain/model/fault-case.entity.js";
import ResolveFaultCaseDialog from "@/fault-diagnosis/presentation/components/resolve-fault-case-dialog.vue";

/**
 * Fault cases of the organization with status and session filters, acknowledge and resolve actions.
 */
const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useFaultDiagnosisStore();
const equipment = useEquipmentStore();
const iam = useIamStore();

const filters = reactive({status: "open", spraySessionId: route.query.spraySessionId ? parseInt(route.query.spraySessionId) : null});
const statusOptions = computed(() => [{value: null, label: t("fault-cases.all-statuses")}, ...FAULT_CASE_STATUSES.map(value => ({value, label: t("fault-cases.status-option." + value)}))]);
const resolveVisible = ref(false);
const resolving = ref(null);

const load = () => store.fetchFaultCases({
    ...(filters.status ? {status: filters.status} : {}),
    ...(filters.spraySessionId ? {spraySessionId: filters.spraySessionId} : {})
});
watch(filters, load);

const systemCode = (id) => equipment.getHvofSystemById(id)?.code ?? `#${id}`;
const format = (v) => Number(v).toLocaleString("es-PE", {maximumFractionDigits: 1});
const formatDate = (d) => d ? new Date(d).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"}) : "–";
const statusSeverity = (status) => ({open: "danger", acknowledged: "warn", resolved: "success"}[status]);
const userName = (id) => id === null ? "–" : (iam.users.find(u => u.id === id)?.fullName ?? `#${id}`);

const acknowledge = (c) => store.acknowledgeCase(c.id);
const openResolve = (c) => { resolving.value = c; resolveVisible.value = true; };
const resolve = (notes) => resolving.value && store.resolveCase(resolving.value.id, notes);
const openSession = (id) => router.push({name: "process-monitoring-session-detail", params: {id}});
const clearSession = () => { filters.spraySessionId = null; router.replace({query: {}}); };

onMounted(() => { load(); equipment.fetchAll(); if (iam.isAdmin) iam.fetchUsersAndRoles(); });
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('fault-cases.title') }}</h1>
      <pv-button v-if="iam.isAdmin" :label="t('fault-cases.manage-rules')" icon="pi pi-sliders-h" outlined @click="router.push({name: 'fault-diagnosis-rules'})"/>
    </div>
    <div class="flex flex-wrap align-items-center gap-2 mb-3">
      <pv-select v-model="filters.status" :options="statusOptions" option-label="label" option-value="value" class="w-12rem"/>
      <pv-chip v-if="filters.spraySessionId" :label="t('fault-cases.session') + ' #' + filters.spraySessionId" removable @remove="clearSession"/>
      <pv-button icon="pi pi-refresh" text rounded v-tooltip.top="t('fault-cases.refresh')" @click="load"/>
    </div>
    <pv-message v-if="store.error" severity="error" class="mb-3">{{ store.error }}</pv-message>

    <pv-data-table :value="store.faultCases" :loading="!store.faultCasesLoaded" paginator :rows="10" sort-field="epochMillis" :sort-order="-1" striped-rows>
      <template #empty>{{ t('fault-cases.empty') }}</template>
      <pv-column field="epochMillis" :header="t('fault-cases.detected-at')" sortable>
        <template #body="{ data }">{{ formatDate(data.detectedAt) }}</template>
      </pv-column>
      <pv-column :header="t('fault-cases.session')">
        <template #body="{ data }"><pv-button :label="'#' + data.spraySessionId" link class="p-0" @click="openSession(data.spraySessionId)"/></template>
      </pv-column>
      <pv-column :header="t('fault-cases.system')"><template #body="{ data }">{{ systemCode(data.hvofSystemId) }}</template></pv-column>
      <pv-column :header="t('fault-cases.parameter')"><template #body="{ data }">{{ t('session-detail.parameter.' + data.parameter) }}</template></pv-column>
      <pv-column :header="t('fault-cases.band')">
        <template #body="{ data }"><pv-tag :value="t('session-detail.band.' + data.band)" :severity="data.band === 'shutdown' ? 'danger' : 'warn'"/></template>
      </pv-column>
      <pv-column :header="t('fault-cases.value')"><template #body="{ data }">{{ format(data.value) }}</template></pv-column>
      <pv-column field="probableCause" :header="t('fault-cases.probable-cause')"/>
      <pv-column field="recommendedAction" :header="t('fault-cases.recommended-action')"/>
      <pv-column :header="t('fault-cases.status')">
        <template #body="{ data }">
          <pv-tag :value="t('fault-cases.status-option.' + data.status)" :severity="statusSeverity(data.status)"/>
          <div v-if="data.status !== 'open'" class="text-xs text-color-secondary mt-1">{{ userName(data.resolvedBy ?? data.acknowledgedBy) }}</div>
        </template>
      </pv-column>
      <pv-column :header="t('fault-cases.actions')" style="width: 7rem">
        <template #body="{ data }">
          <pv-button v-if="data.status === 'open'" icon="pi pi-eye" text rounded v-tooltip.top="t('fault-cases.acknowledge')" @click="acknowledge(data)"/>
          <pv-button v-if="data.status !== 'resolved'" icon="pi pi-check-circle" text rounded severity="success" v-tooltip.top="t('fault-cases.resolve')" @click="openResolve(data)"/>
        </template>
      </pv-column>
    </pv-data-table>
    <resolve-fault-case-dialog v-model:visible="resolveVisible" @confirm="resolve"/>
  </section>
</template>

<style scoped>
</style>
