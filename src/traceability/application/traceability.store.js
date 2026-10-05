import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TraceabilityApi} from "@/traceability/infrastructure/traceability-api.js";
import {CustomerAssembler} from "@/traceability/infrastructure/customer.assembler.js";
import {ComponentAssembler} from "@/traceability/infrastructure/component.assembler.js";
import {RecuperationAssembler} from "@/traceability/infrastructure/recuperation.assembler.js";
import useIamStore from "@/iam/application/iam.store.js";

const traceabilityApi = new TraceabilityApi();

/**
 * Application store of the Traceability bounded context.
 */
const useTraceabilityStore = defineStore("traceability", () => {
    /** @type {import('vue').Ref<Customer[]>} */
    const customers = ref([]);
    const customersLoaded = ref(false);
    /** @type {import('vue').Ref<Component[]>} */
    const components = ref([]);
    const componentsLoaded = ref(false);
    /** @type {import('vue').Ref<Recuperation[]>} */
    const recuperations = ref([]);
    const recuperationsLoaded = ref(false);
    const errors = ref([]);

    const customersCount = computed(() => customersLoaded.value ? customers.value.length : 0);
    /** Components that belong to the customers of the signed-in organization. */
    const organizationComponents = computed(() => components.value.filter(c => customers.value.some(customer => customer.id === c.customerId)));
    const componentsCount = computed(() => componentsLoaded.value ? organizationComponents.value.length : 0);
    const openRecuperations = computed(() => recuperations.value.filter(r => r.isOpen));

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
            components.value = ComponentAssembler.toEntitiesFromResponse(response);
            componentsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getComponentById(id) {
        const idNum = parseInt(id);
        return components.value.find(component => component.id === idNum);
    }

    function componentSerialOf(componentId) {
        return getComponentById(componentId)?.serialNumber ?? `#${componentId}`;
    }

    function addComponent(component) {
        const resource = ComponentAssembler.toResourceFromEntity(component);
        delete resource.id;
        return traceabilityApi.createComponent(resource).then(response => {
            const created = ComponentAssembler.toEntityFromResource(response.data);
            components.value.push(created);
            return created;
        }).catch(error => errors.value.push(error));
    }

    function updateComponent(component) {
        const resource = ComponentAssembler.toResourceFromEntity(component);
        return traceabilityApi.updateComponent(resource).then(response => {
            const updated = ComponentAssembler.toEntityFromResource(response.data);
            const index = components.value.findIndex(c => c.id === updated.id);
            if (index !== -1) components.value[index] = updated;
            return updated;
        }).catch(error => errors.value.push(error));
    }

    function fetchRecuperations() {
        const organizationId = useIamStore().organizationId;
        if (!organizationId) return;
        traceabilityApi.getRecuperationsByOrganizationId(organizationId).then(response => {
            recuperations.value = RecuperationAssembler.toEntitiesFromResponse(response);
            recuperationsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getRecuperationById(id) {
        const idNum = parseInt(id);
        return recuperations.value.find(recuperation => recuperation.id === idNum);
    }

    function addRecuperation(recuperation) {
        const resource = RecuperationAssembler.toResourceFromEntity(recuperation);
        delete resource.id;
        return traceabilityApi.createRecuperation(resource).then(response => {
            const created = RecuperationAssembler.toEntityFromResource(response.data);
            recuperations.value.push(created);
            return created;
        }).catch(error => errors.value.push(error));
    }

    function updateRecuperation(recuperation) {
        const resource = RecuperationAssembler.toResourceFromEntity(recuperation);
        return traceabilityApi.updateRecuperation(resource).then(response => {
            const updated = RecuperationAssembler.toEntityFromResource(response.data);
            const index = recuperations.value.findIndex(r => r.id === updated.id);
            if (index !== -1) recuperations.value[index] = updated;
            return updated;
        }).catch(error => errors.value.push(error));
    }

    /** Partial update used by Process Monitoring (status, linkedSessions). */
    function patchRecuperation(id, changes) {
        return traceabilityApi.patchRecuperation(id, changes).then(response => {
            const updated = RecuperationAssembler.toEntityFromResource(response.data);
            const index = recuperations.value.findIndex(r => r.id === updated.id);
            if (index !== -1) recuperations.value[index] = updated;
            return updated;
        }).catch(error => errors.value.push(error));
    }

    /** Loads the three collections once; used by views that need all of them. */
    function fetchAll() {
        if (!customersLoaded.value) fetchCustomers();
        if (!componentsLoaded.value) fetchComponents();
        if (!recuperationsLoaded.value) fetchRecuperations();
    }

    return {
        customers, customersLoaded, customersCount, components, componentsLoaded, organizationComponents, componentsCount,
        recuperations, recuperationsLoaded, openRecuperations, errors,
        fetchCustomers, getCustomerById, customerNameOf, addCustomer, updateCustomer, deleteCustomer,
        fetchComponents, getComponentById, componentSerialOf, addComponent, updateComponent,
        fetchRecuperations, getRecuperationById, addRecuperation, updateRecuperation, patchRecuperation, fetchAll
    };
});

export default useTraceabilityStore;
