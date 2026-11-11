/**
 * Pure functions that shape readings for the charts and the analysis views (no UI, no HTTP).
 */

/** Groups readings by parameter keeping the time order. @returns {Map<string, ProcessReading[]>} */
export function groupByParameter(readings) {
    const map = new Map();
    for (const r of [...readings].sort((a, b) => a.epochMillis - b.epochMillis)) {
        if (!map.has(r.parameter)) map.set(r.parameter, []);
        map.get(r.parameter).push(r);
    }
    return map;
}

/** Descriptive statistics of a list of readings. */
export function statisticsOf(readings) {
    const values = readings.map(r => Number(r.value));
    const n = values.length;
    if (n === 0) return {count: 0, min: null, max: null, mean: null, stdDev: null, last: null};
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    return {count: n, min: Math.min(...values), max: Math.max(...values), mean, stdDev: Math.sqrt(variance), last: values[n - 1]};
}

/** Share of readings per band (0–1). */
export function bandShareOf(readings) {
    const counts = {nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0};
    for (const r of readings) counts[r.band] = (counts[r.band] ?? 0) + 1;
    const total = readings.length || 1;
    return Object.fromEntries(Object.entries(counts).map(([band, c]) => [band, c / total]));
}

/** Percentage of readings that stayed inside the nominal range: the compliance of a parameter or a session. */
export function complianceOf(readings) {
    if (readings.length === 0) return null;
    return Math.round(readings.filter(r => r.band === "nominal").length / readings.length * 1000) / 10;
}

/** Normalizes a value against a recipe parameter so several parameters share one chart: 0 = setpoint, ±1 = shutdown limits. */
export function normalize(value, p) {
    if (!p) return 0;
    const span = value >= p.setpoint ? p.upperShutdown - p.setpoint : p.setpoint - p.lowerShutdown;
    return span === 0 ? 0 : (value - p.setpoint) / span;
}
