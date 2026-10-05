import {Controller} from "@/equipment/domain/model/controller.entity.js";

export class ControllerAssembler {
    static toEntityFromResource(resource) {
        return new Controller({...resource, supportedProtocols: resource.supportedProtocols ?? []});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`Error fetching controllers: ${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data["controllers"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        const {protocolNames, ...resource} = entity;
        return {...resource};
    }
}
