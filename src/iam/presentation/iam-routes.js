import {ROLE} from "@/iam/domain/model/role.entity.js";

const signInForm = () => import("./views/sign-in-form.vue");
const signUpForm = () => import("./views/sign-up-form.vue");
const userList = () => import("./views/user-list.vue");
const userRoleForm = () => import("./views/user-role-form.vue");

const iamRoutes = [
    {path: "sign-in",         name: "iam-sign-in",    component: signInForm,   meta: {title: "Sign In"}},
    {path: "sign-up",         name: "iam-sign-up",    component: signUpForm,   meta: {title: "Sign Up"}},
    {path: "users",           name: "iam-users",      component: userList,     meta: {title: "Users", roles: [ROLE.ORG_ADMIN]}},
    {path: "users/:id/roles", name: "iam-user-roles", component: userRoleForm, meta: {title: "Roles", roles: [ROLE.ORG_ADMIN]}}
];

export default iamRoutes;
