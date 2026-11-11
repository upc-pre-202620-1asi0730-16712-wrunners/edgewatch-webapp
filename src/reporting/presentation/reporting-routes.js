import {ROLE} from "@/iam/domain/model/role.entity.js";

const reportTemplateList = () => import("./views/report-template-list.vue");
const reportTemplateForm = () => import("./views/report-template-form.vue");
const generatedReportList = () => import("./views/generated-report-list.vue");

const MANAGERS = [ROLE.ORG_ADMIN, ROLE.QUALITY_ENGINEER];

const reportingRoutes = [
    {path: "templates",          name: "reporting-templates",     component: reportTemplateList,  meta: {title: "Report Templates"}},
    {path: "templates/new",      name: "reporting-template-new",  component: reportTemplateForm,  meta: {title: "New Report Template", roles: MANAGERS}},
    {path: "templates/:id/edit", name: "reporting-template-edit", component: reportTemplateForm,  meta: {title: "Edit Report Template", roles: MANAGERS}},
    {path: "generated",          name: "reporting-generated",     component: generatedReportList, meta: {title: "Generated Reports"}}
];

export default reportingRoutes;
