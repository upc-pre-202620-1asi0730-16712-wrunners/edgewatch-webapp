import {ReportTemplate} from "@/reporting/domain/model/report-template.entity.js";

export class ReportTemplateAssembler {
    static toEntityFromResource(resource) {
        return new ReportTemplate({...resource, sections: (resource.sections ?? []).map(s => ({...s, widgets: s.widgets ?? []}))});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["reportTemplates"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /** Request of POST /report-templates (organization and owner come from the token). */
    static toCreateResourceFromEntity(entity) {
        const {id, organizationId, ownerUserId, status, ...resource} = entity;
        return {...resource, sections: this.#sections(entity)};
    }

    /** Request of PUT /report-templates/{id}: the kind is part of the identity. */
    static toUpdateResourceFromEntity(entity) {
        const {id, organizationId, ownerUserId, status, reportKind, ...resource} = entity;
        return {...resource, sections: this.#sections(entity)};
    }

    static #sections(entity) {
        return entity.sections.map((s, i) => ({
            title: s.title, sectionOrder: i + 1,
            widgets: s.widgets.map((w, j) => ({...w, position: j + 1}))
        }));
    }
}
