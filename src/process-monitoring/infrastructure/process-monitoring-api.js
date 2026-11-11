import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const sessionsEndpointPath = import.meta.env.VITE_SPRAY_SESSIONS_ENDPOINT_PATH;
const readingsEndpointPath = import.meta.env.VITE_PROCESS_READINGS_ENDPOINT_PATH;

/**
 * API gateway of the Process Monitoring bounded context.
 * @extends BaseApi
 */
export class ProcessMonitoringApi extends BaseApi {
    #sessionsEndpoint;
    #readingsEndpoint;

    constructor() {
        super();
        this.#sessionsEndpoint = new BaseEndpoint(this, sessionsEndpointPath);
        this.#readingsEndpoint = new BaseEndpoint(this, readingsEndpointPath);
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

    getReadingsBySessionId(spraySessionId) {
        return this.#readingsEndpoint.getAllBy({spraySessionId, _sort: "epochMillis", _order: "asc"});
    }

    getReadingsBySessionIdAndBand(spraySessionId, band) {
        return this.#readingsEndpoint.getAllBy({spraySessionId, band});
    }

    createReading(resource) {
        return this.#readingsEndpoint.create(resource);
    }
}
