export class SignInResource {
    constructor({id, email, fullName, organizationId, organizationType, roleIds = [], token}) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.organizationId = organizationId;
        this.organizationType = organizationType;
        this.roleIds = roleIds;
        this.token = token;
    }
}
