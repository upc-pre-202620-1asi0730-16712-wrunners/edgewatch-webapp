<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {baseChartOptions, SERIES_COLORS} from "@/shared/presentation/charts/chart-theme.js";
import {groupByParameter, normalize} from "@/process-monitoring/domain/model/reading-series.js";

/**
 * Every parameter of the session on one chart, normalized against its recipe thresholds:
 * 0 is the setpoint, ±1 the shutdown limits. Readings above |1| left the safe envelope.
 */
const props = defineProps({
    readings: {type: Array, required: true},
    recipe: {type: Object, default: null},
    height: {type: String, default: "320px"}
});
const {t} = useI18n();

const data = computed(() => {
    const grouped = groupByParameter(props.readings);
    const datasets = [...grouped.entries()].map(([parameter, list], index) => ({
        label: t("session-detail.parameter." + parameter),
        data: list.map(r => ({x: r.epochMillis, y: Math.round(normalize(r.value, props.recipe?.parameterFor(parameter)) * 1000) / 1000})),
        borderColor: SERIES_COLORS[index % SERIES_COLORS.length],
        backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
        pointRadius: 2,
        tension: 0.2,
        fill: false
    }));
    return {datasets};
});

const options = computed(() => baseChartOptions({
    parsing: false,
    plugins: {legend: {position: "bottom", labels: {boxWidth: 12}}, tooltip: {mode: "nearest", intersect: false}},
    scales: {
        x: {type: "linear", ticks: {maxTicksLimit: 8, callback: (v) => new Date(v).toLocaleTimeString("es-PE", {hour: "2-digit", minute: "2-digit"})}},
        y: {min: -1.5, max: 1.5, title: {display: true, text: t("analysis.normalized-axis")}}
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
