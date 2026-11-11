<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {BAND_COLORS, baseChartOptions, SERIES_COLORS} from "@/shared/presentation/charts/chart-theme.js";

/**
 * Line chart of one parameter over time with the recipe thresholds drawn as horizontal guides.
 * Points are colored by band so deviations stand out.
 */
const props = defineProps({
    parameter: {type: String, required: true},
    readings: {type: Array, required: true},
    recipeParameter: {type: Object, default: null},
    height: {type: String, default: "280px"}
});
const {t} = useI18n();

const formatTime = (ms) => new Date(ms).toLocaleTimeString("es-PE", {hour: "2-digit", minute: "2-digit", second: "2-digit"});

const guide = (label, value, color, dash) => ({
    label, data: props.readings.map(() => value), borderColor: color, borderWidth: 1, borderDash: dash, pointRadius: 0, fill: false, tension: 0
});

const data = computed(() => {
    const p = props.recipeParameter;
    const datasets = [{
        label: t("session-detail.parameter." + props.parameter),
        data: props.readings.map(r => r.value),
        borderColor: SERIES_COLORS[0],
        backgroundColor: SERIES_COLORS[0],
        pointBackgroundColor: props.readings.map(r => BAND_COLORS[r.band] ?? SERIES_COLORS[0]),
        pointBorderColor: props.readings.map(r => BAND_COLORS[r.band] ?? SERIES_COLORS[0]),
        pointRadius: 3,
        tension: 0.25,
        fill: false
    }];
    if (p) {
        datasets.push(
            guide(t("charts.setpoint"), p.setpoint, "#334155", [6, 4]),
            guide(t("charts.nominal-min"), p.nominalMin, BAND_COLORS.nominal, [2, 3]),
            guide(t("charts.nominal-max"), p.nominalMax, BAND_COLORS.nominal, [2, 3]),
            guide(t("charts.lower-warning"), p.lowerWarning, BAND_COLORS.warning, [4, 4]),
            guide(t("charts.upper-warning"), p.upperWarning, BAND_COLORS.warning, [4, 4]),
            guide(t("charts.lower-shutdown"), p.lowerShutdown, BAND_COLORS.shutdown, [8, 4]),
            guide(t("charts.upper-shutdown"), p.upperShutdown, BAND_COLORS.shutdown, [8, 4])
        );
    }
    return {labels: props.readings.map(r => formatTime(r.epochMillis)), datasets};
});

const unit = computed(() => props.readings[0]?.unitSymbol ?? props.recipeParameter?.unitSymbol ?? "");

const options = computed(() => baseChartOptions({
    plugins: {legend: {display: true, position: "bottom", labels: {boxWidth: 12, usePointStyle: false}}, tooltip: {mode: "index", intersect: false}},
    scales: {
        x: {ticks: {maxTicksLimit: 10, maxRotation: 0}},
        y: {title: {display: true, text: unit.value}}
    }
}));
</script>

<template>
  <div :style="{height: height, position: 'relative'}">
    <pv-chart v-if="readings.length" type="line" :data="data" :options="options" class="h-full"/>
    <p v-else class="text-color-secondary m-0">{{ t('charts.no-data') }}</p>
  </div>
</template>

<style scoped>
</style>
