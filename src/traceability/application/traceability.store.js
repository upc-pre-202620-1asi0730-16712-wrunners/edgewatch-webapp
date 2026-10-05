// TODO(F3–F5): falta contenido. Este archivo corresponde a la Parte 2 de la guía (no incluida en new-tasks);
// es una implementación mínima con lo que usan las partes 4–5 (recuperations, openRecuperations, getRecuperationById,
// componentSerialOf, patchRecuperation, fetchAll). Reemplázala por la versión de la guía (entidades y assemblers incluidos).
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TraceabilityApi} from "@/traceability/infrastructure/traceability-api.js";
import {Component} from "@/traceability/domain/model/component.entity.js";

const traceabilityApi = new TraceabilityApi();

/** TODO(F3–F5): confirmar qué estados de la orden se consideran abiertos. */
const CLOSED_RECUPERATION_STATUSES = ["DELIVERED", "CANCELLED"];

/**
 * Application store of the Traceability bounded context.
 */
const useTraceabilityStore = defineStore("traceability", () => {
    const components = ref([]);
    const componentsLoaded = ref(false);
    const recuperations = ref([]);
    const recuperationsLoaded = ref(false);
    const errors = ref([]);

    const openRecuperations = computed(() => recuperations.value.filter(r => !CLOSED_RECUPERATION_STATUSES.includes(r.status)));

    function fetchComponents() {
        traceabilityApi.getComponents().then(response => {
            components.value = response.data.map(resource => new Component({...resource}));
            componentsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchRecuperations() {
        traceabilityApi.getRecuperations().then(response => {
            recuperations.value = response.data.map(resource => ({...resource, linkedSessions: resource.linkedSessions ?? []}));
            recuperationsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchAll() {
        if (!componentsLoaded.value) fetchComponents();
        if (!recuperationsLoaded.value) fetchRecuperations();
    }

    function getRecuperationById(id) {
        const idNum = parseInt(id);
        return recuperations.value.find(r => r.id === idNum);
    }

    function componentSerialOf(componentId) {
        return components.value.find(c => c.id === componentId)?.serialNumber ?? `#${componentId}`;
    }

    function patchRecuperation(id, changes) {
        return traceabilityApi.patchRecuperation(id, changes).then(response => {
            const index = recuperations.value.findIndex(r => r.id === id);
            const updated = {...response.data, linkedSessions: response.data.linkedSessions ?? []};
            if (index !== -1) recuperations.value[index] = updated;
            return updated;
        }).catch(error => errors.value.push(error));
    }

    return {
        components, componentsLoaded, recuperations, recuperationsLoaded, openRecuperations, errors,
        fetchComponents, fetchRecuperations, fetchAll, getRecuperationById, componentSerialOf, patchRecuperation
    };
});

export default useTraceabilityStore;
