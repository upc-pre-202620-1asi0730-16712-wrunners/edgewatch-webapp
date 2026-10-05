import {Recuperation} from "@/traceability/domain/model/recuperation.entity.js";

/**
 * Converts between API resources and Recuperation entities.
 */
export class RecuperationAssembler {
    static toEntityFromResource(resource) {
        return new Recuperation({...resource, linkedSessions: resource.linkedSessions ?? []});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`Error fetching recuperations: ${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["recuperations"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
