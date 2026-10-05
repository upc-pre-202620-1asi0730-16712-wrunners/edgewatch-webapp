import {Recipe} from "@/equipment/domain/model/recipe.entity.js";

export class RecipeAssembler {
    static toEntityFromResource(resource) {
        return new Recipe({...resource, applicabilities: resource.applicabilities ?? [], parameters: resource.parameters ?? []});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["recipes"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {isActive, ...resource} = entity;
        return {...resource};
    }
}
