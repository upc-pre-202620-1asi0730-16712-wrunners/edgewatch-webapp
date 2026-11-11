/**
 * Colors shared by every chart of the application: one color per band and a neutral palette for series.
 */
export const BAND_COLORS = {
    nominal: "#15803d",
    out_of_nominal: "#ca8a04",
    warning: "#ea580c",
    shutdown: "#b91c1c"
};

export const SERIES_COLORS = ["#d4781c", "#1d4f91", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#84cc16"];

/** Reads the PrimeVue theme tokens so the charts follow the active theme. */
export function chartTextColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        text: style.getPropertyValue("--p-text-color").trim() || "#334155",
        muted: style.getPropertyValue("--p-text-muted-color").trim() || "#64748b",
        grid: style.getPropertyValue("--p-content-border-color").trim() || "#e2e8f0"
    };
}

/** Default options with the theme colors applied to legend, ticks and grid. */
export function baseChartOptions(extra = {}) {
    const colors = chartTextColors();
    return {
        maintainAspectRatio: false,
        animation: false,
        plugins: {legend: {labels: {color: colors.text}}, ...(extra.plugins ?? {})},
        scales: Object.fromEntries(Object.entries(extra.scales ?? {}).map(([axis, scale]) => [axis, {
            ...scale,
            ticks: {color: colors.muted, ...(scale.ticks ?? {})},
            grid: {color: colors.grid, ...(scale.grid ?? {})}
        }])),
        ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== "plugins" && k !== "scales"))
    };
}
