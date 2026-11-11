import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";
import {SignUpAssembler} from "@/iam/infrastructure/sign-up.assembler.js";
import {SignInAssembler} from "@/iam/infrastructure/sign-in.assembler.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const tokensEndpointPath = import.meta.env.VITE_TOKENS_ENDPOINT_PATH;
const organizationsEndpointPath = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT_PATH;
const rolesEndpointPath = import.meta.env.VITE_ROLES_ENDPOINT_PATH;

/**
 * API gateway of the IAM bounded context (EdgeWatch Platform).
 * Sign-up creates the organization and its administrator (`POST /users`), sign-in issues a bearer token (`POST /tokens`).
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #usersEndpoint;
    #tokensEndpoint;
    #organizationsEndpoint;
    #rolesEndpoint;

    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#tokensEndpoint = new BaseEndpoint(this, tokensEndpointPath);
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
        this.#rolesEndpoint = new BaseEndpoint(this, rolesEndpointPath);
    }

    /** POST /tokens → {id, email, fullName, organizationId, organizationType, roleIds, token} */
    signIn(command) {
        return this.#tokensEndpoint.create(SignInAssembler.toRequestFromCommand(command));
    }

    /** POST /users → the created administrator */
    signUp(command) {
        return this.#usersEndpoint.create(SignUpAssembler.toRequestFromCommand(command));
    }

    getCurrentUser() {
        return this.http.get(`${usersEndpointPath}/me`);
    }

    getRoles() {
        return this.#rolesEndpoint.getAll();
    }

    getOrganizationById(id) {
        return this.#organizationsEndpoint.getById(id);
    }

    getUsersByOrganizationId(organizationId) {
        return this.#usersEndpoint.getAllBy({organizationId});
    }

    /** PUT /users/{id}/roles with [{roleId}] */
    updateUserRoles(userId, roleIds) {
        return this.#usersEndpoint.updateNested(userId, "roles", {roleIds});
    }
}
