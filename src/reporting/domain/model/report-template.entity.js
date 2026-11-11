export const REPORT_KINDS = ["QUALITY_CERTIFICATE", "SESSION_REPORT", "FAULT_SUMMARY"];
export const PAGE_SIZES = ["A4", "LETTER"];
export const ORIENTATIONS = ["PORTRAIT", "LANDSCAPE"];
export const TEMPLATE_STATUSES = ["ACTIVE", "ARCHIVED"];
export const VARIABLE_SOURCES = ["PROCESS", "SESSION", "RECUPERATION", "FAULT_CASES"];
export const VIEW_TYPES = ["VALUE", "MIN_MAX", "TREND", "TABLE", "TEXT"];
export const AGGREGATIONS = ["AVG", "MIN", "MAX", "RANGE", "LAST", "COUNT"];
export const WIDGET_WIDTHS = ["HALF", "FULL"];

/** Variables each non-process source can show; process variables are the recipe parameters. */
export const SOURCE_VARIABLES = {
    SESSION: ["system", "recipe", "operator", "started_at", "ended_at", "duration", "status", "readings", "compliance", "deviations"],
    RECUPERATION: ["work_order_number", "manufacturing_order_number", "component_serial", "component_part_number", "machine", "customer_name", "mine_site", "operation", "powder_lot_number", "powder_chemical_composition"],
    FAULT_CASES: ["cases", "open_cases"]
};

/** View types that make sense for each source. */
export const VIEWS_BY_SOURCE = {
    PROCESS: ["VALUE", "MIN_MAX", "TREND"],
    SESSION: ["VALUE", "TABLE"],
    RECUPERATION: ["VALUE", "TEXT"],
    FAULT_CASES: ["VALUE", "TABLE"]
};

/**
 * @typedef {Object} ReportWidget
 * @property {number} position
 * @property {string} variableSource PROCESS | SESSION | RECUPERATION | FAULT_CASES
 * @property {string} variableCode
 * @property {string} variableLabel
 * @property {string} viewType VALUE | MIN_MAX | TREND | TABLE | TEXT
 * @property {string} aggregation AVG | MIN | MAX | RANGE | LAST | COUNT
 * @property {string} width HALF | FULL
 */

/** @typedef {{title: string, sectionOrder: number, widgets: ReportWidget[]}} ReportSection */

export function emptyWidget(position = 1) {
    return {position, variableSource: "PROCESS", variableCode: "", variableLabel: "", viewType: "MIN_MAX", aggregation: "RANGE", width: "HALF"};
}

export function emptySection(sectionOrder = 1) {
    return {title: "", sectionOrder, widgets: [emptyWidget(1)]};
}

/**
 * Domain entity: a customizable report layout (branding, page setup and ordered sections of widgets).
 */
export class ReportTemplate {
    constructor({
                    id = null, organizationId = null, ownerUserId = null, name = "", description = "", reportKind = "SESSION_REPORT",
                    primaryColor = "#0E1A2B", secondaryColor = "#D4781C", headerText = "", footerText = "", pageSize = "A4", orientation = "PORTRAIT",
                    showSignatureBlock = false, defaultForKind = false, status = "ACTIVE", sections = []
                }) {
        this.id = id;
        this.organizationId = organizationId;
        this.ownerUserId = ownerUserId;
        this.name = name;
        this.description = description;
        this.reportKind = reportKind;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.headerText = headerText;
        this.footerText = footerText;
        this.pageSize = pageSize;
        this.orientation = orientation;
        this.showSignatureBlock = showSignatureBlock;
        this.defaultForKind = defaultForKind;
        this.status = status;
        this.sections = sections;
    }

    get isActive() {
        return this.status === "ACTIVE";
    }

    get widgetCount() {
        return this.sections.reduce((n, s) => n + s.widgets.length, 0);
    }

    /** Sections sorted by order with their widgets sorted by position. */
    get orderedSections() {
        return [...this.sections].sort((a, b) => a.sectionOrder - b.sectionOrder)
            .map(s => ({...s, widgets: [...s.widgets].sort((a, b) => a.position - b.position)}));
    }
}
