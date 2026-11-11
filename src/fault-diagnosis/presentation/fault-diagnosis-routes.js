import {ROLE} from "@/iam/domain/model/role.entity.js";

const faultCaseList = () => import("./views/fault-case-list.vue");
const faultRuleList = () => import("./views/fault-rule-list.vue");

const faultDiagnosisRoutes = [
    {path: "fault-cases", name: "fault-diagnosis-cases", component: faultCaseList, meta: {title: "Fault Cases"}},
    {path: "fault-rules", name: "fault-diagnosis-rules", component: faultRuleList, meta: {title: "Fault Rules", roles: [ROLE.ORG_ADMIN]}}
];

export default faultDiagnosisRoutes;
