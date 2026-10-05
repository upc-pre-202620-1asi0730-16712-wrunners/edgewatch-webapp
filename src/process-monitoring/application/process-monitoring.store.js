import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ProcessMonitoringApi} from "@/process-monitoring/infrastructure/process-monitoring-api.js";
import {SpraySessionAssembler} from "@/process-monitoring/infrastructure/spray-session.assembler.js";
import {ProcessReadingAssembler} from "@/process-monitoring/infrastructure/process-reading.assembler.js";

const processMonitoringApi = new ProcessMonitoringApi();

/**
 * Application store of the Process Monitoring bounded context.
 */
const useProcessMonitoringStore = defineStore("process-monitoring", () => {
    const sessions = ref([]);
    const sessionsLoaded = ref(false);
    const errors = ref([]);
    const readings = ref([]);
    const lastUpdate = ref(null);
    let pollingHandle = null;
    const deviations = ref(new Map());

    const activeSessions = computed(() => sessions.value.filter(s => s.isActive));

    /** Map parameter → latest reading. */
    const latestByParameter = computed(() => {
        const map = new Map();
        for (const r of readings.value) map.set(r.parameter, r);
        return map;
    });

    const bandCounts = computed(() => {
        const counts = {nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0};
        for (const r of readings.value) counts[r.band]++;
        return counts;
    });

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

    function completeSession(id) {
        stopPolling();
        return upsertSession(processMonitoringApi.patchSession(id, {status: "completed", endedAt: new Date().toISOString()}));
    }

    function abortSession(id, reason) {
        stopPolling();
        return upsertSession(processMonitoringApi.patchSession(id, {status: "aborted", endedAt: new Date().toISOString(), abortReason: reason}));
    }

    function loadReadings(sessionId) {
        return processMonitoringApi.getReadingsBySessionId(sessionId).then(response => {
            readings.value = ProcessReadingAssembler.toEntitiesFromResponse(response);
            lastUpdate.value = new Date();
        }).catch(error => errors.value.push(error));
    }

    function startPolling(sessionId, everyMs = 5000) {
        stopPolling();
        loadReadings(sessionId);
        pollingHandle = setInterval(() => loadReadings(sessionId), everyMs);
    }

    function stopPolling() {
        if (pollingHandle) clearInterval(pollingHandle);
        pollingHandle = null;
    }

    function clearReadings() {
        stopPolling();
        readings.value = [];
        lastUpdate.value = null;
    }

    function addReading(reading) {
        const resource = ProcessReadingAssembler.toResourceFromEntity(reading);
        delete resource.id;
        return processMonitoringApi.createReading(resource).then(response => {
            readings.value.push(ProcessReadingAssembler.toEntityFromResource(response.data));
        }).catch(error => errors.value.push(error));
    }

    function loadDeviations(sessionId) {
        if (deviations.value.has(sessionId)) return;
        Promise.all([
            processMonitoringApi.getReadingsBySessionIdAndBand(sessionId, "warning"),
            processMonitoringApi.getReadingsBySessionIdAndBand(sessionId, "shutdown")
        ]).then(([w, s]) => {
            deviations.value = new Map(deviations.value).set(sessionId, w.data.length + s.data.length);
        }).catch(() => { deviations.value = new Map(deviations.value).set(sessionId, -1); });
    }

    return {
        sessions, sessionsLoaded, activeSessions, errors, fetchSessions, getSessionById, startSession, upsertSession,
        readings, lastUpdate, latestByParameter, bandCounts, loadReadings, startPolling, stopPolling, clearReadings, addReading,
        completeSession, abortSession, deviations, loadDeviations
    };
});

export default useProcessMonitoringStore;
