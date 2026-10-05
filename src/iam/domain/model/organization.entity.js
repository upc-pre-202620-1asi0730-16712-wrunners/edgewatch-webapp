export const ORGANIZATION_TYPES = ["RECUPERATION_SUPPLIER", "ASSET_OWNER"];

export class Organization {
    constructor({id = null, name = "", ruc = "", organizationType = "RECUPERATION_SUPPLIER", status = "ACTIVE", timeZone = "America/Lima"}) {
        this.id = id;
        this.name = name;
        this.ruc = ruc;
        this.organizationType = organizationType;
        this.status = status;
        this.timeZone = timeZone;
    }
}
