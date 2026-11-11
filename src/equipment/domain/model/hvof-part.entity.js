export const PART_TYPES = ["MASS_FLOW_CONTROLLER", "HOPPER", "CARRIER_GAS_MFC", "COOLANT_PUMP", "TEMPERATURE_SENSOR", "SPINDLE_VFD", "AXIS_DRIVE", "NOZZLE"];

/** Domain entity: a physical, replaceable part of a subsystem. */
export class HvofPart {
    constructor({id = null, hvofSubsystemId = null, partType = "MASS_FLOW_CONTROLLER", serialNumber = "", manufacturer = ""}) {
        this.id = id;
        this.hvofSubsystemId = hvofSubsystemId;
        this.partType = partType;
        this.serialNumber = serialNumber;
        this.manufacturer = manufacturer;
    }
}
