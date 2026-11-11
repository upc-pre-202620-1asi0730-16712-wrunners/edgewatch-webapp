import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const hvofSystemsEndpointPath = import.meta.env.VITE_HVOF_SYSTEMS_ENDPOINT_PATH;
const recipesEndpointPath = import.meta.env.VITE_RECIPES_ENDPOINT_PATH;

/**
 * API gateway of the Equipment bounded context (EdgeWatch Platform).
 * Subsystems, parts and controllers are sub-resources of an HVOF system; recipes are a top-level resource.
 * @extends BaseApi
 */
export class EquipmentApi extends BaseApi {
    #hvofSystemsEndpoint;
    #recipesEndpoint;

    constructor() {
        super();
        this.#hvofSystemsEndpoint = new BaseEndpoint(this, hvofSystemsEndpointPath);
        this.#recipesEndpoint = new BaseEndpoint(this, recipesEndpointPath);
    }

    getHvofSystemsByOrganizationId(organizationId) {
        return this.#hvofSystemsEndpoint.getAllBy({organizationId});
    }

    getHvofSystemById(id) {
        return this.#hvofSystemsEndpoint.getById(id);
    }

    createHvofSystem(resource) {
        return this.#hvofSystemsEndpoint.create(resource);
    }

    updateHvofSystem(resource) {
        return this.#hvofSystemsEndpoint.update(resource.id, resource);
    }

    /** GET /hvof-systems/{id}/subsystems (each one includes its parameters and parts) */
    getSubsystemsBySystemId(hvofSystemId) {
        return this.#hvofSystemsEndpoint.getNested(hvofSystemId, "subsystems");
    }

    createSubsystem(hvofSystemId, resource) {
        return this.#hvofSystemsEndpoint.createNested(hvofSystemId, "subsystems", resource);
    }

    updateSubsystem(hvofSystemId, subsystemId, resource) {
        return this.#hvofSystemsEndpoint.updateNested(hvofSystemId, `subsystems/${subsystemId}`, resource);
    }

    /** POST /hvof-systems/{id}/subsystems/{subsystemId}/parts */
    createPart(hvofSystemId, subsystemId, resource) {
        return this.#hvofSystemsEndpoint.createNested(hvofSystemId, `subsystems/${subsystemId}/parts`, resource);
    }

    deletePart(hvofSystemId, subsystemId, partId) {
        return this.http.delete(`${hvofSystemsEndpointPath}/${hvofSystemId}/subsystems/${subsystemId}/parts/${partId}`);
    }

    getControllersBySystemId(hvofSystemId) {
        return this.#hvofSystemsEndpoint.getNested(hvofSystemId, "controllers");
    }

    createController(hvofSystemId, resource) {
        return this.#hvofSystemsEndpoint.createNested(hvofSystemId, "controllers", resource);
    }

    updateController(hvofSystemId, controllerId, resource) {
        return this.#hvofSystemsEndpoint.updateNested(hvofSystemId, `controllers/${controllerId}`, resource);
    }

    getRecipesBySystemId(hvofSystemId) {
        return this.#recipesEndpoint.getAllBy({hvofSystemId});
    }

    getRecipeById(id) {
        return this.#recipesEndpoint.getById(id);
    }

    createRecipe(resource) {
        return this.#recipesEndpoint.create(resource);
    }

    updateRecipe(resource) {
        return this.#recipesEndpoint.update(resource.id, resource);
    }

    /** PATCH /recipes/{id}/status with {status: "ACTIVE" | "RETIRED"} */
    changeRecipeStatus(id, status) {
        return this.#recipesEndpoint.patchNested(id, "status", {status});
    }
}
