import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const customersEndpointPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH;
const componentsEndpointPath = import.meta.env.VITE_COMPONENTS_ENDPOINT_PATH;
const recuperationsEndpointPath = import.meta.env.VITE_RECUPERATIONS_ENDPOINT_PATH;

/**
 * API gateway of the Traceability bounded context.
 * @extends BaseApi
 */
export class TraceabilityApi extends BaseApi {
    #customersEndpoint;
    #componentsEndpoint;
    #recuperationsEndpoint;

    constructor() {
        super();
        this.#customersEndpoint = new BaseEndpoint(this, customersEndpointPath);
        this.#componentsEndpoint = new BaseEndpoint(this, componentsEndpointPath);
        this.#recuperationsEndpoint = new BaseEndpoint(this, recuperationsEndpointPath);
    }

    getCustomersByOrganizationId(id) {
        return this.#customersEndpoint.getAllBy({supplierOrganizationId: id});
    }

    getCustomerById(id) {
        return this.#customersEndpoint.getById(id);
    }

    createCustomer(resource) {
        return this.#customersEndpoint.create(resource);
    }

    updateCustomer(resource) {
        return this.#customersEndpoint.update(resource.id, resource);
    }

    deleteCustomer(id) {
        return this.#customersEndpoint.delete(id);
    }

    getComponents() {
        return this.#componentsEndpoint.getAll();
    }

    getComponentById(id) {
        return this.#componentsEndpoint.getById(id);
    }

    createComponent(resource) {
        return this.#componentsEndpoint.create(resource);
    }

    updateComponent(resource) {
        return this.#componentsEndpoint.update(resource.id, resource);
    }

    getRecuperations() {
        return this.#recuperationsEndpoint.getAll();
    }

    getRecuperationsByOrganizationId(id) {
        return this.#recuperationsEndpoint.getAllBy({supplierOrganizationId: id});
    }

    getRecuperationById(id) {
        return this.#recuperationsEndpoint.getById(id);
    }

    createRecuperation(resource) {
        return this.#recuperationsEndpoint.create(resource);
    }

    updateRecuperation(resource) {
        return this.#recuperationsEndpoint.update(resource.id, resource);
    }

    patchRecuperation(id, changes) {
        return this.#recuperationsEndpoint.patch(id, changes);
    }
}
