<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {Customer} from "@/traceability/domain/model/customer.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTraceabilityStore();
const iam = useIamStore();

const customerId = route.params.id ? parseInt(route.params.id) : null;
const isEdit = computed(() => customerId !== null);
const submitted = ref(false);

const form = reactive({legalName: "", ruc: "", mineSite: ""});

const rucValid = computed(() => /^\d{11}$/.test(form.ruc));
const legalNameValid = computed(() => form.legalName.trim().length > 0);
const formValid = computed(() => rucValid.value && legalNameValid.value);

const loadCustomer = () => {
    const existing = store.getCustomerById(customerId);
    if (existing) Object.assign(form, {legalName: existing.legalName, ruc: existing.ruc, mineSite: existing.mineSite});
};

onMounted(() => {
    if (!store.customersLoaded) {
        store.fetchCustomers();
        const stop = store.$subscribe(() => { if (store.customersLoaded) { if (isEdit.value) loadCustomer(); stop(); } });
    } else if (isEdit.value) {
        loadCustomer();
    }
});

const back = () => router.push({name: "traceability-customers"});

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    const existing = isEdit.value ? store.getCustomerById(customerId) : null;
    const customer = new Customer({
        id: customerId,
        supplierOrganizationId: existing?.supplierOrganizationId ?? iam.organizationId,
        linkedAssetOwnerOrganizationId: existing?.linkedAssetOwnerOrganizationId ?? null,
        legalName: form.legalName.trim(),
        ruc: form.ruc,
        mineSite: form.mineSite.trim()
    });
    const action = isEdit.value ? store.updateCustomer(customer) : store.addCustomer(customer);
    action.then(back);
};
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t(isEdit ? 'customer.edit-title' : 'customer.new-title') }}</h1>
    <form class="flex flex-column gap-4 max-w-30rem" @submit.prevent="submit">
      <div class="flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="legalName" v-model="form.legalName" class="w-full" :invalid="submitted && !legalNameValid" aria-describedby="legalName-error"/>
          <label for="legalName">{{ t('customer.legal-name') }}</label>
        </pv-float-label>
        <small v-if="submitted && !legalNameValid" id="legalName-error" class="text-red-500">{{ t('customer.error.legal-name-required') }}</small>
      </div>
      <div class="flex flex-column gap-1">
        <pv-float-label variant="on">
          <pv-input-text id="ruc" v-model="form.ruc" maxlength="11" class="w-full" :invalid="submitted && !rucValid" aria-describedby="ruc-error"/>
          <label for="ruc">{{ t('customer.ruc') }}</label>
        </pv-float-label>
        <small v-if="submitted && !rucValid" id="ruc-error" class="text-red-500">{{ t('customer.error.ruc-invalid') }}</small>
      </div>
      <pv-float-label variant="on">
        <pv-input-text id="mineSite" v-model="form.mineSite" class="w-full"/>
        <label for="mineSite">{{ t('customer.mine-site') }}</label>
      </pv-float-label>
      <div class="flex justify-content-end gap-2">
        <pv-button type="button" :label="t('customer.cancel')" severity="secondary" text @click="back"/>
        <pv-button type="submit" :label="t('customer.save')" icon="pi pi-check"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
</style>
