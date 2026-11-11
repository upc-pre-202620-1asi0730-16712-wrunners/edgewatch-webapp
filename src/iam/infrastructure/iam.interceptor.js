import useIamStore from "@/iam/application/iam.store.js";

/** Adds Authorization: Bearer <token> to every request while a session exists. */
export const iamInterceptor = (config) => {
    const token = useIamStore().currentToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
};

/** Signs the user out when the platform rejects the token (401). */
export const unauthorizedInterceptor = (error) => {
    if (error?.response?.status === 401 && !String(error.config?.url ?? "").includes("/tokens")) useIamStore().expire();
    return Promise.reject(error);
};
