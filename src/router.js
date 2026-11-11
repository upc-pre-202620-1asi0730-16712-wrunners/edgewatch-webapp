import {createRouter, createWebHistory} from "vue-router";
import traceabilityRoutes from "@/traceability/presentation/traceability-routes.js";
import equipmentRoutes from "@/equipment/presentation/equipment-routes.js";
import processMonitoringRoutes from "@/process-monitoring/presentation/process-monitoring-routes.js";
import iamRoutes from "@/iam/presentation/iam-routes.js";
import billingRoutes from "@/billing/presentation/billing-routes.js";
import {authenticationGuard} from "@/iam/infrastructure/authentication.guard.js";

const home = () => import("@/shared/presentation/views/home.vue");
const about = () => import("@/shared/presentation/views/about.vue");
const termsAndConditions = () => import("@/shared/presentation/views/terms-and-conditions.vue");
const pageNotFound = () => import("@/shared/presentation/views/page-not-found.vue");

const routes = [
    {path: "/home",               name: "home",               component: home,          meta: {title: "Home"}},
    {path: "/about",              name: "about",              component: about,         meta: {title: "About"}},
    {path: "/terms",              name: "terms",              component: termsAndConditions, meta: {title: "Terms & Conditions"}},
    {path: "/traceability",       name: "traceability",       meta: {requiresSupplier: true}, children: traceabilityRoutes},
    {path: "/equipment",          name: "equipment",          meta: {requiresSupplier: true}, children: equipmentRoutes},
    {path: "/process-monitoring", name: "process-monitoring", meta: {requiresSupplier: true}, children: processMonitoringRoutes},
    {path: "/iam",                name: "iam",                children: iamRoutes},
    {path: "/billing",            name: "billing",            children: billingRoutes},
    {path: "/",                   name: "default",            redirect: "/home"},
    {path: "/:pathMatch(.*)*",    name: "not-found",          component: pageNotFound,  meta: {title: "Page Not Found"}}
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/** Sets the browser tab title from the route metadata and applies the authentication guard. */
router.beforeEach((to, from, next) => {
    const baseTitle = "EdgeWatch";
    document.title = to.meta?.title ? `${baseTitle} - ${to.meta.title}` : baseTitle;
    authenticationGuard(to, from, next);
});

export default router;