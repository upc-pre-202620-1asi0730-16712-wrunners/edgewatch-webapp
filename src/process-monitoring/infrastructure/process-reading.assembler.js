import {ProcessReading} from "@/process-monitoring/domain/model/process-reading.entity.js";

export class ProcessReadingAssembler {
    static toEntityFromResource(resource) {
        return new ProcessReading({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) return [];
        const resources = response.data instanceof Array ? response.data : response.data["processReadings"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /** Request item of POST /spray-sessions/{id}/readings: the platform assigns id and band. */
    static toResourceFromEntity(entity) {
        const {id, spraySessionId, band, timestamp, ...resource} = entity;
        return {...resource};
    }
}
