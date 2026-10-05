export const RECIPE_STATUSES = ["DRAFT", "ACTIVE", "RETIRED"];
export const UNIT_CATEGORIES = ["flow", "mass_flow", "pressure", "temperature", "speed", "dimensionless"];

/**
 * @typedef {Object} RecipeParameter
 * @property {string} parameter
 * @property {number} setpoint
 * @property {number} lowerShutdown
 * @property {number} lowerWarning
 * @property {number} nominalMin
 * @property {number} nominalMax
 * @property {number} upperWarning
 * @property {number} upperShutdown
 * @property {string} unitSymbol
 * @property {string} unitCategory
 */

/** @returns {boolean} LSD < LAW < min ≤ SP ≤ max < HAW < HSD */
export function thresholdsInOrder(p) {
    return p.lowerShutdown < p.lowerWarning && p.lowerWarning < p.nominalMin && p.nominalMin <= p.setpoint
        && p.setpoint <= p.nominalMax && p.nominalMax < p.upperWarning && p.upperWarning < p.upperShutdown;
}

/** Factory for an empty parameter row. */
export function emptyParameter(parameter = "") {
    return {parameter, setpoint: 0, lowerShutdown: 0, lowerWarning: 0, nominalMin: 0, nominalMax: 0, upperWarning: 0, upperShutdown: 0, unitSymbol: "", unitCategory: "flow"};
}

/**
 * Domain entity: a spray recipe with threshold bands per parameter.
 */
export class Recipe {
    constructor({id = null, hvofSystemId = null, recipeNumber = 0, name = "", powderSpecification = "", status = "DRAFT", applicabilities = [], parameters = []}) {
        this.id = id;
        this.hvofSystemId = hvofSystemId;
        this.recipeNumber = recipeNumber;
        this.name = name;
        this.powderSpecification = powderSpecification;
        this.status = status;
        this.applicabilities = applicabilities;
        this.parameters = parameters;
    }

    get isActive() {
        return this.status === "ACTIVE";
    }

    /** @returns {RecipeParameter|undefined} */
    parameterFor(parameter) {
        return this.parameters.find(p => p.parameter === parameter);
    }
}
