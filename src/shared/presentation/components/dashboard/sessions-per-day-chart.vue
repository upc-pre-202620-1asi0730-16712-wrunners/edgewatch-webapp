<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {BAND_COLORS, baseChartOptions, SERIES_COLORS} from "@/shared/presentation/charts/chart-theme.js";

/** Stacked bars of sessions started per day in the last N days, split by final status. */
const props = defineProps({sessions: {type: Array, required: true}, days: {type: Number, default: 14}});
const {t} = useI18n();

const dayKeys = computed(() => {
    const keys = [];
    for (let i = props.days - 1; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        keys.push(d.toISOString().slice(0, 10));
    }
    return keys;
});

const statuses = [["completed", BAND_COLORS.nominal], ["active", SERIES_COLORS[1]], ["aborted", BAND_COLORS.shutdown], ["interrupted", BAND_COLORS.out_of_nominal]];

const data = computed(() => ({
    labels: dayKeys.value.map(k => k.slice(5)),
    datasets: statuses.map(([status, color]) => ({
        label: t("spray-sessions.status-option." + status),
        backgroundColor: color,
        data: dayKeys.value.map(key => props.sessions.filter(s => s.status === status && new Date(s.startedAt).toISOString().slice(0, 10) === key).length)
    }))
}));
const options = computed(() => baseChartOptions({
    plugins: {legend: {position: "bottom", labels: {boxWidth: 12}}},
    scales: {x: {stacked: true}, y: {stacked: true, ticks: {precision: 0}}}
}));
</script>

<template>
  <div style="height: 260px; position: relative">
    <pv-chart type="bar" :data="data" :options="options" class="h-full"/>
  </div>
</template>

<style scoped>
</style>
