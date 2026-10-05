<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {FUEL_TYPES, HvofSystem} from "@/equipment/domain/model/hvof-system.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = route.params.id ? parseInt(route.params.id) : null;
const isEdit = computed(() => systemId !== null);
const submitted = ref(false);

const form = reactive({code: "", serialNumber: "", systemManufacturer: "", systemModel: "", fuelType: "HYDROGEN"});
const fuelOptions = computed(() => FUEL_TYPES.map(value => ({value, label: t("hvof-system.fuel-option." + value)})));

const required = (v) => String(v ?? "").trim().length > 0;
const formValid = computed(() => required(form.code) && required(form.serialNumber) && required(form.systemManufacturer) && required(form.systemModel));

const load = () => {
    const s = store.getHvofSystemById(systemId);
    if (s) Object.assign(form, {code: s.code, serialNumber: s.serialNumber, systemManufacturer: s.systemManufacturer, systemModel: s.systemModel, fuelType: s.fuelType});
};

onMounted(() => {
    if (store.hvofSystemsLoaded) { if (isEdit.value) load(); return; }
    store.fetchHvofSystems();
    const stop = store.$subscribe(() => { if (store.hvofSystemsLoaded) { if (isEdit.value) load(); stop(); } });
});

const back = () => router.push({name: "equipment-hvof-systems"});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getHvofSystemById(systemId) : null;
    const system = new HvofSystem({
        id: systemId,
        code: form.code.trim(),
        organizationId: existing?.organizationId ?? 1,
        serialNumber: form.serialNumber.trim(),
        status: existing?.status ?? "ACTIVE",
        systemManufacturer: form.systemManufacturer.trim(),
        systemModel: form.systemModel.trim(),
        fuelType: form.fuelType,
        tagMappings: existing?.tagMappings ?? []
    });
    (isEdit.value ? store.updateHvofSystem(system) : store.addHvofSystem(system)).then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'hvof-system.edit-title' : 'hvof-system.new-title') }}</h1>
    <form class="grid max-w-40rem" @submit.prevent="submit">
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="code" v-model="form.code" placeholder="HVOF-01" class="w-full" :invalid="submitted && !required(form.code)"/>
          <label for="code">{{ t('hvof-system.code') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="serialNumber" v-model="form.serialNumber" class="w-full" :invalid="submitted && !required(form.serialNumber)"/>
          <label for="serialNumber">{{ t('hvof-system.serial-number') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="systemManufacturer" v-model="form.systemManufacturer" class="w-full" :invalid="submitted && !required(form.systemManufacturer)"/>
          <label for="systemManufacturer">{{ t('hvof-system.manufacturer') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="systemModel" v-model="form.systemModel" class="w-full" :invalid="submitted && !required(form.systemModel)"/>
          <label for="systemModel">{{ t('hvof-system.model') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-select id="fuelType" v-model="form.fuelType" :options="fuelOptions" option-label="label" option-value="value" class="w-full"/>
          <label for="fuelType">{{ t('hvof-system.fuel-type') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 flex justify-content-end gap-2">
        <pv-button type="button" :label="t('hvof-system.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('hvof-system.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
