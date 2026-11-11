import {FaultCase} from "@/fault-diagnosis/domain/model/fault-case.entity.js";

export class FaultCaseAssembler {
    static toEntityFromResource(resource) {
        return new FaultCase({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["faultCases"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
