import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ProcessMonitoringApi} from "@/process-monitoring/infrastructure/process-monitoring-api.js";
import {SpraySessionAssembler} from "@/process-monitoring/infrastructure/spray-session.assembler.js";

const processMonitoringApi = new ProcessMonitoringApi();

/**
 * Application store of the Process Monitoring bounded context.
 */
const useProcessMonitoringStore = defineStore("process-monitoring", () => {
    const sessions = ref([]);
    const sessionsLoaded = ref(false);
    const errors = ref([]);

    const activeSessions = computed(() => sessions.value.filter(s => s.isActive));

    function fetchSessions() {
        processMonitoringApi.getSessions().then(response => {
            sessions.value = SpraySessionAssembler.toEntitiesFromResponse(response);
            sessionsLoaded.value = true;
        }).catch(error => errors.value.push(error));
    }

    function getSessionById(id) {
        const idNum = parseInt(id);
        return sessions.value.find(s => s.id === idNum);
    }

    function upsertSession(request) {
        return request.then(response => {
            const session = SpraySessionAssembler.toEntityFromResource(response.data);
            const index = sessions.value.findIndex(s => s.id === session.id);
            if (index === -1) sessions.value.push(session); else sessions.value[index] = session;
            return session;
        }).catch(error => errors.value.push(error));
    }

    function startSession(session) {
        const resource = SpraySessionAssembler.toResourceFromEntity(session);
        delete resource.id;
        return upsertSession(processMonitoringApi.createSession(resource));
    }

    return {sessions, sessionsLoaded, activeSessions, errors, fetchSessions, getSessionById, startSession, upsertSession};
});

export default useProcessMonitoringStore;
