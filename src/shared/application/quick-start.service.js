import useIamStore from "@/iam/application/iam.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useProcessMonitoringStore from "@/process-monitoring/application/process-monitoring.store.js";
import {HvofSystem} from "@/equipment/domain/model/hvof-system.entity.js";
import {HvofSubsystem} from "@/equipment/domain/model/hvof-subsystem.entity.js";
import {Recipe} from "@/equipment/domain/model/recipe.entity.js";
import {Customer} from "@/traceability/domain/model/customer.entity.js";
import {Component} from "@/traceability/domain/model/component.entity.js";
import {Recuperation} from "@/traceability/domain/model/recuperation.entity.js";
import {SpraySession} from "@/process-monitoring/domain/model/spray-session.entity.js";
import {DEMO_PLANT} from "@/shared/domain/model/demo-plant.js";

/**
 * Orchestrates the bounded contexts so an organization can go from an empty account to a running spray session
 * in one screen: it reports what is still missing and provisions the demo plant in the right order
 * (system → subsystems → recipe → customer → component → recuperation), reusing whatever already exists.
 */
export class QuickStartService {
    #iam = useIamStore();
    #equipment = useEquipmentStore();
    #traceability = useTraceabilityStore();
    #monitoring = useProcessMonitoringStore();

    /** Loads every collection the readiness depends on. */
    load() {
        return Promise.all([this.#equipment.fetchAll(), this.#traceability.fetchAll()]);
    }

    /** @returns {{key: string, done: boolean, count: number, route: string}[]} one entry per prerequisite of a spray session. */
    readiness() {
        const e = this.#equipment, t = this.#traceability;
        const systemsWithParameters = e.hvofSystems.filter(s => e.parametersOf(s.id).length > 0);
        return [
            {key: "hvof-system",  done: e.hvofSystems.length > 0,                        count: e.hvofSystems.length,                        route: "/equipment/hvof-systems"},
            {key: "subsystems",   done: systemsWithParameters.length > 0,               count: e.subsystems.length,                         route: "/equipment/hvof-systems"},
            {key: "recipe",       done: e.recipes.some(r => r.isActive),                count: e.recipes.filter(r => r.isActive).length,    route: "/equipment/hvof-systems"},
            {key: "customer",     done: t.customers.length > 0,                         count: t.customers.length,                          route: "/traceability/customers"},
            {key: "component",    done: t.components.length > 0,                        count: t.components.length,                         route: "/traceability/components"},
            {key: "recuperation", done: t.openRecuperations.length > 0,                 count: t.openRecuperations.length,                  route: "/traceability/recuperations"}
        ];
    }

    get isReady() {
        return this.readiness().every(step => step.done);
    }

    /**
     * Provisions the demo plant. `onStep(key, status)` is called with "running", "done" or "skipped" for each step.
     * @returns {Promise<{hvofSystem, recipe, recuperation}>} the records a session can be started with.
     */
    async provision(onStep = () => {}) {
        const organizationId = this.#iam.organizationId;
        const e = this.#equipment, t = this.#traceability, demo = DEMO_PLANT;
        const step = async (key, existing, create) => {
            onStep(key, "running");
            if (existing) { onStep(key, "skipped"); return existing; }
            const created = await create();
            if (!created || (!Array.isArray(created) && created.id == null)) throw this.#lastError(`quick-start:${key}`);
            onStep(key, "done");
            return created;
        };

        const hvofSystem = await step("hvof-system", e.hvofSystems.find(s => s.code === demo.hvofSystem.code),
            () => e.addHvofSystem(new HvofSystem({...demo.hvofSystem, organizationId})));

        await step("subsystems", e.subsystemsOf(hvofSystem.id).length > 0 ? e.subsystemsOf(hvofSystem.id) : null, async () => {
            const created = [];
            for (const s of demo.subsystems)
                created.push(await e.addSubsystem(new HvofSubsystem({...s, hvofSystemId: hvofSystem.id, parameters: s.parameters.map(parameter => ({parameter}))})));
            return created.every(Boolean) ? created : null;
        });

        const recipe = await step("recipe", e.activeRecipesOf(hvofSystem.id).find(r => r.recipeNumber === demo.recipe.recipeNumber), async () => {
            const draft = e.recipesOf(hvofSystem.id).find(r => r.recipeNumber === demo.recipe.recipeNumber && r.status === "DRAFT")
                ?? await e.addRecipe(new Recipe({...demo.recipe, hvofSystemId: hvofSystem.id}));
            return draft ? e.publishRecipe(draft.id) : null;
        });

        const customer = await step("customer", t.customers.find(c => c.ruc === demo.customer.ruc),
            () => t.addCustomer(new Customer({...demo.customer, supplierOrganizationId: organizationId})));

        const component = await step("component", t.components.find(c => c.serialNumber === demo.component.serialNumber),
            () => t.addComponent(new Component({...demo.component, customerId: customer.id})));

        // Any open order of the demo component serves; when all of them are closed a new order is opened with a fresh work order number.
        const recuperation = await step("recuperation", t.openRecuperations.find(r => r.componentId === component.id),
            () => t.addRecuperation(new Recuperation({
                ...demo.recuperation, workOrderNumber: this.#nextWorkOrderNumber(demo.recuperation.workOrderNumber),
                componentId: component.id, customerId: customer.id, supplierOrganizationId: organizationId,
                receivedAt: new Date().toISOString().slice(0, 10)
            })));

        return {hvofSystem, recipe, recuperation};
    }

    /** Starts a spray session on the given system, order and recipe; the platform freezes the recipe bands. Rejects with the API error. */
    startSession({hvofSystem, recipe, recuperation}) {
        return this.#monitoring.startSession(new SpraySession({
            hvofSystemId: hvofSystem.id, recuperationId: recuperation.id, operatorId: this.#iam.userId,
            recipeNumber: recipe.recipeNumber, startedAt: new Date().toISOString(), status: "active"
        })).then(session => {
            if (!session) throw this.#lastError("quick-start:session");
            this.#traceability.fetchRecuperations();
            return session;
        });
    }

    /** The demo work order number, or the same number with a numeric suffix when it is already taken by a closed order. */
    #nextWorkOrderNumber(base) {
        const taken = new Set(this.#traceability.recuperations.map(r => r.workOrderNumber));
        if (!taken.has(base)) return base;
        let n = 2;
        while (taken.has(`${base}-${n}`)) n++;
        return `${base}-${n}`;
    }

    /** The stores swallow API errors into their `errors` list; the most recent one explains a failed step. */
    #lastError(fallback) {
        const errors = [this.#equipment, this.#traceability, this.#monitoring].flatMap(store => store.errors);
        return errors.length ? errors[errors.length - 1] : new Error(fallback);
    }
}
