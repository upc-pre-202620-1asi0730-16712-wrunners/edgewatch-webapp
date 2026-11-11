<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {BAND_COLORS, baseChartOptions} from "@/shared/presentation/charts/chart-theme.js";

/** Doughnut with the number of readings per band. */
const props = defineProps({
    counts: {type: Object, required: true},
    height: {type: String, default: "220px"}
});
const {t} = useI18n();
const bands = ["nominal", "out_of_nominal", "warning", "shutdown"];

const data = computed(() => ({
    labels: bands.map(b => t("session-detail.band." + b)),
    datasets: [{data: bands.map(b => props.counts[b] ?? 0), backgroundColor: bands.map(b => BAND_COLORS[b]), borderWidth: 0}]
}));
const options = computed(() => baseChartOptions({cutout: "60%", plugins: {legend: {position: "bottom"}}}));
const total = computed(() => bands.reduce((sum, b) => sum + (props.counts[b] ?? 0), 0));
</script>

<template>
  <div :style="{height: height, position: 'relative'}">
    <pv-chart v-if="total > 0" type="doughnut" :data="data" :options="options" class="h-full"/>
    <p v-else class="text-color-secondary m-0">{{ t('charts.no-data') }}</p>
  </div>
</template>

<style scoped>
</style>
