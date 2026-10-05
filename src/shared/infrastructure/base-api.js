// TODO(F3–F5): falta contenido. Este archivo corresponde a la Parte 2 de la guía (no incluida en new-tasks);
// es una implementación mínima para que Equipment, Process Monitoring, IAM y Billing compilen. Reemplázala por la versión de la guía.
import axios from "axios";

const platformApi = import.meta.env.VITE_EDGEWATCH_API_URL;

/**
 * Base HTTP gateway shared by the bounded-context APIs.
 */
export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({baseURL: platformApi});
    }

    get http() {
        return this.#http;
    }
}
