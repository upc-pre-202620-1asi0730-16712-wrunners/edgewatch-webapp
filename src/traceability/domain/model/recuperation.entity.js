/** @type {string[]} */
export const RECUPERATION_STATUSES = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "DELIVERED", "REWORK"];
/** Statuses in which a recuperation can still receive spray sessions. */
export const OPEN_RECUPERATION_STATUSES = ["RECEIVED", "IN_PROGRESS", "REWORK"];

/**
 * @typedef {Object} RecuperationProps
 * @property {number|null} [id]
 * @property {string} [workOrderNumber]
 * @property {string} [manufacturingOrderNumber]
 * @property {number|null} [componentId]
 * @property {number|null} [customerId]
 * @property {number|null} [supplierOrganizationId]
 * @property {string} [segment]
 * @property {string} [operation]
 * @property {number} [weightValue]
 * @property {string} [weightUnitSymbol]
 * @property {number} [hourmeterAtEntry]
 * @property {string} [powderSupplier]
 * @property {string} [powderLotNumber]
 * @property {string} [powderChemicalComposition]
 * @property {string} [status]
 * @property {string} [receivedAt] ISO date (yyyy-MM-dd)
 * @property {string|null} [completedAt]
 * @property {{sessionId: number}[]} [linkedSessions]
 */

/**
 * Domain entity: a recuperation work order (OF/WO) over a component.
 */
export class Recuperation {
    /** @param {RecuperationProps} props */
    constructor({
                    id = null, workOrderNumber = "", manufacturingOrderNumber = "", componentId = null, customerId = null,
                    supplierOrganizationId = null, segment = "Mining", operation = "", weightValue = 0, weightUnitSymbol = "kg",
                    hourmeterAtEntry = 0, powderSupplier = "", powderLotNumber = "", powderChemicalComposition = "",
                    status = "RECEIVED", receivedAt = "", completedAt = null, linkedSessions = []
                }) {
        this.id = id;
        this.workOrderNumber = workOrderNumber;
        this.manufacturingOrderNumber = manufacturingOrderNumber;
        this.componentId = componentId;
        this.customerId = customerId;
        this.supplierOrganizationId = supplierOrganizationId;
        this.segment = segment;
        this.operation = operation;
        this.weightValue = weightValue;
        this.weightUnitSymbol = weightUnitSymbol;
        this.hourmeterAtEntry = hourmeterAtEntry;
        this.powderSupplier = powderSupplier;
        this.powderLotNumber = powderLotNumber;
        this.powderChemicalComposition = powderChemicalComposition;
        this.status = status;
        this.receivedAt = receivedAt;
        this.completedAt = completedAt;
        this.linkedSessions = linkedSessions;
    }

    get isOpen() {
        return OPEN_RECUPERATION_STATUSES.includes(this.status);
    }
}
