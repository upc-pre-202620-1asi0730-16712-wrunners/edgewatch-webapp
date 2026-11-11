import {Role} from "@/iam/domain/model/role.entity.js";

export class RoleAssembler {
    static toEntityFromResource(resource) {
        return new Role({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["roles"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
