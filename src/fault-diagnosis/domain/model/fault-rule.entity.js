/**
 * Domain entity: cause-effect rule of an organization for a parameter in a band.
 */
export class FaultRule {
    constructor({id = null, organizationId = null, parameter = "", band = "warning", probableCause = "", recommendedAction = "", cooldownSeconds = 60}) {
        this.id = id;
        this.organizationId = organizationId;
        this.parameter = parameter;
        this.band = band;
        this.probableCause = probableCause;
        this.recommendedAction = recommendedAction;
        this.cooldownSeconds = cooldownSeconds;
    }
}
