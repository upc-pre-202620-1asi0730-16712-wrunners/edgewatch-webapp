export const FAULT_CASE_STATUSES = ["open", "acknowledged", "resolved"];
export const FAULT_BANDS = ["warning", "shutdown"];

/**
 * Domain entity: a deviation that matched a fault rule, with its probable cause and recommended action.
 */
export class FaultCase {
    constructor({
                    id = null, organizationId = null, spraySessionId = null, hvofSystemId = null, parameter = "", band = "warning",
                    value = 0, epochMillis = 0, probableCause = "", recommendedAction = "", status = "open",
                    acknowledgedBy = null, acknowledgedAt = null, resolvedBy = null, resolvedAt = null, resolutionNotes = null
                }) {
        this.id = id;
        this.organizationId = organizationId;
        this.spraySessionId = spraySessionId;
        this.hvofSystemId = hvofSystemId;
        this.parameter = parameter;
        this.band = band;
        this.value = value;
        this.epochMillis = epochMillis;
        this.probableCause = probableCause;
        this.recommendedAction = recommendedAction;
        this.status = status;
        this.acknowledgedBy = acknowledgedBy;
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedBy = resolvedBy;
        this.resolvedAt = resolvedAt;
        this.resolutionNotes = resolutionNotes;
    }

    get isOpen() {
        return this.status === "open";
    }

    get isResolved() {
        return this.status === "resolved";
    }

    get detectedAt() {
        return new Date(this.epochMillis);
    }
}
