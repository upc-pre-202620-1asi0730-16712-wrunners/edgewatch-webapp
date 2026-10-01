const spraySessionList = () => import("./views/spray-session-list.vue");

const processMonitoringRoutes = [
    {path: "spray-sessions", name: "process-monitoring-spray-sessions", component: spraySessionList, meta: {title: "Spray Sessions"}}
];

export default processMonitoringRoutes;