import {Component} from "@/traceability/domain/model/component.entity.js";

/**
 * Converts between API resources and Component entities.
 */
export class ComponentAssembler {
    static toEntityFromResource(resource) {
        return new Component({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`Error fetching components: ${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["components"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
