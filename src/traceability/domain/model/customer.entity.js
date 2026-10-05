/**
 * @typedef {Object} CustomerProps
 * @property {number|null} [id]
 * @property {number|null} [supplierOrganizationId]
 * @property {number|null} [linkedAssetOwnerOrganizationId]
 * @property {string} [legalName]
 * @property {string} [ruc]
 * @property {string} [mineSite]
 */

/**
 * Domain entity: a customer (asset owner) of the recuperation supplier.
 */
export class Customer {
    /** @param {CustomerProps} props */
    constructor({id = null, supplierOrganizationId = null, linkedAssetOwnerOrganizationId = null, legalName = "", ruc = "", mineSite = ""}) {
        this.id = id;
        this.supplierOrganizationId = supplierOrganizationId;
        this.linkedAssetOwnerOrganizationId = linkedAssetOwnerOrganizationId;
        this.legalName = legalName;
        this.ruc = ruc;
        this.mineSite = mineSite;
    }
}
