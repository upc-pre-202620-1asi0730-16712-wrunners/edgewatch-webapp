import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const hvofSystemsEndpointPath = import.meta.env.VITE_HVOF_SYSTEMS_ENDPOINT_PATH;
const controllersEndpointPath = import.meta.env.VITE_CONTROLLERS_ENDPOINT_PATH;
const subsystemsEndpointPath = import.meta.env.VITE_HVOF_SUBSYSTEMS_ENDPOINT_PATH;
const partsEndpointPath = import.meta.env.VITE_HVOF_PARTS_ENDPOINT_PATH;
const recipesEndpointPath = import.meta.env.VITE_RECIPES_ENDPOINT_PATH;

/**
 * API gateway of the Equipment bounded context.
 * @extends BaseApi
 */
export class EquipmentApi extends BaseApi {
    #hvofSystemsEndpoint;
    #controllersEndpoint;
    #subsystemsEndpoint;
    #partsEndpoint;
    #recipesEndpoint;

    constructor() {
        super();
        this.#hvofSystemsEndpoint = new BaseEndpoint(this, hvofSystemsEndpointPath);
        this.#controllersEndpoint = new BaseEndpoint(this, controllersEndpointPath);
        this.#subsystemsEndpoint = new BaseEndpoint(this, subsystemsEndpointPath);
        this.#partsEndpoint = new BaseEndpoint(this, partsEndpointPath);
        this.#recipesEndpoint = new BaseEndpoint(this, recipesEndpointPath);
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

    getSubsystems() {
        return this.#subsystemsEndpoint.getAll();
    }

    createSubsystem(resource) {
        return this.#subsystemsEndpoint.create(resource);
    }

    updateSubsystem(resource) {
        return this.#subsystemsEndpoint.update(resource.id, resource);
    }

    getParts() {
        return this.#partsEndpoint.getAll();
    }

    createPart(resource) {
        return this.#partsEndpoint.create(resource);
    }

    deletePart(id) {
        return this.#partsEndpoint.delete(id);
    }

    getRecipes() {
        return this.#recipesEndpoint.getAll();
    }

    createRecipe(resource) {
        return this.#recipesEndpoint.create(resource);
    }

    updateRecipe(resource) {
        return this.#recipesEndpoint.update(resource.id, resource);
    }

    patchRecipe(id, changes) {
        return this.#recipesEndpoint.patch(id, changes);
    }
}
