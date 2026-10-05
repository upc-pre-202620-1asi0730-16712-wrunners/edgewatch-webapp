/** @type {string[]} */
export const COMPONENT_TYPES = ["HYDRAULIC_ROD", "CYLINDER_BLOCK", "SHAFT", "IMPELLER", "OTHER"];
/** @type {string[]} */
export const COMPONENT_STATUSES = ["RECEIVED", "IN_RECUPERATION", "IN_SERVICE", "RETURNED", "SCRAPPED"];

/**
 * @typedef {Object} ComponentProps
 * @property {number|null} [id]
 * @property {string} [serialNumber]
 * @property {string} [partNumber]
 * @property {string} [componentType]
 * @property {string} [machineManufacturer]
 * @property {string} [machineModel]
 * @property {number|null} [customerId]
 * @property {number} [pcrTargetHours]
 * @property {string} [status]
 */

/**
 * Domain entity: a customer component received for recuperation.
 */
export class Component {
    /** @param {ComponentProps} props */
    constructor({
                    id = null, serialNumber = "", partNumber = "", componentType = "HYDRAULIC_ROD",
                    machineManufacturer = "", machineModel = "", customerId = null, pcrTargetHours = 0, status = "RECEIVED"
                }) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.partNumber = partNumber;
        this.componentType = componentType;
        this.machineManufacturer = machineManufacturer;
        this.machineModel = machineModel;
        this.customerId = customerId;
        this.pcrTargetHours = pcrTargetHours;
        this.status = status;
    }

    get machine() {
        return `${this.machineManufacturer} ${this.machineModel}`.trim();
    }
}
