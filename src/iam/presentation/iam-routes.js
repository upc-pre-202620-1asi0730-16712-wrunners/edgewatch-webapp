const signUpForm = () => import("./views/sign-up-form.vue");

const iamRoutes = [
    {path: "sign-up", name: "iam-sign-up", component: signUpForm, meta: {title: "Sign Up"}}
];

export default iamRoutes;
