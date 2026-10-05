// TODO(F3–F5): falta contenido. Este archivo corresponde a la Parte 2 de la guía (no incluida en new-tasks);
// es una implementación mínima con los métodos que usan las partes 3–5. Reemplázala por la versión de la guía.

/**
 * REST endpoint bound to a BaseApi instance.
 */
export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    getAllBy(params) {
        return this.http.get(this.endpointPath, {params});
    }

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    patch(id, changes) {
        return this.http.patch(`${this.endpointPath}/${id}`, changes);
    }

    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}
