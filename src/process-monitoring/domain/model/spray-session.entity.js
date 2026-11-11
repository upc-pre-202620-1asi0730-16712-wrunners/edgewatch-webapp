export const SESSION_STATUSES = ["active", "completed", "aborted", "interrupted"];
export const ABORT_REASONS = ["FLAME_OUT", "POWDER_DEPLETED", "MACHINE_FAULT", "OPERATOR_DECISION", "OTHER"];

/**
 * Domain entity: a spray session run on an HVOF system for a recuperation order with a recipe.
 */
export class SpraySession {
    constructor({
                    id = null, organizationId = null, hvofSystemId = null, recuperationId = null, operatorId = null, recipeId = null,
                    recipeNumber = null, startedAt = "", endedAt = null, timeZone = "America/Lima", status = "active", abortReason = null
                }) {
        this.id = id;
        this.organizationId = organizationId;
        this.hvofSystemId = hvofSystemId;
        this.recuperationId = recuperationId;
        this.operatorId = operatorId;
        this.recipeId = recipeId;
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

    /** Duration in minutes (until now while active). */
    get durationMinutes() {
        if (!this.startedAt) return 0;
        const end = this.endedAt ? new Date(this.endedAt) : new Date();
        return Math.max(0, Math.round((end - new Date(this.startedAt)) / 60000));
    }
}
