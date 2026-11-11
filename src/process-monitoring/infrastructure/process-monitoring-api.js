import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const sessionsEndpointPath = import.meta.env.VITE_SPRAY_SESSIONS_ENDPOINT_PATH;

/**
 * API gateway of the Process Monitoring bounded context (EdgeWatch Platform).
 * Readings and deviations are sub-resources of a spray session.
 * @extends BaseApi
 */
export class ProcessMonitoringApi extends BaseApi {
    #sessionsEndpoint;

    constructor() {
        super();
        this.#sessionsEndpoint = new BaseEndpoint(this, sessionsEndpointPath);
    }

    /** Sessions of the signed-in organization (resolved from the token). */
    getSessions() {
        return this.#sessionsEndpoint.getAll();
    }

    getSessionsByRecuperationId(recuperationId) {
        return this.#sessionsEndpoint.getAllBy({recuperationId});
    }

    getSessionById(id) {
        return this.#sessionsEndpoint.getById(id);
    }

    /** POST /spray-sessions with {hvofSystemId, recuperationId, recipeNumber, timeZone} */
    createSession(resource) {
        return this.#sessionsEndpoint.create(resource);
    }

    /** PATCH /spray-sessions/{id} with {status: "completed"|"aborted", abortReason?} */
    patchSession(id, changes) {
        return this.#sessionsEndpoint.patch(id, changes);
    }

    getReadingsBySessionId(spraySessionId) {
        return this.#sessionsEndpoint.getNested(spraySessionId, "readings");
    }

    getReadingsBySessionIdAndBand(spraySessionId, band) {
        return this.#sessionsEndpoint.getNested(spraySessionId, "readings", {band});
    }

    /** GET /spray-sessions/{id}/deviations → {warning, shutdown, total} */
    getDeviationsBySessionId(spraySessionId) {
        return this.#sessionsEndpoint.getNested(spraySessionId, "deviations");
    }

    /** POST /spray-sessions/{id}/readings with an array of readings; the platform classifies the band. */
    createReadings(spraySessionId, resources) {
        return this.#sessionsEndpoint.createNested(spraySessionId, "readings", resources);
    }
}
