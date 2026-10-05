const spraySessionList = () => import("./views/spray-session-list.vue");
const spraySessionStart = () => import("./views/spray-session-start.vue");
const spraySessionDetail = () => import("./views/spray-session-detail.vue");

const processMonitoringRoutes = [
    {path: "spray-sessions",     name: "process-monitoring-spray-sessions", component: spraySessionList,  meta: {title: "Spray Sessions"}},
    {path: "spray-sessions/new", name: "process-monitoring-session-start",  component: spraySessionStart, meta: {title: "Start Session"}},
    {path: "spray-sessions/:id", name: "process-monitoring-session-detail", component: spraySessionDetail, meta: {title: "Session"}}
];

export default processMonitoringRoutes;
