import axios from "axios";
import {iamInterceptor} from "@/iam/infrastructure/iam.interceptor.js";

const platformApi = import.meta.env.VITE_EDGEWATCH_API_URL;

/**
 * Centralized Axios instance for every bounded-context API.
 * The IAM interceptor attaches the session token to each request.
 */
export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {"Content-Type": "application/json"}
        });
        this.#http.interceptors.request.use(iamInterceptor);
    }

    get http() {
        return this.#http;
    }
}
