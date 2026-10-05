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

    static toResourceFromEntity(entity) {
        const {isActive, ...resource} = entity;
        return {...resource};
    }
}
