import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {EquipmentApi} from "@/equipment/infrastructure/equipment-api.js";
import {HvofSystemAssembler} from "@/equipment/infrastructure/hvof-system.assembler.js";
import {ControllerAssembler} from "@/equipment/infrastructure/controller.assembler.js";
import {HvofSubsystemAssembler} from "@/equipment/infrastructure/hvof-subsystem.assembler.js";
import {HvofPartAssembler} from "@/equipment/infrastructure/hvof-part.assembler.js";
import {RecipeAssembler} from "@/equipment/infrastructure/recipe.assembler.js";
import useIamStore from "@/iam/application/iam.store.js";

const equipmentApi = new EquipmentApi();

/**
 * Application store of the Equipment bounded context.
 * Subsystems (with their parts), controllers and recipes are loaded per HVOF system of the organization.
 */
const useEquipmentStore = defineStore("equipment", () => {
    const hvofSystems = ref([]);
    const hvofSystemsLoaded = ref(false);
    const controllers = ref([]);
    const controllersLoaded = ref(false);
    const subsystems = ref([]);
    const subsystemsLoaded = ref(false);
    const recipes = ref([]);
    const recipesLoaded = ref(false);
    const errors = ref([]);

    const activeHvofSystems = computed(() => hvofSystems.value.filter(s => s.isActive));
    /** Parts of every subsystem, flattened (kept for views that list parts). */
    const parts = computed(() => subsystems.value.flatMap(s => s.parts));
    const partsLoaded = computed(() => subsystemsLoaded.value);

    const fail = (error) => { console.error(error); errors.value.push(error); };

    function fetchHvofSystems() {
        const organizationId = useIamStore().organizationId;
        if (!organizationId) return Promise.resolve([]);
        return equipmentApi.getHvofSystemsByOrganizationId(organizationId).then(response => {
            hvofSystems.value = HvofSystemAssembler.toEntitiesFromResponse(response);
            hvofSystemsLoaded.value = true;
            return hvofSystems.value;
        }).catch(error => { fail(error); return []; });
    }

    /** Loads a collection of every system in parallel and flattens it. */
    function fetchPerSystem(request, assembler, target, loaded) {
        const systems = hvofSystems.value;
        return Promise.all(systems.map(s => request(s.id).then(response => assembler.toEntitiesFromResponse(response)).catch(error => { fail(error); return []; })))
            .then(lists => { target.value = lists.flat(); loaded.value = true; return target.value; });
    }

    const fetchSubsystems = () => fetchPerSystem(id => equipmentApi.getSubsystemsBySystemId(id), HvofSubsystemAssembler, subsystems, subsystemsLoaded);
    const fetchControllers = () => fetchPerSystem(id => equipmentApi.getControllersBySystemId(id), ControllerAssembler, controllers, controllersLoaded);
    const fetchRecipes = () => fetchPerSystem(id => equipmentApi.getRecipesBySystemId(id), RecipeAssembler, recipes, recipesLoaded);

    /** Kept for compatibility: parts travel inside their subsystem. */
    const fetchParts = () => subsystemsLoaded.value ? Promise.resolve(parts.value) : fetchSubsystems();

    function getHvofSystemById(id) {
        const idNum = parseInt(id);
        return hvofSystems.value.find(s => s.id === idNum);
    }

    function controllersOf(hvofSystemId) {
        return controllers.value.filter(c => c.hvofSystemId === hvofSystemId);
    }

    function getControllerById(id) {
        const idNum = parseInt(id);
        return controllers.value.find(c => c.id === idNum);
    }

    function subsystemsOf(hvofSystemId) {
        return subsystems.value.filter(s => s.hvofSystemId === hvofSystemId);
    }

    function getSubsystemById(id) {
        const idNum = parseInt(id);
        return subsystems.value.find(s => s.id === idNum);
    }

    function partsOf(subsystemId) {
        return getSubsystemById(subsystemId)?.parts ?? [];
    }

    /** Distinct parameter names declared by the subsystems of a system (feeds the recipe form). */
    function parametersOf(hvofSystemId) {
        return [...new Set(subsystemsOf(hvofSystemId).flatMap(s => s.parameterNames))];
    }

    function recipesOf(hvofSystemId) {
        return recipes.value.filter(r => r.hvofSystemId === hvofSystemId);
    }

    function activeRecipesOf(hvofSystemId) {
        return recipesOf(hvofSystemId).filter(r => r.isActive);
    }

    function getRecipeById(id) {
        const idNum = parseInt(id);
        return recipes.value.find(r => r.id === idNum);
    }

    function recipeByNumber(hvofSystemId, recipeNumber) {
        return activeRecipesOf(hvofSystemId).find(r => r.recipeNumber === recipeNumber) ?? recipesOf(hvofSystemId).find(r => r.recipeNumber === recipeNumber);
    }

    /** Generic create/update helper: keeps the store rhythm in one place. */
    function upsert(list, request, assembler) {
        return request.then(response => {
            const entity = assembler.toEntityFromResource(response.data);
            const index = list.value.findIndex(e => e.id === entity.id);
            if (index === -1) list.value.push(entity); else list.value[index] = entity;
            return entity;
        }).catch(fail);
    }

    function addHvofSystem(system) {
        const resource = HvofSystemAssembler.toResourceFromEntity(system);
        delete resource.id;
        delete resource.tagMappings;
        delete resource.status;
        return upsert(hvofSystems, equipmentApi.createHvofSystem(resource), HvofSystemAssembler);
    }

    function updateHvofSystem(system) {
        return upsert(hvofSystems, equipmentApi.updateHvofSystem(HvofSystemAssembler.toResourceFromEntity(system)), HvofSystemAssembler);
    }

    function addController(controller) {
        const resource = ControllerAssembler.toResourceFromEntity(controller);
        return upsert(controllers, equipmentApi.createController(controller.hvofSystemId, resource), ControllerAssembler);
    }

    function updateController(controller) {
        const resource = ControllerAssembler.toResourceFromEntity(controller);
        return upsert(controllers, equipmentApi.updateController(controller.hvofSystemId, controller.id, resource), ControllerAssembler);
    }

    function addSubsystem(subsystem) {
        const resource = HvofSubsystemAssembler.toResourceFromEntity(subsystem);
        return upsert(subsystems, equipmentApi.createSubsystem(subsystem.hvofSystemId, resource), HvofSubsystemAssembler);
    }

    function updateSubsystem(subsystem) {
        const resource = HvofSubsystemAssembler.toResourceFromEntity(subsystem);
        return upsert(subsystems, equipmentApi.updateSubsystem(subsystem.hvofSystemId, subsystem.id, resource), HvofSubsystemAssembler);
    }

    function deletePart(id) {
        const subsystem = subsystems.value.find(s => s.parts.some(p => p.id === id));
        if (!subsystem) return Promise.resolve();
        return equipmentApi.deletePart(subsystem.hvofSystemId, subsystem.id, id).then(() => {
            const index = subsystem.parts.findIndex(p => p.id === id);
            if (index !== -1) subsystem.parts.splice(index, 1);
        }).catch(fail);
    }

    /** Adds a part to its subsystem and refreshes the subsystem in the store. */
    function addPart(part) {
        const subsystem = getSubsystemById(part.hvofSubsystemId);
        if (!subsystem) return Promise.resolve(null);
        const resource = HvofPartAssembler.toResourceFromEntity(part);
        return equipmentApi.createPart(subsystem.hvofSystemId, subsystem.id, resource).then(response => {
            const created = HvofPartAssembler.toEntityFromResource(response.data);
            subsystem.parts.push(created);
            return created;
        }).catch(fail);
    }

    function addRecipe(recipe) {
        const resource = RecipeAssembler.toResourceFromEntity(recipe);
        return upsert(recipes, equipmentApi.createRecipe(resource), RecipeAssembler);
    }

    function updateRecipe(recipe) {
        const resource = {...RecipeAssembler.toResourceFromEntity(recipe), id: recipe.id};
        return upsert(recipes, equipmentApi.updateRecipe(resource), RecipeAssembler);
    }

    /** DRAFT → ACTIVE; the platform retires the previously active recipe with the same number, so the list is reloaded. */
    function publishRecipe(id) {
        return upsert(recipes, equipmentApi.changeRecipeStatus(id, "ACTIVE"), RecipeAssembler).then(recipe => fetchRecipes().then(() => recipe));
    }

    function retireRecipe(id) {
        return upsert(recipes, equipmentApi.changeRecipeStatus(id, "RETIRED"), RecipeAssembler);
    }

    /** Loads the systems first and then the collections that hang from them. */
    function fetchAll() {
        const systems = hvofSystemsLoaded.value ? Promise.resolve(hvofSystems.value) : fetchHvofSystems();
        return systems.then(() => Promise.all([
            subsystemsLoaded.value ? null : fetchSubsystems(),
            controllersLoaded.value ? null : fetchControllers(),
            recipesLoaded.value ? null : fetchRecipes()
        ]));
    }

    return {
        hvofSystems, hvofSystemsLoaded, activeHvofSystems, controllers, controllersLoaded, errors,
        fetchHvofSystems, fetchControllers, fetchAll, getHvofSystemById, controllersOf, getControllerById,
        addHvofSystem, updateHvofSystem, addController, updateController, upsert,
        subsystems, subsystemsLoaded, parts, partsLoaded, fetchSubsystems, fetchParts, subsystemsOf, getSubsystemById,
        partsOf, parametersOf, addSubsystem, updateSubsystem, addPart, deletePart,
        recipes, recipesLoaded, fetchRecipes, recipesOf, activeRecipesOf, getRecipeById, recipeByNumber, addRecipe, updateRecipe, publishRecipe, retireRecipe
    };
});

export default useEquipmentStore;
