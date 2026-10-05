import {ROLE} from "@/iam/domain/model/role.entity.js";

const customerList = () => import("./views/customer-list.vue");
const customerForm = () => import("./views/customer-form.vue");
const componentList = () => import("./views/component-list.vue");
const recuperationList = () => import("./views/recuperation-list.vue");

const CUSTOMER_MANAGERS = [ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR];

/** Routes of the Traceability bounded context, mounted under /traceability. */
const traceabilityRoutes = [
    {path: "customers",          name: "traceability-customers",     component: customerList,     meta: {title: "Customers"}},
    {path: "customers/new",      name: "traceability-customer-new",  component: customerForm,     meta: {title: "New Customer", roles: CUSTOMER_MANAGERS}},
    {path: "customers/:id/edit", name: "traceability-customer-edit", component: customerForm,     meta: {title: "Edit Customer", roles: CUSTOMER_MANAGERS}},
    {path: "components",         name: "traceability-components",    component: componentList,    meta: {title: "Components"}},
    {path: "recuperations",      name: "traceability-recuperations", component: recuperationList, meta: {title: "Recuperations"}}
];

export default traceabilityRoutes;
