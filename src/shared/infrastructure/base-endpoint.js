/**
 * Generic REST endpoint. Adds getAllBy (query filters) and patch to the five CRUD operations.
 */
export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    /** @param {Object} params json-server query filters, e.g. { hvofSystemId: 1 } */
    getAllBy(params) {
        return this.http.get(this.endpointPath, {params});
    }

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
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
