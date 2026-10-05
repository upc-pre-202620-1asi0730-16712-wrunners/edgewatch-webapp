import useIamStore from "@/iam/application/iam.store.js";

/** Adds Authorization: Bearer <token> to every request while a session exists. */
export const iamInterceptor = (config) => {
    const token = useIamStore().currentToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
};
