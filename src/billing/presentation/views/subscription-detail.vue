<script setup lang="js">
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useBillingStore from "@/billing/application/billing.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useBillingStore();
const fmt = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("es-PE", {dateStyle: "long"});
onMounted(() => store.load());
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t('billing.subscription-title') }}</h1>
    <pv-card v-if="store.subscription" class="max-w-35rem">
      <template #content>
        <dl class="grid m-0 row-gap-3">
          <dt class="col-5 text-color-secondary">{{ t('billing.plan') }}</dt><dd class="col-7 m-0 font-medium">{{ store.currentPlan?.name }}</dd>
          <dt class="col-5 text-color-secondary">{{ t('billing.valid-from') }}</dt><dd class="col-7 m-0">{{ fmt(store.subscription.startDate) }}</dd>
          <dt class="col-5 text-color-secondary">{{ t('billing.valid-until') }}</dt><dd class="col-7 m-0">{{ fmt(store.subscription.endDate) }}</dd>
          <dt class="col-5 text-color-secondary">{{ t('billing.status') }}</dt>
          <dd class="col-7 m-0 flex flex-wrap gap-2">
            <pv-tag :value="store.subscription.status" severity="success"/>
            <pv-tag :value="t('billing.days-left', {days: store.subscription.daysToExpiry})" :severity="store.subscription.daysToExpiry < 30 ? 'danger' : 'secondary'"/>
            <pv-tag v-if="store.subscription.daysToExpiry < 30" :value="t('billing.expiring-soon')" severity="danger"/>
          </dd>
        </dl>
      </template>
    </pv-card>
    <template v-else>
      <p>{{ t('billing.none') }}</p>
      <pv-button :label="t('billing.choose')" icon="pi pi-credit-card" @click="router.push({name: 'billing-plans'})"/>
    </template>
  </section>
</template>
