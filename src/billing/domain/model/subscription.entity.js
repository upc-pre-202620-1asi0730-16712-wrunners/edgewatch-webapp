export class Subscription {
    constructor({id = null, organizationId = null, planId = null, startDate = "", endDate = "", status = "ACTIVE"}) {
        this.id = id;
        this.organizationId = organizationId;
        this.planId = planId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    get daysToExpiry() {
        return Math.ceil((new Date(this.endDate).getTime() - Date.now()) / 86_400_000);
    }

    get isActive() {
        return this.status === "ACTIVE";
    }
}
