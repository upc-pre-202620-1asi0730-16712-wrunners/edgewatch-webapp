<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {emptyParameter, Recipe, thresholdsInOrder, UNIT_CATEGORIES} from "@/equipment/domain/model/recipe.entity.js";
import {COMPONENT_TYPES} from "@/traceability/domain/model/component.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useEquipmentStore();

const systemId = parseInt(route.params.id);
const recipeId = route.params.recipeId ? parseInt(route.params.recipeId) : null;
const isEdit = computed(() => recipeId !== null);
const submitted = ref(false);

const form = reactive({recipeNumber: null, name: "", powderSpecification: ""});
const applicabilities = ref([]);
const parameters = ref([emptyParameter()]);

const availableParameters = computed(() => store.parametersOf(systemId));
const typeOptions = computed(() => COMPONENT_TYPES.map(value => ({value, label: t("component.type-option." + value)})));

const required = (v) => String(v ?? "").trim().length > 0;
const rowValid = (p) => required(p.parameter) && required(p.unitSymbol) && thresholdsInOrder(p);
const formValid = computed(() => Number(form.recipeNumber) > 0 && required(form.name) && parameters.value.length > 0 && parameters.value.every(rowValid));

const addApplicability = () => applicabilities.value.push({componentType: "HYDRAULIC_ROD", machineModel: "", position: ""});
const removeApplicability = (i) => applicabilities.value.splice(i, 1);
const addParameter = () => parameters.value.push(emptyParameter());
const removeParameter = (i) => parameters.value.splice(i, 1);

const load = () => {
    const r = store.getRecipeById(recipeId);
    if (!r) return;
    Object.assign(form, {recipeNumber: r.recipeNumber, name: r.name, powderSpecification: r.powderSpecification});
    applicabilities.value = r.applicabilities.map(a => ({...a}));
    parameters.value = r.parameters.map(p => ({...p}));
};

onMounted(() => {
    store.fetchAll();
    if (!isEdit.value) return;
    if (store.recipesLoaded) load();
    else { const stop = store.$subscribe(() => { if (store.recipesLoaded) { load(); stop(); } }); }
});

const back = () => router.push({name: "equipment-hvof-system-detail", params: {id: systemId}});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getRecipeById(recipeId) : null;
    const recipe = new Recipe({
        id: recipeId, hvofSystemId: systemId, recipeNumber: Number(form.recipeNumber), name: form.name.trim(),
        powderSpecification: form.powderSpecification.trim(), status: existing?.status ?? "DRAFT",
        applicabilities: applicabilities.value, parameters: parameters.value
    });
    (isEdit.value ? store.updateRecipe(recipe) : store.addRecipe(recipe)).then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'recipe.edit-title' : 'recipe.new-title') }}</h1>
    <form class="flex flex-column gap-4" @submit.prevent="submit">
      <div class="grid">
        <div class="col-12 md:col-2">
          <pv-float-label variant="on">
            <pv-input-number id="recipeNumber" v-model="form.recipeNumber" :min="1" :use-grouping="false" class="w-full" :invalid="submitted && !(Number(form.recipeNumber) > 0)"/>
            <label for="recipeNumber">{{ t('recipe.number') }}</label>
          </pv-float-label>
        </div>
        <div class="col-12 md:col-5">
          <pv-float-label variant="on">
            <pv-input-text id="name" v-model="form.name" class="w-full" :invalid="submitted && !required(form.name)"/>
            <label for="name">{{ t('recipe.name') }}</label>
          </pv-float-label>
        </div>
        <div class="col-12 md:col-5">
          <pv-float-label variant="on">
            <pv-input-text id="powder" v-model="form.powderSpecification" placeholder="Diamalloy 5849 (WC-10Co-4Cr)" class="w-full"/>
            <label for="powder">{{ t('recipe.powder') }}</label>
          </pv-float-label>
        </div>
      </div>

      <h2 class="m-0 text-xl">{{ t('recipe.applicabilities') }}</h2>
      <div v-for="(a, i) in applicabilities" :key="i" class="grid align-items-center">
        <div class="col-12 md:col-4">
          <pv-select v-model="a.componentType" :options="typeOptions" option-label="label" option-value="value" class="w-full" :placeholder="t('recipe.component-type')"/>
        </div>
        <div class="col-12 md:col-3"><pv-input-text v-model="a.machineModel" :placeholder="t('recipe.machine-model')" class="w-full"/></div>
        <div class="col-12 md:col-4"><pv-input-text v-model="a.position" :placeholder="t('recipe.position')" class="w-full"/></div>
        <div class="col-12 md:col-1"><pv-button icon="pi pi-trash" text rounded severity="danger" type="button" @click="removeApplicability(i)"/></div>
      </div>
      <pv-button :label="t('recipe.add-applicability')" icon="pi pi-plus" outlined type="button" class="align-self-start" @click="addApplicability"/>

      <h2 class="m-0 text-xl">{{ t('recipe.parameters') }}</h2>
      <pv-message v-if="submitted && parameters.length === 0" severity="error">{{ t('recipe.error.no-parameters') }}</pv-message>
      <pv-card v-for="(p, i) in parameters" :key="i" class="parameter-card">
        <template #content>
          <div class="grid align-items-center">
            <div class="col-12 md:col-4">
              <pv-select v-model="p.parameter" :options="availableParameters" editable class="w-full" :placeholder="t('recipe.parameter')" :invalid="submitted && !required(p.parameter)"/>
            </div>
            <div class="col-6 md:col-3"><pv-input-text v-model="p.unitSymbol" :placeholder="t('recipe.unit')" class="w-full" :invalid="submitted && !required(p.unitSymbol)"/></div>
            <div class="col-6 md:col-4"><pv-select v-model="p.unitCategory" :options="UNIT_CATEGORIES" class="w-full"/></div>
            <div class="col-12 md:col-1"><pv-button icon="pi pi-trash" text rounded severity="danger" type="button" @click="removeParameter(i)"/></div>
          </div>
          <div class="grid thresholds">
            <div class="col-6 md:col"><label class="band-shutdown">{{ t('recipe.lsd') }}</label><pv-input-number v-model="p.lowerShutdown" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-warning">{{ t('recipe.law') }}</label><pv-input-number v-model="p.lowerWarning" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-nominal">{{ t('recipe.nmin') }}</label><pv-input-number v-model="p.nominalMin" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-setpoint">{{ t('recipe.setpoint') }}</label><pv-input-number v-model="p.setpoint" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-nominal">{{ t('recipe.nmax') }}</label><pv-input-number v-model="p.nominalMax" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-warning">{{ t('recipe.haw') }}</label><pv-input-number v-model="p.upperWarning" :max-fraction-digits="2" class="w-full"/></div>
            <div class="col-6 md:col"><label class="band-shutdown">{{ t('recipe.hsd') }}</label><pv-input-number v-model="p.upperShutdown" :max-fraction-digits="2" class="w-full"/></div>
          </div>
          <small v-if="submitted && !thresholdsInOrder(p)" class="text-red-500">{{ t('recipe.error.order') }}</small>
        </template>
      </pv-card>
      <pv-button :label="t('recipe.add-parameter')" icon="pi pi-plus" outlined type="button" class="align-self-start" @click="addParameter"/>

      <div class="flex justify-content-end gap-2">
        <pv-button type="button" :label="t('recipe.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('recipe.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.thresholds label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.band-shutdown { color: #b91c1c; }
.band-warning  { color: #c2410c; }
.band-nominal  { color: #15803d; }
.band-setpoint { color: #1d4ed8; }
</style>
