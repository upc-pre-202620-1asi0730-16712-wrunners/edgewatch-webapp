import {HvofSystem} from "@/equipment/domain/model/hvof-system.entity.js";

export class HvofSystemAssembler {
    static toEntityFromResource(resource) {
        return new HvofSystem({...resource, tagMappings: resource.tagMappings ?? []});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`Error fetching HVOF systems: ${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["hvofSystems"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {isActive, displayName, ...resource} = entity;
        return {...resource};
    }
}
