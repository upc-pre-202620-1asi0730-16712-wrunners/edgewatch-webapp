<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {HvofSubsystem, SUBSYSTEM_TYPES} from "@/equipment/domain/model/hvof-subsystem.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = parseInt(route.params.id);
const subsystemId = route.params.subsystemId ? parseInt(route.params.subsystemId) : null;
const isEdit = computed(() => subsystemId !== null);
const submitted = ref(false);

const form = reactive({subsystemType: "GAS_CONSOLE", name: "", alias: ""});
const parameters = ref([]);
const parameterInput = ref("");

const typeOptions = computed(() => SUBSYSTEM_TYPES.map(value => ({value, label: t("subsystem.type-option." + value)})));
const required = (v) => String(v ?? "").trim().length > 0;
const formValid = computed(() => required(form.name) && required(form.alias));

const addParameter = () => {
    const value = parameterInput.value.trim().toLowerCase().replace(/\s+/g, "_");
    if (value && !parameters.value.includes(value)) parameters.value.push(value);
    parameterInput.value = "";
};
const removeParameter = (value) => { parameters.value = parameters.value.filter(p => p !== value); };

const load = () => {
    const s = store.getSubsystemById(subsystemId);
    if (s) { Object.assign(form, {subsystemType: s.subsystemType, name: s.name, alias: s.alias}); parameters.value = [...s.parameterNames]; }
};

onMounted(() => {
    store.fetchAll();
    if (!isEdit.value) return;
    if (store.subsystemsLoaded) load();
    else { const stop = store.$subscribe(() => { if (store.subsystemsLoaded) { load(); stop(); } }); }
});

const back = () => router.push({name: "equipment-hvof-system-detail", params: {id: systemId}});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const subsystem = new HvofSubsystem({
        id: subsystemId, hvofSystemId: systemId, subsystemType: form.subsystemType,
        name: form.name.trim(), alias: form.alias.trim(), parameters: parameters.value.map(parameter => ({parameter}))
    });
    (isEdit.value ? store.updateSubsystem(subsystem) : store.addSubsystem(subsystem)).then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'subsystem.edit-title' : 'subsystem.new-title') }}</h1>
    <form class="flex flex-column gap-4 max-w-40rem" @submit.prevent="submit">
      <pv-float-label variant="on">
        <pv-select id="subsystemType" v-model="form.subsystemType" :options="typeOptions" option-label="label" option-value="value" class="w-full"/>
        <label for="subsystemType">{{ t('subsystem.type') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-input-text id="name" v-model="form.name" class="w-full" :invalid="submitted && !required(form.name)"/>
        <label for="name">{{ t('subsystem.name') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-input-text id="alias" v-model="form.alias" placeholder="FDR1" class="w-full" :invalid="submitted && !required(form.alias)"/>
        <label for="alias">{{ t('subsystem.alias') }}</label>
      </pv-float-label>
      <div class="flex flex-column gap-2">
        <pv-float-label variant="on">
          <pv-input-text id="parameterInput" v-model="parameterInput" placeholder="fuel_gas_flow" class="w-full" @keydown.enter.prevent="addParameter"/>
          <label for="parameterInput">{{ t('subsystem.parameters') }}</label>
        </pv-float-label>
        <div class="flex flex-wrap gap-2">
          <pv-chip v-for="p in parameters" :key="p" :label="p" removable @remove="removeParameter(p)"/>
        </div>
      </div>
      <div class="flex justify-content-end gap-2">
        <pv-button type="button" :label="t('subsystem.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('subsystem.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
