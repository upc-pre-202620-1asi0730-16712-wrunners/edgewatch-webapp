const customerList = () => import("./views/customer-list.vue");
const componentList = () => import("./views/component-list.vue");
const recuperationList = () => import("./views/recuperation-list.vue");

/** Routes of the Traceability bounded context, mounted under /traceability. */
const traceabilityRoutes = [
    {path: "customers",     name: "traceability-customers",     component: customerList,     meta: {title: "Customers"}},
    {path: "components",    name: "traceability-components",    component: componentList,    meta: {title: "Components"}},
    {path: "recuperations", name: "traceability-recuperations", component: recuperationList, meta: {title: "Recuperations"}}
];

export default traceabilityRoutes;