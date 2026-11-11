import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ReportingApi} from "@/reporting/infrastructure/reporting-api.js";
import {ReportTemplateAssembler} from "@/reporting/infrastructure/report-template.assembler.js";
import {GeneratedReportAssembler} from "@/reporting/infrastructure/generated-report.assembler.js";
import {errorMessageOf} from "@/shared/infrastructure/base-api.js";

const reportingApi = new ReportingApi();

/**
 * Application store of the Reporting bounded context: templates of the organization and the registry of generated reports.
 */
const useReportingStore = defineStore("reporting", () => {
    const templates = ref([]);
    const templatesLoaded = ref(false);
    const generatedReports = ref([]);
    const generatedReportsLoaded = ref(false);
    const error = ref(null);

    const activeTemplates = computed(() => templates.value.filter(t => t.isActive));

    const fail = (err) => { console.error(err); error.value = errorMessageOf(err); return null; };

    function fetchTemplates() {
        error.value = null;
        return reportingApi.getReportTemplates().then(response => {
            templates.value = ReportTemplateAssembler.toEntitiesFromResponse(response);
            templatesLoaded.value = true;
            return templates.value;
        }).catch(fail);
    }

    function getTemplateById(id) {
        const idNum = parseInt(id);
        return templates.value.find(t => t.id === idNum);
    }

    function templatesOfKind(reportKind) {
        return activeTemplates.value.filter(t => t.reportKind === reportKind);
    }

    /** The default template of a kind, or the first active one. */
    function defaultTemplateOf(reportKind) {
        const ofKind = templatesOfKind(reportKind);
        return ofKind.find(t => t.defaultForKind) ?? ofKind[0] ?? null;
    }

    function replaceTemplate(response) {
        const updated = ReportTemplateAssembler.toEntityFromResource(response.data);
        const index = templates.value.findIndex(t => t.id === updated.id);
        if (index === -1) templates.value.push(updated); else templates.value[index] = updated;
        // Only one default per kind: the platform clears the others, the local copies follow.
        if (updated.defaultForKind) templates.value.forEach(t => { if (t.id !== updated.id && t.reportKind === updated.reportKind) t.defaultForKind = false; });
        return updated;
    }

    function addTemplate(template) {
        error.value = null;
        return reportingApi.createReportTemplate(ReportTemplateAssembler.toCreateResourceFromEntity(template)).then(replaceTemplate).catch(fail);
    }

    function updateTemplate(template) {
        error.value = null;
        return reportingApi.updateReportTemplate(template.id, ReportTemplateAssembler.toUpdateResourceFromEntity(template)).then(replaceTemplate).catch(fail);
    }

    function archiveTemplate(id) {
        error.value = null;
        return reportingApi.changeReportTemplateStatus(id, "ARCHIVED").then(replaceTemplate).catch(fail);
    }

    function reactivateTemplate(id) {
        error.value = null;
        return reportingApi.changeReportTemplateStatus(id, "ACTIVE").then(replaceTemplate).catch(fail);
    }

    function fetchGeneratedReports(filters = {}) {
        error.value = null;
        return reportingApi.getGeneratedReports(filters).then(response => {
            generatedReports.value = GeneratedReportAssembler.toEntitiesFromResponse(response);
            generatedReportsLoaded.value = true;
            return generatedReports.value;
        }).catch(fail);
    }

    function registerGeneratedReport(report) {
        error.value = null;
        return reportingApi.registerGeneratedReport(GeneratedReportAssembler.toResourceFromEntity(report)).then(response => {
            const created = GeneratedReportAssembler.toEntityFromResource(response.data);
            generatedReports.value.unshift(created);
            return created;
        }).catch(fail);
    }

    return {
        templates, templatesLoaded, activeTemplates, generatedReports, generatedReportsLoaded, error,
        fetchTemplates, getTemplateById, templatesOfKind, defaultTemplateOf, addTemplate, updateTemplate, archiveTemplate, reactivateTemplate,
        fetchGeneratedReports, registerGeneratedReport
    };
});

export default useReportingStore;
