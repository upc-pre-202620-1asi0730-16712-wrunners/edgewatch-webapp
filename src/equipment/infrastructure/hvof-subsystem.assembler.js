import {HvofSubsystem} from "@/equipment/domain/model/hvof-subsystem.entity.js";

export class HvofSubsystemAssembler {
    static toEntityFromResource(resource) {
        return new HvofSubsystem({...resource, parameters: resource.parameters ?? []});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["hvofSubsystems"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {parameterNames, ...resource} = entity;
        return {...resource};
    }
}
