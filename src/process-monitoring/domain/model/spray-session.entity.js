export const SESSION_STATUSES = ["active", "completed", "aborted", "interrupted"];
export const ABORT_REASONS = ["FLAME_OUT", "POWDER_DEPLETED", "MACHINE_FAULT", "OPERATOR_DECISION", "OTHER"];

/**
 * Domain entity: a spray session run on an HVOF system for a recuperation order with a recipe.
 */
export class SpraySession {
    constructor({
                    id = null, hvofSystemId = null, recuperationId = null, operatorId = null, recipeNumber = null,
                    startedAt = "", endedAt = null, timeZone = "America/Lima", status = "active", abortReason = null
                }) {
        this.id = id;
        this.hvofSystemId = hvofSystemId;
        this.recuperationId = recuperationId;
        this.operatorId = operatorId;
        this.recipeNumber = recipeNumber;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.timeZone = timeZone;
        this.status = status;
        this.abortReason = abortReason;
    }

    get isActive() {
        return this.status === "active";
    }
}
