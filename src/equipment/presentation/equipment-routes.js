const hvofSystemList = () => import("./views/hvof-system-list.vue");
const hvofSystemForm = () => import("./views/hvof-system-form.vue");
const hvofSystemDetail = () => import("./views/hvof-system-detail.vue");
const controllerForm = () => import("./views/controller-form.vue");

/** Routes of the Equipment bounded context, mounted under /equipment. */
const equipmentRoutes = [
    {path: "hvof-systems",                                    name: "equipment-hvof-systems",       component: hvofSystemList,   meta: {title: "HVOF Systems"}},
    {path: "hvof-systems/new",                                name: "equipment-hvof-system-new",    component: hvofSystemForm,   meta: {title: "New HVOF System"}},
    {path: "hvof-systems/:id",                                name: "equipment-hvof-system-detail", component: hvofSystemDetail, meta: {title: "HVOF System"}},
    {path: "hvof-systems/:id/edit",                           name: "equipment-hvof-system-edit",   component: hvofSystemForm,   meta: {title: "Edit HVOF System"}},
    {path: "hvof-systems/:id/controllers/new",                name: "equipment-controller-new",     component: controllerForm,   meta: {title: "New Controller"}},
    {path: "hvof-systems/:id/controllers/:controllerId/edit", name: "equipment-controller-edit",    component: controllerForm,   meta: {title: "Edit Controller"}}
];

export default equipmentRoutes;
