<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import {Component, COMPONENT_TYPES} from "@/traceability/domain/model/component.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTraceabilityStore();

const componentId = route.params.id ? parseInt(route.params.id) : null;
const isEdit = computed(() => componentId !== null);
const submitted = ref(false);

const form = reactive({
    serialNumber: "", partNumber: "", componentType: "HYDRAULIC_ROD",
    machineManufacturer: "", machineModel: "", customerId: null, pcrTargetHours: null
});

const typeOptions = computed(() => COMPONENT_TYPES.map(value => ({value, label: t("component.type-option." + value)})));
const customerOptions = computed(() => store.customers.map(c => ({value: c.id, label: c.legalName})));

const required = (value) => value !== null && value !== undefined && String(value).trim().length > 0;
const pcrValid = computed(() => Number(form.pcrTargetHours) > 0);
const formValid = computed(() =>
    required(form.serialNumber) && required(form.partNumber) && required(form.machineManufacturer)
    && required(form.machineModel) && form.customerId !== null && pcrValid.value);

const loadComponent = () => {
    const existing = store.getComponentById(componentId);
    if (existing) Object.assign(form, {
        serialNumber: existing.serialNumber, partNumber: existing.partNumber, componentType: existing.componentType,
        machineManufacturer: existing.machineManufacturer, machineModel: existing.machineModel,
        customerId: existing.customerId, pcrTargetHours: existing.pcrTargetHours
    });
};

onMounted(() => {
    if (!store.customersLoaded) store.fetchCustomers();
    if (!store.componentsLoaded) {
        store.fetchComponents();
        const stop = store.$subscribe(() => { if (store.componentsLoaded) { if (isEdit.value) loadComponent(); stop(); } });
    } else if (isEdit.value) {
        loadComponent();
    }
});

const back = () => router.push({name: "traceability-components"});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getComponentById(componentId) : null;
    const component = new Component({
        id: componentId,
        serialNumber: form.serialNumber.trim(),
        partNumber: form.partNumber.trim(),
        componentType: form.componentType,
        machineManufacturer: form.machineManufacturer.trim(),
        machineModel: form.machineModel.trim(),
        customerId: form.customerId,
        pcrTargetHours: Number(form.pcrTargetHours),
        status: existing?.status ?? "RECEIVED"
    });
    const action = isEdit.value ? store.updateComponent(component) : store.addComponent(component);
    action.then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'component.edit-title' : 'component.new-title') }}</h1>
    <form class="grid max-w-50rem" @submit.prevent="submit">
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="serialNumber" v-model="form.serialNumber" class="w-full" :invalid="submitted && !required(form.serialNumber)"/>
          <label for="serialNumber">{{ t('component.serial-number') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.serialNumber)" class="text-red-500">{{ t('component.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="partNumber" v-model="form.partNumber" class="w-full" :invalid="submitted && !required(form.partNumber)"/>
          <label for="partNumber">{{ t('component.part-number') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.partNumber)" class="text-red-500">{{ t('component.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-select input-id="componentType" v-model="form.componentType" :options="typeOptions" option-label="label" option-value="value" class="w-full"/>
          <label for="componentType">{{ t('component.type') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-select input-id="customerId" v-model="form.customerId" :options="customerOptions" option-label="label" option-value="value" class="w-full" :invalid="submitted && form.customerId === null"/>
          <label for="customerId">{{ t('component.customer') }}</label>
        </pv-float-label>
        <small v-if="submitted && form.customerId === null" class="text-red-500">{{ t('component.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="machineManufacturer" v-model="form.machineManufacturer" class="w-full" :invalid="submitted && !required(form.machineManufacturer)"/>
          <label for="machineManufacturer">{{ t('component.machine-manufacturer') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.machineManufacturer)" class="text-red-500">{{ t('component.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="machineModel" v-model="form.machineModel" class="w-full" :invalid="submitted && !required(form.machineModel)"/>
          <label for="machineModel">{{ t('component.machine-model') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.machineModel)" class="text-red-500">{{ t('component.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-number input-id="pcrTargetHours" v-model="form.pcrTargetHours" :min="1" :use-grouping="false" class="w-full" :invalid="submitted && !pcrValid"/>
          <label for="pcrTargetHours">{{ t('component.pcr-target-hours') }}</label>
        </pv-float-label>
        <small v-if="submitted && !pcrValid" class="text-red-500">{{ t('component.error.pcr-min') }}</small>
      </div>
      <div class="col-12 flex justify-content-end gap-2">
        <pv-button type="button" :label="t('component.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('component.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
