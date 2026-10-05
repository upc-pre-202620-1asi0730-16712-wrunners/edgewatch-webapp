export class User {
    constructor({id = null, fullName = "", email = "", organizationId = null, status = "ACTIVE", roleIds = []}) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.organizationId = organizationId;
        this.status = status;
        this.roleIds = roleIds;
    }

    hasRole(roleId) {
        return this.roleIds.some(r => r.roleId === roleId);
    }
}
