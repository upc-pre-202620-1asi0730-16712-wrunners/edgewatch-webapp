import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";
import {SignUpAssembler} from "@/iam/infrastructure/sign-up.assembler.js";

const signUpEndpointPath = import.meta.env.VITE_SIGNUP_ENDPOINT_PATH;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const organizationsEndpointPath = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT_PATH;
const useFakeAuthentication = !import.meta.env.PROD;
const ORG_ADMIN_ROLE_ID = 1;

/**
 * API gateway of the IAM bounded context.
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #usersEndpoint;
    #organizationsEndpoint;

    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
    }

    /** @returns {Promise<import('axios').AxiosResponse>} response whose data is the created admin user */
    signUp(command) {
        const request = SignUpAssembler.toRequestFromCommand(command);
        if (!useFakeAuthentication) return this.http.post(signUpEndpointPath, request);
        return this.#organizationsEndpoint.create({
            name: request.organizationName, ruc: request.ruc, organizationType: request.organizationType,
            status: "ACTIVE", timeZone: "America/Lima"
        }).then(orgResponse => this.#usersEndpoint.create({
            fullName: request.fullName, email: request.email, password: request.password,
            organizationId: orgResponse.data.id, status: "ACTIVE", roleIds: [{roleId: ORG_ADMIN_ROLE_ID}]
        }));
    }
}
