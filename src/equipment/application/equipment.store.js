import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {EquipmentApi} from "@/equipment/infrastructure/equipment-api.js";
import {HvofSystemAssembler} from "@/equipment/infrastructure/hvof-system.assembler.js";
import {ControllerAssembler} from "@/equipment/infrastructure/controller.assembler.js";

const equipmentApi = new EquipmentApi();

/**
 * Application store of the Equipment bounded context.
 */
const useEquipmentStore = defineStore("equipment", () => {
    const hvofSystems = ref([]);
    const hvofSystemsLoaded = ref(false);
    const controllers = ref([]);
    const controllersLoaded = ref(false);
    const errors = ref([]);

    const activeHvofSystems = computed(() => hvofSystems.value.filter(s => s.isActive));

    function fetchHvofSystems() {
        equipmentApi.getHvofSystems().then(response => {
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

    function fetchAll() {
        if (!hvofSystemsLoaded.value) fetchHvofSystems();
        if (!controllersLoaded.value) fetchControllers();
    }

    return {
        hvofSystems, hvofSystemsLoaded, activeHvofSystems, controllers, controllersLoaded, errors,
        fetchHvofSystems, fetchControllers, fetchAll, getHvofSystemById, controllersOf, getControllerById,
        addHvofSystem, updateHvofSystem, addController, updateController, upsert
    };
});

export default useEquipmentStore;
