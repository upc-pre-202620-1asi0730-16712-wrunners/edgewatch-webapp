// TODO(F3–F5): falta contenido. Este archivo corresponde a la Parte 2 de la guía (no incluida en new-tasks);
// es una implementación mínima con lo que usan las partes 4–5 (componentes y órdenes de recuperación). Reemplázala por la versión de la guía.
import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const componentsEndpointPath = import.meta.env.VITE_COMPONENTS_ENDPOINT_PATH;
const recuperationsEndpointPath = import.meta.env.VITE_RECUPERATIONS_ENDPOINT_PATH;

/**
 * API gateway of the Traceability bounded context.
 * @extends BaseApi
 */
export class TraceabilityApi extends BaseApi {
    #componentsEndpoint;
    #recuperationsEndpoint;

    constructor() {
        super();
        this.#componentsEndpoint = new BaseEndpoint(this, componentsEndpointPath);
        this.#recuperationsEndpoint = new BaseEndpoint(this, recuperationsEndpointPath);
    }

    getComponents() {
        return this.#componentsEndpoint.getAll();
    }

    getRecuperations() {
        return this.#recuperationsEndpoint.getAll();
    }

    patchRecuperation(id, changes) {
        return this.#recuperationsEndpoint.patch(id, changes);
    }
}
