import {Customer} from "@/traceability/domain/model/customer.entity.js";

/**
 * Converts between API resources and Customer entities.
 */
export class CustomerAssembler {
    static toEntityFromResource(resource) {
        return new Customer({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`Error fetching customers: ${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["customers"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {...entity};
    }
}
