<script setup lang="js">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import ParameterTrendChart from "./parameter-trend-chart.vue";
import BandDistributionChart from "./band-distribution-chart.vue";
import {groupByParameter} from "@/process-monitoring/domain/model/reading-series.js";

/**
 * Trend of the selected parameter plus the band distribution of the whole session.
 */
const props = defineProps({
    readings: {type: Array, required: true},
    recipe: {type: Object, default: null},
    bandCounts: {type: Object, required: true}
});
const {t} = useI18n();

const grouped = computed(() => groupByParameter(props.readings));
const parameterOptions = computed(() => [...grouped.value.keys()].map(value => ({value, label: t("session-detail.parameter." + value)})));
const selected = ref(null);
watch(parameterOptions, (options) => { if (!selected.value && options.length) selected.value = options[0].value; }, {immediate: true});

const series = computed(() => selected.value ? grouped.value.get(selected.value) ?? [] : []);
const recipeParameter = computed(() => selected.value ? props.recipe?.parameterFor(selected.value) ?? null : null);
</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-8">
      <pv-card>
        <template #title>
          <div class="flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="text-base">{{ t('charts.trend-title') }}</span>
            <pv-select v-model="selected" :options="parameterOptions" option-label="label" option-value="value" :placeholder="t('charts.select-parameter')" class="w-14rem"/>
          </div>
        </template>
        <template #content>
          <parameter-trend-chart v-if="selected" :parameter="selected" :readings="series" :recipe-parameter="recipeParameter"/>
          <p v-else class="text-color-secondary m-0">{{ t('charts.no-data') }}</p>
        </template>
      </pv-card>
    </div>
    <div class="col-12 lg:col-4">
      <pv-card>
        <template #title><span class="text-base">{{ t('charts.band-distribution') }}</span></template>
        <template #content><band-distribution-chart :counts="bandCounts"/></template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
</style>
