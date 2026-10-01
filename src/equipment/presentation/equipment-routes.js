const hvofSystemList = () => import("./views/hvof-system-list.vue");

const equipmentRoutes = [
    {path: "hvof-systems", name: "equipment-hvof-systems", component: hvofSystemList, meta: {title: "HVOF Systems"}}
];

export default equipmentRoutes;