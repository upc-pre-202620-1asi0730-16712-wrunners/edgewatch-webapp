import {ROLE} from "@/iam/domain/model/role.entity.js";

const customerList = () => import("./views/customer-list.vue");
const customerForm = () => import("./views/customer-form.vue");
const componentList = () => import("./views/component-list.vue");
const componentForm = () => import("./views/component-form.vue");
const recuperationList = () => import("./views/recuperation-list.vue");
const recuperationForm = () => import("./views/recuperation-form.vue");

const CUSTOMER_MANAGERS = [ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR];
const COMPONENT_MANAGERS = [ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR, ROLE.HVOF_OPERATOR, ROLE.QUALITY_ENGINEER];
const RECUPERATION_MANAGERS = [ROLE.ORG_ADMIN, ROLE.OPERATIONS_SUPERVISOR];

/** Routes of the Traceability bounded context, mounted under /traceability. */
const traceabilityRoutes = [
    {path: "customers",              name: "traceability-customers",         component: customerList,     meta: {title: "Customers"}},
    {path: "customers/new",          name: "traceability-customer-new",      component: customerForm,     meta: {title: "New Customer", roles: CUSTOMER_MANAGERS}},
    {path: "customers/:id/edit",     name: "traceability-customer-edit",     component: customerForm,     meta: {title: "Edit Customer", roles: CUSTOMER_MANAGERS}},
    {path: "components",             name: "traceability-components",        component: componentList,    meta: {title: "Components"}},
    {path: "components/new",         name: "traceability-component-new",     component: componentForm,    meta: {title: "New Component", roles: COMPONENT_MANAGERS}},
    {path: "components/:id/edit",    name: "traceability-component-edit",    component: componentForm,    meta: {title: "Edit Component", roles: COMPONENT_MANAGERS}},
    {path: "recuperations",          name: "traceability-recuperations",     component: recuperationList, meta: {title: "Recuperations"}},
    {path: "recuperations/new",      name: "traceability-recuperation-new",  component: recuperationForm, meta: {title: "New Recuperation", roles: RECUPERATION_MANAGERS}},
    {path: "recuperations/:id/edit", name: "traceability-recuperation-edit", component: recuperationForm, meta: {title: "Edit Recuperation", roles: RECUPERATION_MANAGERS}}
];

export default traceabilityRoutes;
