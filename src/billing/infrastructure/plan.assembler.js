import {Plan} from "@/billing/domain/model/plan.entity.js";

export class PlanAssembler {
    static toEntityFromResource(resource) {
        return new Plan({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["plans"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
