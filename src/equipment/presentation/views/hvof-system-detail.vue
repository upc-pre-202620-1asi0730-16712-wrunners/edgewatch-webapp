<script setup lang="js">
import {computed, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = computed(() => parseInt(route.params.id));
const system = computed(() => store.getHvofSystemById(systemId.value));
const controllers = computed(() => store.controllersOf(systemId.value));

const back = () => router.push({name: "equipment-hvof-systems"});
const newController = () => router.push({name: "equipment-controller-new", params: {id: systemId.value}});
const editController = (controllerId) => router.push({name: "equipment-controller-edit", params: {id: systemId.value, controllerId}});

onMounted(() => store.fetchAll());
</script>

<template>
  <section class="p-4 md:p-5">
    <pv-button :label="t('hvof-system.back')" icon="pi pi-arrow-left" text @click="back"/>
    <template v-if="system">
      <h1 class="mt-2 mb-1 text-3xl font-bold text-color">{{ system.displayName }}</h1>
      <div class="flex flex-wrap gap-2 mb-3">
        <pv-chip :label="t('hvof-system.fuel-option.' + system.fuelType)" icon="pi pi-bolt"/>
        <pv-chip :label="t('hvof-system.status-option.' + system.status)" icon="pi pi-circle-fill"/>
        <pv-chip :label="'S/N ' + system.serialNumber"/>
      </div>

      <pv-tabs value="controllers">
        <pv-tab-list>
          <pv-tab value="controllers">{{ t('hvof-system.tab-controllers') }}</pv-tab>
        </pv-tab-list>
        <pv-tab-panels>
          <pv-tab-panel value="controllers">
            <div class="flex flex-column gap-3 align-items-start">
              <p v-if="controllers.length === 0" class="m-0 text-color-secondary">{{ t('controllers.empty') }}</p>
              <pv-data-table v-else :value="controllers" class="w-full" striped-rows>
                <pv-column field="controllerNumber" :header="t('controllers.number')" style="width: 4rem"/>
                <pv-column field="deviceType" :header="t('controllers.device-type')"/>
                <pv-column field="manufacturer" :header="t('controllers.manufacturer')"/>
                <pv-column field="model" :header="t('controllers.model')"/>
                <pv-column :header="t('controllers.ip-address')">
                  <template #body="{ data }">{{ data.ipAddress }}:{{ data.port }}</template>
                </pv-column>
                <pv-column :header="t('controllers.protocols')">
                  <template #body="{ data }">
                    <div class="flex flex-wrap gap-1">
                      <pv-tag v-for="p in data.protocolNames" :key="p" :value="p" severity="secondary"/>
                    </div>
                  </template>
                </pv-column>
                <pv-column :header="t('controllers.actions')" style="width: 5rem">
                  <template #body="{ data }">
                    <pv-button icon="pi pi-pencil" text rounded @click="editController(data.id)"/>
                  </template>
                </pv-column>
              </pv-data-table>
              <pv-button :label="t('controllers.new')" icon="pi pi-plus" @click="newController"/>
            </div>
          </pv-tab-panel>
        </pv-tab-panels>
      </pv-tabs>
    </template>
  </section>
</template>

<style scoped>
</style>
