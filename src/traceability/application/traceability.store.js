import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TraceabilityApi} from "@/traceability/infrastructure/traceability-api.js";
import {CustomerAssembler} from "@/traceability/infrastructure/customer.assembler.js";
import {Component} from "@/traceability/domain/model/component.entity.js";
import useIamStore from "@/iam/application/iam.store.js";

const traceabilityApi = new TraceabilityApi();

const CLOSED_RECUPERATION_STATUSES = ["DELIVERED", "CANCELLED"];

/**
 * Application store of the Traceability bounded context.
 */
const useTraceabilityStore = defineStore("traceability", () => {
    /** @type {import('vue').Ref<Customer[]>} */
    const customers = ref([]);
    const customersLoaded = ref(false);
    const components = ref([]);
    const componentsLoaded = ref(false);
    const recuperations = ref([]);
    const recuperationsLoaded = ref(false);
    const errors = ref([]);

    const customersCount = computed(() => customersLoaded.value ? customers.value.length : 0);
    const openRecuperations = computed(() => recuperations.value.filter(r => !CLOSED_RECUPERATION_STATUSES.includes(r.status)));

    function fetchCustomers() {
        const organizationId = useIamStore().organizationId;
        if (!organizationId) return;
        traceabilityApi.getCustomersByOrganizationId(organizationId).then(response => {
            customers.value = CustomerAssembler.toEntitiesFromResponse(response);
            customersLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getCustomerById(id) {
        const idNum = parseInt(id);
        return customers.value.find(customer => customer.id === idNum);
    }

    function customerNameOf(customerId) {
        return getCustomerById(customerId)?.legalName ?? `#${customerId}`;
    }

    function addCustomer(customer) {
        const resource = CustomerAssembler.toResourceFromEntity(customer);
        delete resource.id;
        return traceabilityApi.createCustomer(resource).then(response => {
            const created = CustomerAssembler.toEntityFromResource(response.data);
            customers.value.push(created);
            return created;
        }).catch(error => errors.value.push(error));
    }

    function updateCustomer(customer) {
        const resource = CustomerAssembler.toResourceFromEntity(customer);
        return traceabilityApi.updateCustomer(resource).then(response => {
            const updated = CustomerAssembler.toEntityFromResource(response.data);
            const index = customers.value.findIndex(c => c.id === updated.id);
            if (index !== -1) customers.value[index] = updated;
            return updated;
        }).catch(error => errors.value.push(error));
    }

    function deleteCustomer(id) {
        return traceabilityApi.deleteCustomer(id).then(() => {
            const index = customers.value.findIndex(c => c.id === id);
            if (index !== -1) customers.value.splice(index, 1);
        }).catch(error => errors.value.push(error));
    }

    function fetchComponents() {
        traceabilityApi.getComponents().then(response => {
            components.value = response.data.map(resource => new Component({...resource}));
            componentsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchRecuperations() {
        const organizationId = useIamStore().organizationId;
        if (!organizationId) return;
        traceabilityApi.getRecuperationsByOrganizationId(organizationId).then(response => {
            recuperations.value = response.data.map(resource => ({...resource, linkedSessions: resource.linkedSessions ?? []}));
            recuperationsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function fetchAll() {
        if (!customersLoaded.value) fetchCustomers();
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
        customers, customersLoaded, customersCount, components, componentsLoaded, recuperations, recuperationsLoaded,
        openRecuperations, errors,
        fetchCustomers, getCustomerById, customerNameOf, addCustomer, updateCustomer, deleteCustomer,
        fetchComponents, fetchRecuperations, fetchAll, getRecuperationById, componentSerialOf, patchRecuperation
    };
});

export default useTraceabilityStore;
