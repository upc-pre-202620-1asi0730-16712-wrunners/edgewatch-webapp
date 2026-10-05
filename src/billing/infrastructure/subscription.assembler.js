import {Subscription} from "@/billing/domain/model/subscription.entity.js";

export class SubscriptionAssembler {
    static toEntityFromResource(resource) {
        return new Subscription({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["subscriptions"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {daysToExpiry, isActive, ...resource} = entity;
        return {...resource};
    }
}
