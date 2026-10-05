<script setup lang="js">
import {computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {ROLE} from "@/iam/domain/model/role.entity.js";

const {t} = useI18n();
const router = useRouter();
const store = useTraceabilityStore();
const iam = useIamStore();

const recuperations = computed(() => store.recuperations);
const loaded = computed(() => store.recuperationsLoaded && store.componentsLoaded && store.customersLoaded);
const canManage = computed(() => iam.hasRole(ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR));

const navigateToNew = () => router.push({name: "traceability-recuperation-new"});
const navigateToEdit = (id) => router.push({name: "traceability-recuperation-edit", params: {id}});

const statusSeverity = (status) => ({
    RECEIVED: "info", IN_PROGRESS: "warn", COMPLETED: "success", DELIVERED: "success", REWORK: "danger"
}[status] ?? "secondary");

onMounted(() => store.fetchAll());
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('recuperations.title') }}</h1>
      <pv-button v-if="canManage" :label="t('recuperations.new')" icon="pi pi-plus" @click="navigateToNew"/>
    </div>
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="recuperations" :loading="!loaded" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                   sort-field="receivedAt" :sort-order="-1" striped-rows responsive-layout="scroll">
      <template #empty>{{ t('recuperations.empty') }}</template>
      <pv-column field="workOrderNumber" :header="t('recuperations.work-order')" sortable/>
      <pv-column field="manufacturingOrderNumber" :header="t('recuperations.manufacturing-order')"/>
      <pv-column :header="t('recuperations.component')">
        <template #body="{ data }">{{ store.componentSerialOf(data.componentId) }}</template>
      </pv-column>
      <pv-column :header="t('recuperations.customer')">
        <template #body="{ data }">{{ store.customerNameOf(data.customerId) }}</template>
      </pv-column>
      <pv-column :header="t('recuperations.status')">
        <template #body="{ data }">
          <pv-tag :value="t('recuperation.status-option.' + data.status)" :severity="statusSeverity(data.status)"/>
        </template>
      </pv-column>
      <pv-column field="receivedAt" :header="t('recuperations.received-at')" sortable/>
      <pv-column v-if="canManage" :header="t('recuperations.actions')" style="width: 6rem">
        <template #body="{ data }">
          <pv-button icon="pi pi-pencil" text rounded :aria-label="t('common.edit')" v-tooltip.top="t('common.edit')" @click="navigateToEdit(data.id)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
