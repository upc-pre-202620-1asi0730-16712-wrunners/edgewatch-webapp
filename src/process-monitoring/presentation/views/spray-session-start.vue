<script setup lang="js">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import {SpraySession} from "@/process-monitoring/domain/model/spray-session.entity.js";
import useIamStore from "@/iam/application/iam.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useProcessMonitoringStore();
const equipment = useEquipmentStore();
const traceability = useTraceabilityStore();
const iam = useIamStore();

const submitted = ref(false);
const form = reactive({hvofSystemId: null, recuperationId: null, recipeNumber: null});

const systemOptions = computed(() => equipment.activeHvofSystems.map(s => ({value: s.id, label: s.displayName})));
const recuperationOptions = computed(() => traceability.openRecuperations.map(r => ({value: r.id, label: `${r.workOrderNumber} · ${traceability.componentSerialOf(r.componentId)}`})));
const recipeOptions = computed(() => form.hvofSystemId
    ? equipment.activeRecipesOf(form.hvofSystemId).map(r => ({value: r.recipeNumber, label: `#${r.recipeNumber} · ${r.name}`}))
    : []);

watch(() => form.hvofSystemId, () => { form.recipeNumber = null; });

const formValid = computed(() => form.hvofSystemId !== null && form.recuperationId !== null && form.recipeNumber !== null);

onMounted(() => { equipment.fetchAll(); traceability.fetchAll(); });

const cancel = () => router.push({name: "process-monitoring-spray-sessions"});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const session = new SpraySession({
        hvofSystemId: form.hvofSystemId, recuperationId: form.recuperationId, operatorId: iam.userId,
        recipeNumber: form.recipeNumber, startedAt: new Date().toISOString(), status: "active"
    });
    store.startSession(session).then(created => {
        if (!created) return;
        const recuperation = traceability.getRecuperationById(created.recuperationId);
        if (recuperation) {
            traceability.patchRecuperation(recuperation.id, {
                status: "IN_PROGRESS",
                linkedSessions: [...recuperation.linkedSessions, {sessionId: created.id}]
            });
        }
        router.push({name: "process-monitoring-session-detail", params: {id: created.id}});
    });
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t('spray-session.start-title') }}</h1>
    <form class="flex flex-column gap-4 max-w-30rem" @submit.prevent="submit">
      <div class="flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-select id="hvofSystemId" v-model="form.hvofSystemId" :options="systemOptions" option-label="label" option-value="value" class="w-full" :invalid="submitted && form.hvofSystemId === null"/>
          <label for="hvofSystemId">{{ t('spray-session.hvof-system') }}</label>
        </pv-float-label>
        <small v-if="submitted && form.hvofSystemId === null" class="text-red-500">{{ t('spray-session.error.required') }}</small>
      </div>
      <div class="flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-select id="recuperationId" v-model="form.recuperationId" :options="recuperationOptions" option-label="label" option-value="value" filter class="w-full" :invalid="submitted && form.recuperationId === null"/>
          <label for="recuperationId">{{ t('spray-session.recuperation') }}</label>
        </pv-float-label>
        <small v-if="submitted && form.recuperationId === null" class="text-red-500">{{ t('spray-session.error.required') }}</small>
      </div>
      <div class="flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-select id="recipeNumber" v-model="form.recipeNumber" :options="recipeOptions" option-label="label" option-value="value" :disabled="!form.hvofSystemId" class="w-full" :invalid="submitted && form.recipeNumber === null"/>
          <label for="recipeNumber">{{ t('spray-session.recipe') }}</label>
        </pv-float-label>
        <small class="text-color-secondary">{{ t('spray-session.recipe-hint') }}</small>
        <small v-if="form.hvofSystemId && recipeOptions.length === 0" class="text-red-500">{{ t('spray-session.error.no-active-recipes') }}</small>
      </div>
      <div class="flex justify-content-end gap-2">
        <pv-button type="button" :label="t('spray-session.cancel')" severity="secondary" text @click="cancel"/>
        <pv-button type="submit" :label="t('spray-session.start')" icon="pi pi-play"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
