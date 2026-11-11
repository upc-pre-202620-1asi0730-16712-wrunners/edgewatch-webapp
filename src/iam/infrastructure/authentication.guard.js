import useIamStore from "@/iam/application/iam.store.js";

const PUBLIC_ROUTES = ["iam-sign-in", "iam-sign-up", "about", "terms", "not-found"];
const GUEST_ONLY_ROUTES = ["iam-sign-in", "iam-sign-up"];

/**
 * Route guard: authentication, organization-type (supplier) and role requirements from route meta.
 * meta: { requiresSupplier?: boolean, roles?: number[] }
 */
export const authenticationGuard = (to, from, next) => {
    const store = useIamStore();
    const routeName = to.name ?? "";

    if (store.isSignedIn && GUEST_ONLY_ROUTES.includes(routeName)) return next({name: "home"});
    if (!store.isSignedIn && !PUBLIC_ROUTES.includes(routeName)) return next({name: "iam-sign-in"});
    if (!store.isSignedIn) return next();

    const requiresSupplier = to.matched.some(r => r.meta?.requiresSupplier);
    if (requiresSupplier && !store.isSupplier) return next({name: "home"});

    const roles = to.matched.flatMap(r => r.meta?.roles ?? []);
    if (roles.length > 0 && !store.hasRole(...roles)) return next({name: "home"});

    return next();
};
