import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const faultCasesEndpointPath = import.meta.env.VITE_FAULT_CASES_ENDPOINT_PATH;
const faultRulesEndpointPath = import.meta.env.VITE_FAULT_RULES_ENDPOINT_PATH;

/**
 * API gateway of the Fault Diagnosis bounded context (EdgeWatch Platform).
 * @extends BaseApi
 */
export class FaultDiagnosisApi extends BaseApi {
    #faultCasesEndpoint;
    #faultRulesEndpoint;

    constructor() {
        super();
        this.#faultCasesEndpoint = new BaseEndpoint(this, faultCasesEndpointPath);
        this.#faultRulesEndpoint = new BaseEndpoint(this, faultRulesEndpointPath);
    }

    /** @param {{spraySessionId?: number, status?: string}} filters */
    getFaultCases(filters = {}) {
        return this.#faultCasesEndpoint.getAllBy(filters);
    }

    getFaultCaseById(id) {
        return this.#faultCasesEndpoint.getById(id);
    }

    /** PATCH /fault-cases/{id} with {status: "acknowledged"|"resolved", resolutionNotes?} */
    changeFaultCaseStatus(id, status, resolutionNotes = null) {
        return this.#faultCasesEndpoint.patch(id, {status, resolutionNotes});
    }

    getFaultRules() {
        return this.#faultRulesEndpoint.getAll();
    }

    createFaultRule(resource) {
        return this.#faultRulesEndpoint.create(resource);
    }

    updateFaultRule(id, resource) {
        return this.#faultRulesEndpoint.update(id, resource);
    }
}
