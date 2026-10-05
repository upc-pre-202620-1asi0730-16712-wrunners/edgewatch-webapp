import {ProcessReading} from "@/process-monitoring/domain/model/process-reading.entity.js";

export class ProcessReadingAssembler {
    static toEntityFromResource(resource) {
        return new ProcessReading({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return [];
        const resources = response.data instanceof Array ? response.data : response.data["processReadings"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {timestamp, ...resource} = entity;
        return {...resource};
    }
}
