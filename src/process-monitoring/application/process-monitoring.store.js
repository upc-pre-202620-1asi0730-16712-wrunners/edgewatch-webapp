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
        for (const r of readings.value) counts[r.band] = (counts[r.band] ?? 0) + 1;
        return counts;
    });

    const fail = (error) => { console.error(error); errors.value.push(error); };

    function fetchSessions() {
        return processMonitoringApi.getSessions().then(response => {
            sessions.value = SpraySessionAssembler.toEntitiesFromResponse(response);
            sessionsLoaded.value = true;
            return sessions.value;
        }).catch(fail);
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
        }).catch(fail);
    }

    /** Starts a session; the platform freezes the recipe bands and links the session to the recuperation. */
    function startSession(session) {
        return upsertSession(processMonitoringApi.createSession(SpraySessionAssembler.toResourceFromEntity(session)));
    }

    function completeSession(id) {
        stopPolling();
        return upsertSession(processMonitoringApi.patchSession(id, {status: "completed"}));
    }

    function abortSession(id, reason) {
        stopPolling();
        return upsertSession(processMonitoringApi.patchSession(id, {status: "aborted", abortReason: reason}));
    }

    function loadReadings(sessionId) {
        return processMonitoringApi.getReadingsBySessionId(sessionId).then(response => {
            readings.value = ProcessReadingAssembler.toEntitiesFromResponse(response);
            lastUpdate.value = new Date();
            return readings.value;
        }).catch(fail);
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

    /** Sends one or many readings; the platform classifies them against the frozen recipe bands. */
    function addReadings(sessionId, list) {
        const resources = list.map(ProcessReadingAssembler.toResourceFromEntity);
        return processMonitoringApi.createReadings(sessionId, resources).then(response => {
            const created = ProcessReadingAssembler.toEntitiesFromResponse(response);
            readings.value.push(...created);
            lastUpdate.value = new Date();
            return created;
        }).catch(fail);
    }

    function addReading(reading) {
        return addReadings(reading.spraySessionId, [reading]);
    }

    function loadDeviations(sessionId, force = false) {
        if (!force && deviations.value.has(sessionId)) return;
        processMonitoringApi.getDeviationsBySessionId(sessionId).then(response => {
            deviations.value = new Map(deviations.value).set(sessionId, response.data.total ?? 0);
        }).catch(() => { deviations.value = new Map(deviations.value).set(sessionId, -1); });
    }

    return {
        sessions, sessionsLoaded, activeSessions, errors, fetchSessions, getSessionById, startSession, upsertSession,
        readings, lastUpdate, latestByParameter, bandCounts, loadReadings, startPolling, stopPolling, clearReadings, addReading, addReadings,
        completeSession, abortSession, deviations, loadDeviations
    };
});

export default useProcessMonitoringStore;
