// TODO(F3–F5): falta contenido. Este archivo corresponde a la Parte 2 de la guía (no incluida en new-tasks);
// es una implementación mínima con lo que usan las partes 3–5 (COMPONENT_TYPES para RecipeForm). Reemplázala por la versión de la guía.
export const COMPONENT_TYPES = ["HYDRAULIC_ROD", "CYLINDER_BLOCK"];

/**
 * Domain entity: a customer component that goes through recuperation.
 */
export class Component {
    constructor({
                    id = null, serialNumber = "", partNumber = "", componentType = "HYDRAULIC_ROD", machineManufacturer = "",
                    machineModel = "", customerId = null, pcrTargetHours = 0, status = "RECEIVED"
                }) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.partNumber = partNumber;
        this.componentType = componentType;
        this.machineManufacturer = machineManufacturer;
        this.machineModel = machineModel;
        this.customerId = customerId;
        this.pcrTargetHours = pcrTargetHours;
        this.status = status;
    }
}
