/** Shape of the sign-up answer the application reads. */
export class SignUpResource {
    constructor({id, email, fullName, organizationId}) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.organizationId = organizationId;
    }
}
