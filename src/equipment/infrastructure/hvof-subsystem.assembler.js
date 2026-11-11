import {HvofSubsystem} from "@/equipment/domain/model/hvof-subsystem.entity.js";
import {HvofPartAssembler} from "@/equipment/infrastructure/hvof-part.assembler.js";

export class HvofSubsystemAssembler {
    static toEntityFromResource(resource) {
        return new HvofSubsystem({...resource, parameters: resource.parameters ?? [], parts: (resource.parts ?? []).map(HvofPartAssembler.toEntityFromResource)});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["hvofSubsystems"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {parameterNames, parts, id, hvofSystemId, ...resource} = entity;
        return {...resource};
    }
}
