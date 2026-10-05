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
 */
const useEquipmentStore = defineStore("equipment", () => {
    const hvofSystems = ref([]);
    const hvofSystemsLoaded = ref(false);
    const controllers = ref([]);
    const controllersLoaded = ref(false);
    const subsystems = ref([]);
    const subsystemsLoaded = ref(false);
    const parts = ref([]);
    const partsLoaded = ref(false);
    const recipes = ref([]);
    const recipesLoaded = ref(false);
    const errors = ref([]);

    const activeHvofSystems = computed(() => hvofSystems.value.filter(s => s.isActive));

    function fetchHvofSystems() {
        const organizationId = useIamStore().organizationId;
        if (!organizationId) return;
        equipmentApi.getHvofSystemsByOrganizationId(organizationId).then(response => {
            hvofSystems.value = HvofSystemAssembler.toEntitiesFromResponse(response);
            hvofSystemsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchControllers() {
        equipmentApi.getControllers().then(response => {
            controllers.value = ControllerAssembler.toEntitiesFromResponse(response);
            controllersLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchSubsystems() {
        equipmentApi.getSubsystems().then(response => {
            subsystems.value = HvofSubsystemAssembler.toEntitiesFromResponse(response);
            subsystemsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchParts() {
        equipmentApi.getParts().then(response => {
            parts.value = HvofPartAssembler.toEntitiesFromResponse(response);
            partsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchRecipes() {
        equipmentApi.getRecipes().then(response => {
            recipes.value = RecipeAssembler.toEntitiesFromResponse(response);
            recipesLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

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
        return parts.value.filter(p => p.hvofSubsystemId === subsystemId);
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
        return recipesOf(hvofSystemId).find(r => r.recipeNumber === recipeNumber);
    }

    /** Generic create/update helper: keeps the store rhythm in one place. */
    function upsert(list, request, assembler) {
        return request.then(response => {
            const entity = assembler.toEntityFromResource(response.data);
            const index = list.value.findIndex(e => e.id === entity.id);
            if (index === -1) list.value.push(entity); else list.value[index] = entity;
            return entity;
        }).catch(error => errors.value.push(error));
    }

    function addHvofSystem(system) {
        const resource = HvofSystemAssembler.toResourceFromEntity(system);
        delete resource.id;
        return upsert(hvofSystems, equipmentApi.createHvofSystem(resource), HvofSystemAssembler);
    }

    function updateHvofSystem(system) {
        return upsert(hvofSystems, equipmentApi.updateHvofSystem(HvofSystemAssembler.toResourceFromEntity(system)), HvofSystemAssembler);
    }

    function addController(controller) {
        const resource = ControllerAssembler.toResourceFromEntity(controller);
        delete resource.id;
        return upsert(controllers, equipmentApi.createController(resource), ControllerAssembler);
    }

    function updateController(controller) {
        return upsert(controllers, equipmentApi.updateController(ControllerAssembler.toResourceFromEntity(controller)), ControllerAssembler);
    }

    function addSubsystem(subsystem) {
        const resource = HvofSubsystemAssembler.toResourceFromEntity(subsystem);
        delete resource.id;
        return upsert(subsystems, equipmentApi.createSubsystem(resource), HvofSubsystemAssembler);
    }

    function updateSubsystem(subsystem) {
        return upsert(subsystems, equipmentApi.updateSubsystem(HvofSubsystemAssembler.toResourceFromEntity(subsystem)), HvofSubsystemAssembler);
    }

    function addPart(part) {
        const resource = HvofPartAssembler.toResourceFromEntity(part);
        delete resource.id;
        return upsert(parts, equipmentApi.createPart(resource), HvofPartAssembler);
    }

    function deletePart(id) {
        return equipmentApi.deletePart(id).then(() => {
            const index = parts.value.findIndex(p => p.id === id);
            if (index !== -1) parts.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

    function addRecipe(recipe) {
        const resource = RecipeAssembler.toResourceFromEntity(recipe);
        delete resource.id;
        return upsert(recipes, equipmentApi.createRecipe(resource), RecipeAssembler);
    }

    function updateRecipe(recipe) {
        return upsert(recipes, equipmentApi.updateRecipe(RecipeAssembler.toResourceFromEntity(recipe)), RecipeAssembler);
    }

    function publishRecipe(id) {
        return upsert(recipes, equipmentApi.patchRecipe(id, {status: "ACTIVE"}), RecipeAssembler);
    }

    function fetchAll() {
        if (!hvofSystemsLoaded.value) fetchHvofSystems();
        if (!controllersLoaded.value) fetchControllers();
        if (!subsystemsLoaded.value) fetchSubsystems();
        if (!partsLoaded.value) fetchParts();
        if (!recipesLoaded.value) fetchRecipes();
    }

    return {
        hvofSystems, hvofSystemsLoaded, activeHvofSystems, controllers, controllersLoaded, errors,
        fetchHvofSystems, fetchControllers, fetchAll, getHvofSystemById, controllersOf, getControllerById,
        addHvofSystem, updateHvofSystem, addController, updateController, upsert,
        subsystems, subsystemsLoaded, parts, partsLoaded, fetchSubsystems, fetchParts, subsystemsOf, getSubsystemById,
        partsOf, parametersOf, addSubsystem, updateSubsystem, addPart, deletePart,
        recipes, recipesLoaded, fetchRecipes, recipesOf, activeRecipesOf, getRecipeById, recipeByNumber, addRecipe, updateRecipe, publishRecipe
    };
});

export default useEquipmentStore;
