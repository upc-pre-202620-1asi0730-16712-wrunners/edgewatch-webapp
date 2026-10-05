export const BANDS = ["nominal", "out_of_nominal", "warning", "shutdown"];

/**
 * Classifies a value against the recipe parameter thresholds (US21).
 * @returns {"nominal"|"out_of_nominal"|"warning"|"shutdown"}
 */
export function classify(value, p) {
    if (value < p.lowerShutdown || value > p.upperShutdown) return "shutdown";
    if (value < p.lowerWarning || value > p.upperWarning) return "warning";
    if (value < p.nominalMin || value > p.nominalMax) return "out_of_nominal";
    return "nominal";
}

/**
 * Domain entity: one telemetry reading of a spray session.
 */
export class ProcessReading {
    constructor({
                    id = null, spraySessionId = null, epochMillis = 0, plcClockOffsetMillis = 0, tagPath = "", parameter = "",
                    subsystemId = null, partId = null, value = 0, unitSymbol = "", unitCategory = "", band = "nominal",
                    derived = false, mappingPending = false
                }) {
        this.id = id;
        this.spraySessionId = spraySessionId;
        this.epochMillis = epochMillis;
        this.plcClockOffsetMillis = plcClockOffsetMillis;
        this.tagPath = tagPath;
        this.parameter = parameter;
        this.subsystemId = subsystemId;
        this.partId = partId;
        this.value = value;
        this.unitSymbol = unitSymbol;
        this.unitCategory = unitCategory;
        this.band = band;
        this.derived = derived;
        this.mappingPending = mappingPending;
    }

    get timestamp() {
        return new Date(this.epochMillis);
    }
}
