import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useFaultDiagnosisStore from "@/fault-diagnosis/application/fault-diagnosis.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {ProcessMonitoringApi} from "@/process-monitoring/infrastructure/process-monitoring-api.js";
import {ProcessReadingAssembler} from "@/process-monitoring/infrastructure/process-reading.assembler.js";
import {FaultDiagnosisApi} from "@/fault-diagnosis/infrastructure/fault-diagnosis-api.js";
import {FaultCaseAssembler} from "@/fault-diagnosis/infrastructure/fault-case.assembler.js";
import {complianceOf, groupByParameter, statisticsOf} from "@/process-monitoring/domain/model/reading-series.js";

const processMonitoringApi = new ProcessMonitoringApi();
const faultDiagnosisApi = new FaultDiagnosisApi();

/**
 * @typedef {Object} ReportContext everything a template can draw for one spray session
 * @property {SpraySession} session
 * @property {HvofSystem|null} system
 * @property {Recipe|null} recipe
 * @property {Recuperation|null} recuperation
 * @property {Component|null} component
 * @property {Customer|null} customer
 * @property {ProcessReading[]} readings
 * @property {Map<string, ProcessReading[]>} byParameter
 * @property {FaultCase[]} faultCases
 * @property {string} operatorName
 */

/**
 * Gathers, across bounded contexts, the data a report about a spray session is rendered from.
 */
export class ReportDataService {
    #monitoring = useProcessMonitoringStore();
    #equipment = useEquipmentStore();
    #traceability = useTraceabilityStore();
    #faults = useFaultDiagnosisStore();
    #iam = useIamStore();

    /** @returns {Promise<ReportContext>} */
    async contextOfSession(sessionId) {
        const idNum = parseInt(sessionId);
        await Promise.all([
            this.#monitoring.sessionsLoaded ? null : this.#monitoring.fetchSessions(),
            this.#equipment.fetchAll(),
            this.#traceability.fetchAll()
        ]);
        const session = this.#monitoring.getSessionById(idNum);
        if (!session) throw new Error(`Session ${sessionId} not found`);
        const [readingsResponse, casesResponse] = await Promise.all([
            processMonitoringApi.getReadingsBySessionId(idNum),
            faultDiagnosisApi.getFaultCases({spraySessionId: idNum})
        ]);
        const readings = ProcessReadingAssembler.toEntitiesFromResponse(readingsResponse);
        const faultCases = FaultCaseAssembler.toEntitiesFromResponse(casesResponse);
        const recuperation = this.#traceability.getRecuperationById(session.recuperationId) ?? null;
        const component = recuperation ? this.#traceability.components.find(c => c.id === recuperation.componentId) ?? null : null;
        const customer = recuperation ? this.#traceability.getCustomerById(recuperation.customerId) ?? null : null;
        return {
            session,
            system: this.#equipment.getHvofSystemById(session.hvofSystemId) ?? null,
            recipe: this.#equipment.recipeByNumber(session.hvofSystemId, session.recipeNumber) ?? null,
            recuperation, component, customer, readings, byParameter: groupByParameter(readings), faultCases,
            operatorName: session.operatorId === this.#iam.userId ? (this.#iam.fullName ?? "") : `#${session.operatorId}`
        };
    }

    /** Resolves a widget to a displayable value (string) using the context. Trend and table widgets return their rows instead. */
    static resolve(widget, context, t) {
        const {session, recuperation, component, customer, system, recipe, readings, byParameter, faultCases} = context;
        const number = (v, digits = 1) => v === null || v === undefined || Number.isNaN(v) ? "–" : Number(v).toLocaleString("es-PE", {maximumFractionDigits: digits});
        const date = (d) => d ? new Date(d).toLocaleString("es-PE", {dateStyle: "short", timeStyle: "short"}) : "–";
        switch (widget.variableSource) {
            case "PROCESS": {
                const list = byParameter.get(widget.variableCode) ?? [];
                const stats = statisticsOf(list);
                const p = recipe?.parameterFor(widget.variableCode);
                const unit = p?.unitSymbol ?? list[0]?.unitSymbol ?? "";
                if (widget.viewType === "TREND") return {rows: list, parameter: p, unit};
                if (widget.viewType === "MIN_MAX" || widget.aggregation === "RANGE")
                    return stats.count ? `${number(stats.min)} – ${number(stats.max)} ${unit}` : "–";
                const value = {AVG: stats.mean, MIN: stats.min, MAX: stats.max, LAST: stats.last, COUNT: stats.count}[widget.aggregation];
                return stats.count ? `${number(value, widget.aggregation === "COUNT" ? 0 : 1)} ${widget.aggregation === "COUNT" ? "" : unit}`.trim() : "–";
            }
            case "SESSION":
                switch (widget.variableCode) {
                    case "system": return system?.displayName ?? `#${session.hvofSystemId}`;
                    case "recipe": return recipe ? `#${recipe.recipeNumber} · ${recipe.name}` : `#${session.recipeNumber}`;
                    case "operator": return context.operatorName;
                    case "started_at": return date(session.startedAt);
                    case "ended_at": return date(session.endedAt);
                    case "duration": return `${session.durationMinutes} min`;
                    case "status": return t("spray-sessions.status-option." + session.status);
                    case "readings": return String(readings.length);
                    case "compliance": { const c = complianceOf(readings); return c === null ? "–" : `${number(c)} %`; }
                    case "deviations": {
                        const rows = readings.filter(r => r.band === "warning" || r.band === "shutdown");
                        return widget.viewType === "TABLE" ? {rows} : String(rows.length);
                    }
                    default: return "–";
                }
            case "RECUPERATION":
                switch (widget.variableCode) {
                    case "work_order_number": return recuperation?.workOrderNumber ?? "–";
                    case "manufacturing_order_number": return recuperation?.manufacturingOrderNumber ?? "–";
                    case "component_serial": return component?.serialNumber ?? "–";
                    case "component_part_number": return component?.partNumber ?? "–";
                    case "machine": return component?.machine ?? "–";
                    case "customer_name": return customer?.legalName ?? "–";
                    case "mine_site": return customer?.mineSite ?? "–";
                    case "operation": return recuperation?.operation ?? "–";
                    case "powder_lot_number": return recuperation?.powderLotNumber ?? "–";
                    case "powder_chemical_composition": return recuperation?.powderChemicalComposition ?? "–";
                    default: return "–";
                }
            case "FAULT_CASES": {
                const rows = widget.variableCode === "open_cases" ? faultCases.filter(c => c.isOpen) : faultCases;
                return widget.viewType === "TABLE" ? {rows} : String(rows.length);
            }
            default: return "–";
        }
    }
}
