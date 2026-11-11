import {SpraySession} from "@/process-monitoring/domain/model/spray-session.entity.js";

export class SpraySessionAssembler {
    static toEntityFromResource(resource) {
        return new SpraySession({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["spraySessions"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /** Request of POST /spray-sessions: the operator and the start time come from the platform. */
    static toResourceFromEntity(entity) {
        return {hvofSystemId: entity.hvofSystemId, recuperationId: entity.recuperationId, recipeNumber: entity.recipeNumber, timeZone: entity.timeZone};
    }
}
