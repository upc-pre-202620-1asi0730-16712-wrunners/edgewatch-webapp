<script setup lang="js">
import {computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {ROLE} from "@/iam/domain/model/role.entity.js";

const {t} = useI18n();
const router = useRouter();
const store = useEquipmentStore();
const iam = useIamStore();

const systems = computed(() => store.hvofSystems);
const statusSeverity = (status) => ({ACTIVE: "success", MAINTENANCE: "warn", OUT_OF_SERVICE: "danger"}[status] ?? "secondary");

const navigateToNew = () => router.push({name: "equipment-hvof-system-new"});
const view = (id) => router.push({name: "equipment-hvof-system-detail", params: {id}});
const edit = (id) => router.push({name: "equipment-hvof-system-edit", params: {id}});

onMounted(() => store.fetchAll());
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('hvof-systems.title') }}</h1>
      <pv-button v-if="iam.hasRole(ROLE.ORG_ADMIN, ROLE.MAINTENANCE_SUPERVISOR, ROLE.QUALITY_ENGINEER)" :label="t('hvof-systems.new')" icon="pi pi-plus" @click="navigateToNew"/>
    </div>
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="systems" :loading="!store.hvofSystemsLoaded" paginator :rows="10" sort-field="code" :sort-order="1" striped-rows>
      <template #empty>{{ t('hvof-systems.empty') }}</template>
      <pv-column field="code" :header="t('hvof-systems.code')" sortable/>
      <pv-column field="systemManufacturer" :header="t('hvof-systems.manufacturer')"/>
      <pv-column field="systemModel" :header="t('hvof-systems.model')"/>
      <pv-column :header="t('hvof-systems.fuel-type')">
        <template #body="{ data }">{{ t('hvof-system.fuel-option.' + data.fuelType) }}</template>
      </pv-column>
      <pv-column :header="t('hvof-systems.status')">
        <template #body="{ data }"><pv-tag :value="t('hvof-system.status-option.' + data.status)" :severity="statusSeverity(data.status)"/></template>
      </pv-column>
      <pv-column :header="t('hvof-systems.actions')" style="width: 8rem">
        <template #body="{ data }">
          <pv-button icon="pi pi-eye" text rounded v-tooltip.top="t('common.view')" @click="view(data.id)"/>
          <pv-button icon="pi pi-pencil" text rounded v-tooltip.top="t('common.edit')" @click="edit(data.id)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
