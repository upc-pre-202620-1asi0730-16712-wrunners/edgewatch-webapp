import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const sessionsEndpointPath = import.meta.env.VITE_SPRAY_SESSIONS_ENDPOINT_PATH;

/**
 * API gateway of the Process Monitoring bounded context.
 * @extends BaseApi
 */
export class ProcessMonitoringApi extends BaseApi {
    #sessionsEndpoint;

    constructor() {
        super();
        this.#sessionsEndpoint = new BaseEndpoint(this, sessionsEndpointPath);
    }

    getSessions() {
        return this.#sessionsEndpoint.getAll();
    }

    createSession(resource) {
        return this.#sessionsEndpoint.create(resource);
    }

    patchSession(id, changes) {
        return this.#sessionsEndpoint.patch(id, changes);
    }
}
