import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {FaultDiagnosisApi} from "@/fault-diagnosis/infrastructure/fault-diagnosis-api.js";
import {FaultCaseAssembler} from "@/fault-diagnosis/infrastructure/fault-case.assembler.js";
import {FaultRuleAssembler} from "@/fault-diagnosis/infrastructure/fault-rule.assembler.js";
import {errorMessageOf} from "@/shared/infrastructure/base-api.js";

const faultDiagnosisApi = new FaultDiagnosisApi();

/**
 * Application store of the Fault Diagnosis bounded context: cases opened by the platform and the rules that open them.
 */
const useFaultDiagnosisStore = defineStore("fault-diagnosis", () => {
    const faultCases = ref([]);
    const faultCasesLoaded = ref(false);
    const faultRules = ref([]);
    const faultRulesLoaded = ref(false);
    const error = ref(null);

    const openCases = computed(() => faultCases.value.filter(c => c.isOpen));
    const openCasesCount = computed(() => openCases.value.length);

    const fail = (err) => { console.error(err); error.value = errorMessageOf(err); };

    function fetchFaultCases(filters = {}) {
        error.value = null;
        return faultDiagnosisApi.getFaultCases(filters).then(response => {
            faultCases.value = FaultCaseAssembler.toEntitiesFromResponse(response);
            faultCasesLoaded.value = true;
            return faultCases.value;
        }).catch(fail);
    }

    function casesOfSession(spraySessionId) {
        return faultCases.value.filter(c => c.spraySessionId === spraySessionId);
    }

    function replaceCase(response) {
        const updated = FaultCaseAssembler.toEntityFromResource(response.data);
        const index = faultCases.value.findIndex(c => c.id === updated.id);
        if (index === -1) faultCases.value.push(updated); else faultCases.value[index] = updated;
        return updated;
    }

    function acknowledgeCase(id) {
        error.value = null;
        return faultDiagnosisApi.changeFaultCaseStatus(id, "acknowledged").then(replaceCase).catch(fail);
    }

    function resolveCase(id, notes) {
        error.value = null;
        return faultDiagnosisApi.changeFaultCaseStatus(id, "resolved", notes).then(replaceCase).catch(fail);
    }

    function fetchFaultRules() {
        error.value = null;
        return faultDiagnosisApi.getFaultRules().then(response => {
            faultRules.value = FaultRuleAssembler.toEntitiesFromResponse(response);
            faultRulesLoaded.value = true;
            return faultRules.value;
        }).catch(fail);
    }

    function replaceRule(response) {
        const updated = FaultRuleAssembler.toEntityFromResource(response.data);
        const index = faultRules.value.findIndex(r => r.id === updated.id);
        if (index === -1) faultRules.value.push(updated); else faultRules.value[index] = updated;
        return updated;
    }

    function addFaultRule(rule) {
        error.value = null;
        return faultDiagnosisApi.createFaultRule(FaultRuleAssembler.toCreateResourceFromEntity(rule)).then(replaceRule).catch(fail);
    }

    function updateFaultRule(rule) {
        error.value = null;
        return faultDiagnosisApi.updateFaultRule(rule.id, FaultRuleAssembler.toUpdateResourceFromEntity(rule)).then(replaceRule).catch(fail);
    }

    return {
        faultCases, faultCasesLoaded, faultRules, faultRulesLoaded, error, openCases, openCasesCount,
        fetchFaultCases, casesOfSession, acknowledgeCase, resolveCase, fetchFaultRules, addFaultRule, updateFaultRule
    };
});

export default useFaultDiagnosisStore;
