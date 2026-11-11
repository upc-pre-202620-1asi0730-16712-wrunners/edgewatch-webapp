/**
 * Generic REST endpoint: the five CRUD operations plus query filters, partial updates and nested sub-resources
 * (`/resources/{id}/sub-resources`).
 */
export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpointPath);
    }

    /** @param {Object} params query filters, e.g. { hvofSystemId: 1 } */
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

    /** GET /resources/{id}/{subResource}?params */
    getNested(id, subResource, params = {}) {
        return this.http.get(`${this.endpointPath}/${id}/${subResource}`, {params});
    }

    /** POST /resources/{id}/{subResource} */
    createNested(id, subResource, body) {
        return this.http.post(`${this.endpointPath}/${id}/${subResource}`, body);
    }

    /** PUT /resources/{id}/{subResource} */
    updateNested(id, subResource, body) {
        return this.http.put(`${this.endpointPath}/${id}/${subResource}`, body);
    }

    /** PATCH /resources/{id}/{subResource} */
    patchNested(id, subResource, body) {
        return this.http.patch(`${this.endpointPath}/${id}/${subResource}`, body);
    }
}
