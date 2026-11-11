export const HVOF_SYSTEM_STATUSES = ["ACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"];
export const FUEL_TYPES = ["HYDROGEN", "PROPANE", "KEROSENE", "NATURAL_GAS"];

/**
 * Domain entity: an HVOF thermal spray system owned by a recuperation supplier.
 */
export class HvofSystem {
    constructor({
                    id = null, code = "", organizationId = null, serialNumber = "", status = "ACTIVE",
                    systemManufacturer = "", systemModel = "", fuelType = "HYDROGEN", tagMappings = []
                }) {
        this.id = id;
        this.code = code;
        this.organizationId = organizationId;
        this.serialNumber = serialNumber;
        this.status = status;
        this.systemManufacturer = systemManufacturer;
        this.systemModel = systemModel;
        this.fuelType = fuelType;
        this.tagMappings = tagMappings;
    }

    get isActive() {
        return this.status === "ACTIVE";
    }

    get displayName() {
        return `${this.code} · ${this.systemManufacturer} ${this.systemModel}`;
    }
}
