<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {Controller, DEVICE_TYPES, PROTOCOLS} from "@/equipment/domain/model/controller.entity.js";

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = parseInt(route.params.id);
const controllerId = route.params.controllerId ? parseInt(route.params.controllerId) : null;
const isEdit = computed(() => controllerId !== null);
const submitted = ref(false);

const form = reactive({
    deviceType: "PLC", manufacturer: "", model: "", partNumber: "", serialNumber: "",
    ipAddress: "", port: 44818, rack: 0, slot: 0, supportedProtocols: ["ETHERNET_IP"]
});

const required = (v) => String(v ?? "").trim().length > 0;
const ipValid = computed(() => IPV4.test(form.ipAddress));
const formValid = computed(() => required(form.manufacturer) && required(form.model) && required(form.serialNumber) && ipValid.value && form.supportedProtocols.length > 0);

const load = () => {
    const c = store.getControllerById(controllerId);
    if (c) Object.assign(form, {
        deviceType: c.deviceType, manufacturer: c.manufacturer, model: c.model, partNumber: c.partNumber, serialNumber: c.serialNumber,
        ipAddress: c.ipAddress, port: c.port, rack: c.rack, slot: c.slot, supportedProtocols: c.protocolNames
    });
};

onMounted(() => {
    store.fetchAll();
    if (!isEdit.value) return;
    if (store.controllersLoaded) load();
    else { const stop = store.$subscribe(() => { if (store.controllersLoaded) { load(); stop(); } }); }
});

const back = () => router.push({name: "equipment-hvof-system-detail", params: {id: systemId}});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getControllerById(controllerId) : null;
    const controller = new Controller({
        id: controllerId,
        hvofSystemId: systemId,
        controllerNumber: existing?.controllerNumber ?? store.controllersOf(systemId).length + 1,
        deviceType: form.deviceType,
        serialNumber: form.serialNumber.trim(),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        partNumber: form.partNumber.trim(),
        ipAddress: form.ipAddress.trim(),
        port: Number(form.port), rack: Number(form.rack), slot: Number(form.slot),
        endpointUrl: existing?.endpointUrl ?? null,
        tagCatalogId: existing?.tagCatalogId ?? null,
        supportedProtocols: form.supportedProtocols.map(protocol => ({protocol}))
    });
    (isEdit.value ? store.updateController(controller) : store.addController(controller)).then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'controller.edit-title' : 'controller.new-title') }}</h1>
    <form class="grid max-w-60rem" @submit.prevent="submit">
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-select id="deviceType" v-model="form.deviceType" :options="DEVICE_TYPES" class="w-full"/>
          <label for="deviceType">{{ t('controller.device-type') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="manufacturer" v-model="form.manufacturer" class="w-full" :invalid="submitted && !required(form.manufacturer)"/>
          <label for="manufacturer">{{ t('controller.manufacturer') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-4">
        <pv-float-label variant="on">
          <pv-input-text id="model" v-model="form.model" class="w-full" :invalid="submitted && !required(form.model)"/>
          <label for="model">{{ t('controller.model') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="partNumber" v-model="form.partNumber" class="w-full"/>
          <label for="partNumber">{{ t('controller.part-number') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-6">
        <pv-float-label variant="on">
          <pv-input-text id="serialNumber" v-model="form.serialNumber" class="w-full" :invalid="submitted && !required(form.serialNumber)"/>
          <label for="serialNumber">{{ t('controller.serial-number') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 md:col-5 flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="ipAddress" v-model="form.ipAddress" placeholder="192.168.1.10" class="w-full" :invalid="submitted && !ipValid"/>
          <label for="ipAddress">{{ t('controller.ip-address') }}</label>
        </pv-float-label>
        <small v-if="submitted && !ipValid" class="text-red-500">{{ t('controller.error.ip-invalid') }}</small>
      </div>
      <div class="col-4 md:col-3">
        <pv-float-label variant="on">
          <pv-input-number id="port" v-model="form.port" :min="1" :max="65535" :use-grouping="false" class="w-full"/>
          <label for="port">{{ t('controller.port') }}</label>
        </pv-float-label>
      </div>
      <div class="col-4 md:col-2">
        <pv-float-label variant="on">
          <pv-input-number id="rack" v-model="form.rack" :min="0" class="w-full"/>
          <label for="rack">{{ t('controller.rack') }}</label>
        </pv-float-label>
      </div>
      <div class="col-4 md:col-2">
        <pv-float-label variant="on">
          <pv-input-number id="slot" v-model="form.slot" :min="0" class="w-full"/>
          <label for="slot">{{ t('controller.slot') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12">
        <pv-float-label variant="on">
          <pv-multi-select id="supportedProtocols" v-model="form.supportedProtocols" :options="PROTOCOLS" display="chip" class="w-full" :invalid="submitted && form.supportedProtocols.length === 0"/>
          <label for="supportedProtocols">{{ t('controller.protocols') }}</label>
        </pv-float-label>
      </div>
      <div class="col-12 flex justify-content-end gap-2">
        <pv-button type="button" :label="t('controller.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('controller.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
