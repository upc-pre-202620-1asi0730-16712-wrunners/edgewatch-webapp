<script setup lang="js">
import {computed, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {HvofPart, PART_TYPES} from "@/equipment/domain/model/hvof-part.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = parseInt(route.params.id);
const subsystemId = parseInt(route.params.subsystemId);
const submitted = ref(false);

const form = reactive({partType: "MASS_FLOW_CONTROLLER", serialNumber: "", manufacturer: ""});
const typeOptions = computed(() => PART_TYPES.map(value => ({value, label: t("part.type-option." + value)})));
const required = (v) => String(v ?? "").trim().length > 0;
const formValid = computed(() => required(form.serialNumber) && required(form.manufacturer));

const back = () => router.push({name: "equipment-hvof-system-detail", params: {id: systemId}});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    store.addPart(new HvofPart({hvofSubsystemId: subsystemId, partType: form.partType, serialNumber: form.serialNumber.trim(), manufacturer: form.manufacturer.trim()})).then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t('part.new-title') }}</h1>
    <form class="flex flex-column gap-4 max-w-30rem" @submit.prevent="submit">
      <pv-float-label variant="on">
        <pv-select id="partType" v-model="form.partType" :options="typeOptions" option-label="label" option-value="value" class="w-full"/>
        <label for="partType">{{ t('part.type') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-input-text id="serialNumber" v-model="form.serialNumber" class="w-full" :invalid="submitted && !required(form.serialNumber)"/>
        <label for="serialNumber">{{ t('part.serial-number') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-input-text id="manufacturer" v-model="form.manufacturer" class="w-full" :invalid="submitted && !required(form.manufacturer)"/>
        <label for="manufacturer">{{ t('part.manufacturer') }}</label>
      </pv-float-label>
      <div class="flex justify-content-end gap-2">
        <pv-button type="button" :label="t('part.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('part.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
