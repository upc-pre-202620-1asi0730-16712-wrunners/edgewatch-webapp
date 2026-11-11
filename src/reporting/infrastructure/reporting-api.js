import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const reportTemplatesEndpointPath = import.meta.env.VITE_REPORT_TEMPLATES_ENDPOINT_PATH;
const generatedReportsEndpointPath = import.meta.env.VITE_GENERATED_REPORTS_ENDPOINT_PATH;

/**
 * API gateway of the Reporting bounded context (EdgeWatch Platform).
 * @extends BaseApi
 */
export class ReportingApi extends BaseApi {
    #reportTemplatesEndpoint;
    #generatedReportsEndpoint;

    constructor() {
        super();
        this.#reportTemplatesEndpoint = new BaseEndpoint(this, reportTemplatesEndpointPath);
        this.#generatedReportsEndpoint = new BaseEndpoint(this, generatedReportsEndpointPath);
    }

    /** GET /report-templates?reportKind= (the organization comes from the token) */
    getReportTemplates(reportKind = null) {
        return reportKind ? this.#reportTemplatesEndpoint.getAllBy({reportKind}) : this.#reportTemplatesEndpoint.getAll();
    }

    getReportTemplateById(id) {
        return this.#reportTemplatesEndpoint.getById(id);
    }

    createReportTemplate(resource) {
        return this.#reportTemplatesEndpoint.create(resource);
    }

    updateReportTemplate(id, resource) {
        return this.#reportTemplatesEndpoint.update(id, resource);
    }

    /** PATCH /report-templates/{id}/status with {status: "ACTIVE" | "ARCHIVED"} */
    changeReportTemplateStatus(id, status) {
        return this.#reportTemplatesEndpoint.patchNested(id, "status", {status});
    }

    /** @param {{subjectType?: string, subjectId?: number}} filters */
    getGeneratedReports(filters = {}) {
        return this.#generatedReportsEndpoint.getAllBy(filters);
    }

    registerGeneratedReport(resource) {
        return this.#generatedReportsEndpoint.create(resource);
    }
}
