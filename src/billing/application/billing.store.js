import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {BillingApi} from "@/billing/infrastructure/billing-api.js";
import {PlanAssembler} from "@/billing/infrastructure/plan.assembler.js";
import {SubscriptionAssembler} from "@/billing/infrastructure/subscription.assembler.js";
import {Subscription} from "@/billing/domain/model/subscription.entity.js";
import useIamStore from "@/iam/application/iam.store.js";

const billingApi = new BillingApi();

/**
 * Application store of the Billing bounded context.
 */
const useBillingStore = defineStore("billing", () => {
    const iam = useIamStore();
    const plans = ref([]);
    const subscriptions = ref([]);
    const error = ref(null);

    const subscription = computed(() => subscriptions.value.find(s => s.isActive) ?? null);
    const currentPlan = computed(() => subscription.value ? plans.value.find(p => p.id === subscription.value.planId) ?? null : null);
    const allowedPlanType = computed(() => iam.isSupplier ? "OPERATOR" : "ASSET_OWNER");

    function load() {
        if (!iam.organizationId) return;
        billingApi.getPlans().then(r => { plans.value = PlanAssembler.toEntitiesFromResponse(r); });
        billingApi.getSubscriptionsByOrganizationId(iam.organizationId).then(r => { subscriptions.value = SubscriptionAssembler.toEntitiesFromResponse(r); });
    }

    function canSelect(plan) {
        return plan.planType === allowedPlanType.value && currentPlan.value?.id !== plan.id;
    }

    function selectPlan(plan) {
        if (!canSelect(plan)) return Promise.resolve(null);
        const start = new Date(), end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        const resource = SubscriptionAssembler.toResourceFromEntity(new Subscription({
            organizationId: iam.organizationId, planId: plan.id,
            startDate: start.toISOString().substring(0, 10), endDate: end.toISOString().substring(0, 10), status: "ACTIVE"
        }));
        delete resource.id;
        return billingApi.createSubscription(resource).then(r => {
            const created = SubscriptionAssembler.toEntityFromResource(r.data);
            subscriptions.value.push(created);
            return created;
        }).catch(err => { error.value = err.message; });
    }

    return {plans, subscriptions, error, subscription, currentPlan, allowedPlanType, load, canSelect, selectPlan};
});

export default useBillingStore;
