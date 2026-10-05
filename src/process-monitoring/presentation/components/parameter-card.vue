<script setup lang="js">
import {useI18n} from "vue-i18n";

/**
 * Shows the latest reading of one parameter with its band and the recipe setpoint.
 */
const props = defineProps({
    reading: {type: Object, required: true},
    recipeParameter: {type: Object, default: null}
});
const {t} = useI18n();
const format = (v) => Number(v).toLocaleString("es-PE", {maximumFractionDigits: 1});
</script>

<template>
  <pv-card class="parameter-card" :class="'band-' + reading.band">
    <template #title>
      <span class="text-base">{{ t('session-detail.parameter.' + reading.parameter) }}</span>
    </template>
    <template #subtitle>{{ reading.tagPath }}</template>
    <template #content>
      <div class="text-4xl font-bold line-height-1 mb-2">{{ format(reading.value) }} <span class="text-base font-normal text-color-secondary">{{ reading.unitSymbol }}</span></div>
      <div class="flex align-items-center flex-wrap gap-2 text-sm">
        <span class="band-chip">{{ t('session-detail.band.' + reading.band) }}</span>
        <span v-if="recipeParameter" class="text-color-secondary">{{ t('session-detail.setpoint') }} {{ recipeParameter.setpoint }} · {{ recipeParameter.nominalMin }}–{{ recipeParameter.nominalMax }}</span>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.parameter-card { border-left: 6px solid var(--band-color); }
.band-chip { padding: 2px 8px; border-radius: 10px; background: var(--band-color); color: #fff; font-weight: 500; }
.band-nominal        { --band-color: #15803d; }
.band-out_of_nominal { --band-color: #ca8a04; }
.band-warning        { --band-color: #ea580c; }
.band-shutdown       { --band-color: #b91c1c; }
</style>
