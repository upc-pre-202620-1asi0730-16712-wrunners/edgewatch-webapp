<script setup lang="js">
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useBillingStore from "@/billing/application/billing.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useBillingStore();
const price = (p) => new Intl.NumberFormat("en-US", {style: "currency", currency: p.monthlyPriceCurrency}).format(p.monthlyPriceAmount);
const select = (plan) => store.selectPlan(plan).then(created => created && router.push({name: "billing-subscription"}));
onMounted(() => store.load());
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t('billing.plans-title') }}</h1>
    <p class="text-color-secondary">{{ t('billing.plans-hint') }}</p>
    <pv-message v-if="store.error" severity="error">{{ store.error }}</pv-message>
    <div class="grid mt-2">
      <div v-for="plan in store.plans" :key="plan.id" class="col-12 md:col-6 lg:col-4">
        <pv-card :class="{'opacity-60': plan.planType !== store.allowedPlanType}">
          <template #title>{{ plan.name }}</template>
          <template #subtitle>{{ plan.planType }}</template>
          <template #content>
            <div class="text-4xl font-bold my-2">{{ price(plan) }} <span class="text-base font-normal text-color-secondary">{{ t('billing.per-month') }}</span></div>
            <ul class="list-none p-0 m-0 flex flex-column gap-2">
              <li v-if="plan.maxMonitoredSystems > 0"><i class="pi pi-cog mr-2"/>{{ plan.maxMonitoredSystems }} {{ t('billing.monitored-systems') }}</li>
              <li v-if="plan.maxTrackedComponents > 0"><i class="pi pi-box mr-2"/>{{ plan.maxTrackedComponents }} {{ t('billing.tracked-components') }}</li>
            </ul>
          </template>
          <template #footer>
            <pv-button v-if="store.currentPlan?.id === plan.id" :label="t('billing.current')" icon="pi pi-check" outlined disabled class="w-full"/>
            <pv-button v-else-if="store.canSelect(plan)" :label="t('billing.select')" class="w-full" @click="select(plan)"/>
            <small v-else class="text-color-secondary">{{ t('billing.not-available') }}</small>
          </template>
        </pv-card>
      </div>
    </div>
  </section>
</template>
