<script setup lang="js">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {Recuperation} from "@/traceability/domain/model/recuperation.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTraceabilityStore();
const iam = useIamStore();

const recuperationId = route.params.id ? parseInt(route.params.id) : null;
const isEdit = computed(() => recuperationId !== null);
const submitted = ref(false);
const weightUnits = ["kg", "lb"];

const form = reactive({
    componentId: null, customerId: null, workOrderNumber: "", manufacturingOrderNumber: "", segment: "Mining", operation: "",
    weightValue: 0, weightUnitSymbol: "kg", hourmeterAtEntry: 0, powderSupplier: "", powderLotNumber: "",
    powderChemicalComposition: "", receivedAt: new Date()
});

const componentOptions = computed(() => store.organizationComponents.map(c => ({value: c.id, label: `${c.serialNumber} · ${c.machineModel}`})));
const customerOptions = computed(() => store.customers.map(c => ({value: c.id, label: c.legalName})));

/** The customer always follows the selected component. */
watch(() => form.componentId, (componentId) => {
    form.customerId = componentId ? (store.getComponentById(componentId)?.customerId ?? null) : null;
});

const required = (value) => value !== null && value !== undefined && String(value).trim().length > 0;
const formValid = computed(() =>
    form.componentId !== null && required(form.workOrderNumber) && required(form.manufacturingOrderNumber)
    && required(form.operation) && form.receivedAt instanceof Date);

const toIsoDate = (date) => date.toISOString().substring(0, 10);

const loadRecuperation = () => {
    const r = store.getRecuperationById(recuperationId);
    if (!r) return;
    Object.assign(form, {
        componentId: r.componentId, workOrderNumber: r.workOrderNumber, manufacturingOrderNumber: r.manufacturingOrderNumber,
        segment: r.segment, operation: r.operation, weightValue: r.weightValue, weightUnitSymbol: r.weightUnitSymbol,
        hourmeterAtEntry: r.hourmeterAtEntry, powderSupplier: r.powderSupplier, powderLotNumber: r.powderLotNumber,
        powderChemicalComposition: r.powderChemicalComposition, receivedAt: new Date(r.receivedAt + "T12:00:00")
    });
};

onMounted(() => {
    store.fetchAll();
    if (isEdit.value) {
        if (store.recuperationsLoaded && store.componentsLoaded) loadRecuperation();
        else {
            const stop = store.$subscribe(() => {
                if (store.recuperationsLoaded && store.componentsLoaded) { loadRecuperation(); stop(); }
            });
        }
    }
});

const back = () => router.push({name: "traceability-recuperations"});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getRecuperationById(recuperationId) : null;
    const recuperation = new Recuperation({
        id: recuperationId,
        workOrderNumber: form.workOrderNumber.trim(),
        manufacturingOrderNumber: form.manufacturingOrderNumber.trim(),
        componentId: form.componentId,
        customerId: form.customerId,
        supplierOrganizationId: existing?.supplierOrganizationId ?? iam.organizationId,
        segment: form.segment,
        operation: form.operation.trim(),
        weightValue: Number(form.weightValue),
        weightUnitSymbol: form.weightUnitSymbol,
        hourmeterAtEntry: Number(form.hourmeterAtEntry),
        powderSupplier: form.powderSupplier,
        powderLotNumber: form.powderLotNumber,
        powderChemicalComposition: form.powderChemicalComposition,
        status: existing?.status ?? "RECEIVED",
        receivedAt: toIsoDate(form.receivedAt),
        completedAt: existing?.completedAt ?? null,
        linkedSessions: existing?.linkedSessions ?? []
    });
    const action = isEdit.value ? store.updateRecuperation(recuperation) : store.addRecuperation(recuperation);
    action.then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'recuperation.edit-title' : 'recuperation.new-title') }}</h1>
    <form class="grid max-w-60rem" @submit.prevent="submit">
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-select input-id="componentId" v-model="form.componentId" :options="componentOptions" option-label="label" option-value="value" filter class="w-full" :invalid="submitted && form.componentId === null"/>
          <label for="componentId">{{ t('recuperation.component') }}</label>
        </pv-float-label>
        <small v-if="submitted && form.componentId === null" class="text-red-500">{{ t('recuperation.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-select input-id="customerId" v-model="form.customerId" :options="customerOptions" option-label="label" option-value="value" disabled class="w-full"/>
          <label for="customerId">{{ t('recuperation.customer') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="workOrderNumber" v-model="form.workOrderNumber" class="w-full" :invalid="submitted && !required(form.workOrderNumber)"/>
          <label for="workOrderNumber">{{ t('recuperation.work-order') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.workOrderNumber)" class="text-red-500">{{ t('recuperation.error.required') }}</small>
      </div>
      <div class="col-12 md:col-6 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="manufacturingOrderNumber" v-model="form.manufacturingOrderNumber" class="w-full" :invalid="submitted && !required(form.manufacturingOrderNumber)"/>
          <label for="manufacturingOrderNumber">{{ t('recuperation.manufacturing-order') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.manufacturingOrderNumber)" class="text-red-500">{{ t('recuperation.error.required') }}</small>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="segment" v-model="form.segment" class="w-full"/>
          <label for="segment">{{ t('recuperation.segment') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-8 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="operation" v-model="form.operation" class="w-full" :invalid="submitted && !required(form.operation)"/>
          <label for="operation">{{ t('recuperation.operation') }}</label>
        </pv-float-label>
        <small v-if="submitted && !required(form.operation)" class="text-red-500">{{ t('recuperation.error.required') }}</small>
      </div>
      <div class="col-6 md:col-3">
        <pv-float-label variant="on">
          <pv-input-number input-id="weightValue" v-model="form.weightValue" :min="0" :min-fraction-digits="0" :max-fraction-digits="2" class="w-full"/>
          <label for="weightValue">{{ t('recuperation.weight') }}</label>
        </pv-float-label>
      </div>
      <div class="col-6 md:col-2">
        <pv-float-label variant="on">
          <pv-select input-id="weightUnitSymbol" v-model="form.weightUnitSymbol" :options="weightUnits" class="w-full"/>
          <label for="weightUnitSymbol">{{ t('recuperation.weight-unit') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-3">
        <pv-float-label variant="on">
          <pv-input-number input-id="hourmeterAtEntry" v-model="form.hourmeterAtEntry" :min="0" :use-grouping="false" class="w-full"/>
          <label for="hourmeterAtEntry">{{ t('recuperation.hourmeter') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-date-picker input-id="receivedAt" v-model="form.receivedAt" date-format="yy-mm-dd" show-icon class="w-full"/>
          <label for="receivedAt">{{ t('recuperation.received-at') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="powderSupplier" v-model="form.powderSupplier" class="w-full"/>
          <label for="powderSupplier">{{ t('recuperation.powder-supplier') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="powderLotNumber" v-model="form.powderLotNumber" class="w-full"/>
          <label for="powderLotNumber">{{ t('recuperation.powder-lot') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="powderChemicalComposition" v-model="form.powderChemicalComposition" class="w-full"/>
          <label for="powderChemicalComposition">{{ t('recuperation.powder-composition') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 flex justify-content-end gap-2">
        <pv-button type="button" :label="t('recuperation.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('recuperation.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
