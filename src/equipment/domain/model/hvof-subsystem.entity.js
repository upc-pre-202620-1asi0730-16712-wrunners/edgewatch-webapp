export const SUBSYSTEM_TYPES = ["GAS_CONSOLE", "POWDER_FEEDER", "COOLING_UNIT", "MANIPULATOR", "DUST_COLLECTOR", "SPRAY_GUN"];

/** Domain entity: a functional subsystem of an HVOF system (gas console, powder feeder, ...) with its parts. */
export class HvofSubsystem {
    constructor({id = null, hvofSystemId = null, subsystemType = "GAS_CONSOLE", name = "", alias = "", parameters = [], parts = []}) {
        this.id = id;
        this.hvofSystemId = hvofSystemId;
        this.subsystemType = subsystemType;
        this.name = name;
        this.alias = alias;
        this.parameters = parameters;
        this.parts = parts;
    }

    /** @returns {string[]} */
    get parameterNames() {
        return this.parameters.map(p => p.parameter);
    }
}
