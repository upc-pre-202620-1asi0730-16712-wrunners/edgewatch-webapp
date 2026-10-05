/** Intent to register an organization and its administrator. */
export class SignUpCommand {
    constructor({organizationName, ruc, organizationType, fullName, email, password}) {
        this.organizationName = organizationName;
        this.ruc = ruc;
        this.organizationType = organizationType;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }
}
