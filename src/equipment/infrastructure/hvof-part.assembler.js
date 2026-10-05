import {HvofPart} from "@/equipment/domain/model/hvof-part.entity.js";

export class HvofPartAssembler {
    static toEntityFromResource(resource) {
        return new HvofPart({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["hvofParts"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
