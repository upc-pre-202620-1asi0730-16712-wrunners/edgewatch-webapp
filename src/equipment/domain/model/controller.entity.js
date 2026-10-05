export const DEVICE_TYPES = ["PLC", "OPC_UA_SERVER", "GATEWAY"];
export const PROTOCOLS = ["ETHERNET_IP", "OPC_UA", "MODBUS_TCP", "S7"];

/**
 * Domain entity: a controller (PLC, OPC UA server or gateway) attached to an HVOF system.
 */
export class Controller {
    constructor({
                    id = null, hvofSystemId = null, controllerNumber = 1, deviceType = "PLC", serialNumber = "",
                    manufacturer = "", model = "", partNumber = "", ipAddress = "", port = 44818, rack = 0, slot = 0,
                    endpointUrl = null, tagCatalogId = null, supportedProtocols = []
                }) {
        this.id = id;
        this.hvofSystemId = hvofSystemId;
        this.controllerNumber = controllerNumber;
        this.deviceType = deviceType;
        this.serialNumber = serialNumber;
        this.manufacturer = manufacturer;
        this.model = model;
        this.partNumber = partNumber;
        this.ipAddress = ipAddress;
        this.port = port;
        this.rack = rack;
        this.slot = slot;
        this.endpointUrl = endpointUrl;
        this.tagCatalogId = tagCatalogId;
        this.supportedProtocols = supportedProtocols;
    }

    /** @returns {string[]} protocol names, flattened from [{protocol}] */
    get protocolNames() {
        return this.supportedProtocols.map(p => p.protocol);
    }
}
