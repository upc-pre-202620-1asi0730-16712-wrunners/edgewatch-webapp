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

const components = computed(() => store.organizationComponents);
const loaded = computed(() => store.componentsLoaded && store.customersLoaded);
const canManage = computed(() => iam.hasRole(ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR, ROLE.HVOF_OPERATOR, ROLE.QUALITY_ENGINEER));

const navigateToNew = () => router.push({name: "traceability-component-new"});
const navigateToEdit = (id) => router.push({name: "traceability-component-edit", params: {id}});

const statusSeverity = (status) => ({
    RECEIVED: "info", IN_RECUPERATION: "warn", IN_SERVICE: "success", RETURNED: "secondary", SCRAPPED: "danger"
}[status] ?? "secondary");

onMounted(() => {
    if (!store.customersLoaded) store.fetchCustomers();
    if (!store.componentsLoaded) store.fetchComponents();
});
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('components.title') }}</h1>
      <pv-button v-if="canManage" :label="t('components.new')" icon="pi pi-plus" @click="navigateToNew"/>
    </div>
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="components" :loading="!loaded" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                   sort-field="serialNumber" :sort-order="1" striped-rows responsive-layout="scroll">
      <template #empty>{{ t('components.empty') }}</template>
      <pv-column field="serialNumber" :header="t('components.serial-number')" sortable/>
      <pv-column field="partNumber" :header="t('components.part-number')"/>
      <pv-column :header="t('components.type')">
        <template #body="{ data }">{{ t('component.type-option.' + data.componentType) }}</template>
      </pv-column>
      <pv-column field="machine" :header="t('components.machine')"/>
      <pv-column :header="t('components.customer')">
        <template #body="{ data }">{{ store.customerNameOf(data.customerId) }}</template>
      </pv-column>
      <pv-column field="pcrTargetHours" :header="t('components.pcr-target-hours')" sortable/>
      <pv-column :header="t('components.status')">
        <template #body="{ data }">
          <pv-tag :value="t('component.status-option.' + data.status)" :severity="statusSeverity(data.status)"/>
        </template>
      </pv-column>
      <pv-column v-if="canManage" :header="t('components.actions')" style="width: 6rem">
        <template #body="{ data }">
          <pv-button icon="pi pi-pencil" text rounded :aria-label="t('common.edit')" v-tooltip.top="t('common.edit')" @click="navigateToEdit(data.id)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
