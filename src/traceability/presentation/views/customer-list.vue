<script setup lang="js">
import {computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue/useconfirm";
import useTraceabilityStore from "@/traceability/application/traceability.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {ROLE} from "@/iam/domain/model/role.entity.js";

const {t} = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useTraceabilityStore();
const iam = useIamStore();

const customers = computed(() => store.customers);
const loaded = computed(() => store.customersLoaded);
const canManage = computed(() => iam.hasRole(ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR));

const navigateToNew = () => router.push({name: "traceability-customer-new"});
const navigateToEdit = (id) => router.push({name: "traceability-customer-edit", params: {id}});

const confirmDelete = (customer) => {
    confirm.require({
        message: t("customers.confirm-delete", {name: customer.legalName}),
        header: t("customers.delete-header"),
        icon: "pi pi-exclamation-triangle",
        acceptLabel: t("common.yes"),
        rejectLabel: t("common.no"),
        acceptClass: "p-button-danger",
        accept: () => store.deleteCustomer(customer.id)
    });
};

onMounted(() => {
    if (!store.customersLoaded) store.fetchCustomers();
});
</script>

<template>
  <section class="p-4 md:p-5">
    <pv-confirm-dialog/>
    <div class="flex align-items-center justify-content-between mb-3">
      <h1 class="m-0 text-3xl font-bold text-color">{{ t('customers.title') }}</h1>
      <pv-button v-if="canManage" :label="t('customers.new')" icon="pi pi-plus" @click="navigateToNew"/>
    </div>
    <pv-message v-if="store.errors.length" severity="error" class="mb-3">{{ t('errors.occurred') }}</pv-message>
    <pv-data-table :value="customers" :loading="!loaded" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                   sort-field="id" :sort-order="1" striped-rows responsive-layout="scroll">
      <template #empty>{{ t('customers.empty') }}</template>
      <pv-column field="id" :header="t('customers.id')" sortable style="width: 6rem"/>
      <pv-column field="legalName" :header="t('customers.legal-name')" sortable/>
      <pv-column field="ruc" :header="t('customers.ruc')"/>
      <pv-column field="mineSite" :header="t('customers.mine-site')" sortable/>
      <pv-column v-if="canManage" :header="t('customers.actions')" style="width: 9rem">
        <template #body="{ data }">
          <pv-button icon="pi pi-pencil" text rounded :aria-label="t('common.edit')" v-tooltip.top="t('common.edit')" @click="navigateToEdit(data.id)"/>
          <pv-button icon="pi pi-trash" text rounded severity="danger" :aria-label="t('common.delete')" v-tooltip.top="t('common.delete')" @click="confirmDelete(data)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
</style>
