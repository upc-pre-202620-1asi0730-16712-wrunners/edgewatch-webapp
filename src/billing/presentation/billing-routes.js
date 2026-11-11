import {ROLE} from "@/iam/domain/model/role.entity.js";

const planSelection = () => import("./views/plan-selection.vue");
const subscriptionDetail = () => import("./views/subscription-detail.vue");

const billingRoutes = [
    {path: "plans",        name: "billing-plans",        component: planSelection,      meta: {title: "Plans", roles: [ROLE.ORG_ADMIN]}},
    {path: "subscription", name: "billing-subscription", component: subscriptionDetail, meta: {title: "Subscription", roles: [ROLE.ORG_ADMIN]}}
];

export default billingRoutes;
