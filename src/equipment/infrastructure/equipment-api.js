import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const hvofSystemsEndpointPath = import.meta.env.VITE_HVOF_SYSTEMS_ENDPOINT_PATH;
const controllersEndpointPath = import.meta.env.VITE_CONTROLLERS_ENDPOINT_PATH;

/**
 * API gateway of the Equipment bounded context.
 * @extends BaseApi
 */
export class EquipmentApi extends BaseApi {
    #hvofSystemsEndpoint;
    #controllersEndpoint;

    constructor() {
        super();
        this.#hvofSystemsEndpoint = new BaseEndpoint(this, hvofSystemsEndpointPath);
        this.#controllersEndpoint = new BaseEndpoint(this, controllersEndpointPath);
    }

    getHvofSystems() {
        return this.#hvofSystemsEndpoint.getAll();
    }

    createHvofSystem(resource) {
        return this.#hvofSystemsEndpoint.create(resource);
    }

    updateHvofSystem(resource) {
        return this.#hvofSystemsEndpoint.update(resource.id, resource);
    }

    getControllers() {
        return this.#controllersEndpoint.getAll();
    }

    getControllersBySystemId(hvofSystemId) {
        return this.#controllersEndpoint.getAllBy({hvofSystemId});
    }

    createController(resource) {
        return this.#controllersEndpoint.create(resource);
    }

    updateController(resource) {
        return this.#controllersEndpoint.update(resource.id, resource);
    }
}
