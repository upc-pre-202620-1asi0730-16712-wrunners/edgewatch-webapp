<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import useFaultDiagnosisStore from "@/fault-diagnosis/application/fault-diagnosis.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {FaultRule} from "@/fault-diagnosis/domain/model/fault-rule.entity.js";
import {FAULT_BANDS} from "@/fault-diagnosis/domain/model/fault-case.entity.js";

/**
 * Cause-effect rules of the organization (administrators): list, create and edit in a dialog.
 */
const {t} = useI18n();
const store = useFaultDiagnosisStore();
const equipment = useEquipmentStore();

const dialogVisible = ref(false);
const submitted = ref(false);
const editing = ref(null);
const form = reactive({parameter: "", band: "warning", probableCause: "", recommendedAction: "", cooldownSeconds: 60});

const knownParameters = computed(() => {
    const fromSystems = equipment.hvofSystems.flatMap(s => equipment.parametersOf(s.id));
    const fromRules = store.faultRules.map(r => r.parameter);
    return [...new Set([...fromSystems, ...fromRules])].sort();
});
const parameterOptions = computed(() => knownParameters.value.map(value => ({value, label: t("session-detail.parameter." + value, value)})));
const bandOptions = computed(() => FAULT_BANDS.map(value => ({value, label: t("session-detail.band." + value)})));
const required = (v) => String(v ?? "").trim().length > 0;
const formValid = computed(() => required(form.parameter) && required(form.probableCause) && required(form.recommendedAction) && form.cooldownSeconds >= 0);

const openNew = () => { editing.value = null; Object.assign(form, {parameter: "", band: "warning", probableCause: "", recommendedAction: "", cooldownSeconds: 60}); submitted.value = false; dialogVisible.value = true; };
const openEdit = (rule) => { editing.value = rule; Object.assign(form, {...rule}); submitted.value = false; dialogVisible.value = true; };

const save = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const rule = new FaultRule({...form, id: editing.value?.id ?? null});
    (editing.value ? store.updateFaultRule(rule) : store.addFaultRule(rule)).then(saved => { if (saved) dialogVisible.value = false; });
};

onMounted(() => { store.fetchFaultRules(); equipment.fetchAll(); });
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('fault-rules.title') }}</h1>
      <pv-button :label="t('fault-rules.new')" icon="pi pi-plus" @click="openNew"/>
    </div>
    <p class="mt-0 text-color-secondary">{{ t('fault-rules.hint') }}</p>
    <pv-message v-if="store.error" severity="error" class="mb-3">{{ store.error }}</pv-message>

    <pv-data-table :value="store.faultRules" :loading="!store.faultRulesLoaded" striped-rows sort-field="parameter" :sort-order="1">
      <template #empty>{{ t('fault-rules.empty') }}</template>
      <pv-column field="parameter" :header="t('fault-rules.parameter')" sortable>
        <template #body="{ data }">{{ t('session-detail.parameter.' + data.parameter, data.parameter) }}</template>
      </pv-column>
      <pv-column :header="t('fault-rules.band')">
        <template #body="{ data }"><pv-tag :value="t('session-detail.band.' + data.band)" :severity="data.band === 'shutdown' ? 'danger' : 'warn'"/></template>
      </pv-column>
      <pv-column field="probableCause" :header="t('fault-rules.probable-cause')"/>
      <pv-column field="recommendedAction" :header="t('fault-rules.recommended-action')"/>
      <pv-column field="cooldownSeconds" :header="t('fault-rules.cooldown')" style="width: 8rem"/>
      <pv-column :header="t('fault-rules.actions')" style="width: 5rem">
        <template #body="{ data }"><pv-button icon="pi pi-pencil" text rounded v-tooltip.top="t('common.edit')" @click="openEdit(data)"/></template>
      </pv-column>
    </pv-data-table>

    <pv-dialog v-model:visible="dialogVisible" modal :header="t(editing ? 'fault-rules.edit-title' : 'fault-rules.new-title')" class="w-full max-w-30rem">
      <form class="flex flex-column gap-4 pt-2" @submit.prevent="save">
        <pv-float-label variant="on">
          <pv-select id="parameter" v-model="form.parameter" :options="parameterOptions" option-label="label" option-value="value" editable :disabled="!!editing" class="w-full" :invalid="submitted && !required(form.parameter)"/>
          <label for="parameter">{{ t('fault-rules.parameter') }}</label>
        </pv-float-label>
        <pv-select-button v-model="form.band" :options="bandOptions" option-label="label" option-value="value" :disabled="!!editing" :allow-empty="false"/>
        <pv-float-label variant="on">
          <pv-textarea id="probableCause" v-model="form.probableCause" rows="2" auto-resize class="w-full" maxlength="300" :invalid="submitted && !required(form.probableCause)"/>
          <label for="probableCause">{{ t('fault-rules.probable-cause') }}</label>
        </pv-float-label>
        <pv-float-label variant="on">
          <pv-textarea id="recommendedAction" v-model="form.recommendedAction" rows="2" auto-resize class="w-full" maxlength="300" :invalid="submitted && !required(form.recommendedAction)"/>
          <label for="recommendedAction">{{ t('fault-rules.recommended-action') }}</label>
        </pv-float-label>
        <pv-float-label variant="on">
          <pv-input-number id="cooldownSeconds" v-model="form.cooldownSeconds" :min="0" :max="86400" class="w-full"/>
          <label for="cooldownSeconds">{{ t('fault-rules.cooldown') }}</label>
        </pv-float-label>
        <div class="flex justify-content-end gap-2">
          <pv-button type="button" :label="t('fault-cases.cancel')" text @click="dialogVisible = false"/>
          <pv-button type="submit" :label="t('fault-rules.save')" icon="pi pi-check"/>
        </div>
      </form>
    </pv-dialog>
  </section>
</template>

<style scoped>
</style>
