export const REPORT_SUBJECT_TYPES = ["SPRAY_SESSION", "RECUPERATION"];

/**
 * Domain entity: the record of a report rendered from a template (the file itself is downloaded by the user).
 */
export class GeneratedReport {
    constructor({
                    id = null, reportTemplateId = null, organizationId = null, generatedByUserId = null, subjectType = "SPRAY_SESSION",
                    subjectId = null, format = "PDF", fileName = "", periodFrom = null, periodTo = null, generatedAt = ""
                }) {
        this.id = id;
        this.reportTemplateId = reportTemplateId;
        this.organizationId = organizationId;
        this.generatedByUserId = generatedByUserId;
        this.subjectType = subjectType;
        this.subjectId = subjectId;
        this.format = format;
        this.fileName = fileName;
        this.periodFrom = periodFrom;
        this.periodTo = periodTo;
        this.generatedAt = generatedAt;
    }
}
