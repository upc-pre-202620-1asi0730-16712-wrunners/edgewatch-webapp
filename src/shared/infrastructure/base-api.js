import axios from "axios";
import {iamInterceptor, unauthorizedInterceptor} from "@/iam/infrastructure/iam.interceptor.js";
import i18n from "@/i18n.js";

const platformApi = import.meta.env.VITE_EDGEWATCH_API_URL;
export const mockApi = import.meta.env.VITE_MOCK_API_URL;

/**
 * Centralized Axios instance for every bounded-context API.
 * The IAM interceptor attaches the session token and the Accept-Language header carries the current locale.
 */
export class BaseApi {
    #http;

    /** @param {string} [baseURL] defaults to the EdgeWatch Platform; pass `mockApi` for contexts still served by json-server */
    constructor(baseURL = platformApi) {
        this.#http = axios.create({
            baseURL,
            headers: {"Content-Type": "application/json"}
        });
        this.#http.interceptors.request.use(iamInterceptor);
        this.#http.interceptors.request.use(config => {
            config.headers["Accept-Language"] = i18n.global.locale.value;
            return config;
        });
        this.#http.interceptors.response.use(response => response, unauthorizedInterceptor);
    }

    get http() {
        return this.#http;
    }
}

/**
 * Message of a failed request: the RFC 9457 `detail` of the platform when present, the HTTP message otherwise.
 * @param {any} error axios error
 * @returns {string}
 */
export function errorMessageOf(error) {
    const data = error?.response?.data;
    if (data?.detail) return data.detail;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (data?.title) return data.title;
    return error?.message ?? "Unknown error";
}
