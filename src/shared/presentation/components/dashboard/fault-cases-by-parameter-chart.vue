<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {BAND_COLORS, baseChartOptions} from "@/shared/presentation/charts/chart-theme.js";

/** Horizontal bars of fault cases per parameter, split by band. */
const props = defineProps({faultCases: {type: Array, required: true}});
const {t} = useI18n();

const parameters = computed(() => [...new Set(props.faultCases.map(c => c.parameter))]);
const data = computed(() => ({
    labels: parameters.value.map(p => t("session-detail.parameter." + p, p)),
    datasets: ["warning", "shutdown"].map(band => ({
        label: t("session-detail.band." + band),
        backgroundColor: BAND_COLORS[band],
        data: parameters.value.map(p => props.faultCases.filter(c => c.parameter === p && c.band === band).length)
    }))
}));
const options = computed(() => baseChartOptions({
    indexAxis: "y",
    plugins: {legend: {position: "bottom", labels: {boxWidth: 12}}},
    scales: {x: {stacked: true, ticks: {precision: 0}}, y: {stacked: true}}
}));
</script>

<template>
  <div style="height: 260px; position: relative">
    <pv-chart v-if="faultCases.length" type="bar" :data="data" :options="options" class="h-full"/>
    <p v-else class="text-color-secondary m-0">{{ t('dashboard.no-fault-cases') }}</p>
  </div>
</template>

<style scoped>
</style>
