export class Plan {
    constructor({id = null, name = "", planType = "OPERATOR", monthlyPriceAmount = 0, monthlyPriceCurrency = "USD", maxMonitoredSystems = 0, maxTrackedComponents = 0}) {
        this.id = id;
        this.name = name;
        this.planType = planType;
        this.monthlyPriceAmount = monthlyPriceAmount;
        this.monthlyPriceCurrency = monthlyPriceCurrency;
        this.maxMonitoredSystems = maxMonitoredSystems;
        this.maxTrackedComponents = maxTrackedComponents;
    }
}
