export const ROLE = {
    ORG_ADMIN: 1, QUALITY_ENGINEER: 2, MAINTENANCE_SUPERVISOR: 3, HVOF_OPERATOR: 4,
    RELIABILITY_ENGINEER: 5, OPERATIONS_SUPERVISOR: 6, PROCUREMENT_ANALYST: 7
};

export class Role {
    constructor({id = null, name = ""}) {
        this.id = id;
        this.name = name;
    }
}
