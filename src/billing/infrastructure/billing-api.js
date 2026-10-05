import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const plansEndpointPath = import.meta.env.VITE_PLANS_ENDPOINT_PATH;
const subscriptionsEndpointPath = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH;

/**
 * API gateway of the Billing bounded context.
 * @extends BaseApi
 */
export class BillingApi extends BaseApi {
    #plansEndpoint;
    #subscriptionsEndpoint;

    constructor() {
        super();
        this.#plansEndpoint = new BaseEndpoint(this, plansEndpointPath);
        this.#subscriptionsEndpoint = new BaseEndpoint(this, subscriptionsEndpointPath);
    }

    getPlans() {
        return this.#plansEndpoint.getAll();
    }

    getSubscriptionsByOrganizationId(organizationId) {
        return this.#subscriptionsEndpoint.getAllBy({organizationId});
    }

    createSubscription(resource) {
        return this.#subscriptionsEndpoint.create(resource);
    }
}
