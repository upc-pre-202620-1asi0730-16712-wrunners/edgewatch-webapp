import {FaultRule} from "@/fault-diagnosis/domain/model/fault-rule.entity.js";

export class FaultRuleAssembler {
    static toEntityFromResource(resource) {
        return new FaultRule({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["faultRules"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /** Request of POST /fault-rules. */
    static toCreateResourceFromEntity(entity) {
        const {parameter, band, probableCause, recommendedAction, cooldownSeconds} = entity;
        return {parameter, band, probableCause, recommendedAction, cooldownSeconds};
    }

    /** Request of PUT /fault-rules/{id}: parameter and band are the rule identity and never change. */
    static toUpdateResourceFromEntity(entity) {
        const {probableCause, recommendedAction, cooldownSeconds} = entity;
        return {probableCause, recommendedAction, cooldownSeconds};
    }
}
