import {GeneratedReport} from "@/reporting/domain/model/generated-report.entity.js";

export class GeneratedReportAssembler {
    static toEntityFromResource(resource) {
        return new GeneratedReport({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["generatedReports"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /** Request of POST /generated-reports. */
    static toResourceFromEntity(entity) {
        const {reportTemplateId, subjectType, subjectId, fileName, periodFrom, periodTo} = entity;
        return {reportTemplateId, subjectType, subjectId, fileName, periodFrom, periodTo};
    }
}
