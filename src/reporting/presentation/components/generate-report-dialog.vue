<script setup lang="js">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import useReportingStore from "@/reporting/application/reporting.store.js";
import {ReportDataService} from "@/reporting/application/report-data.service.js";
import {ReportPdfService} from "@/reporting/application/report-pdf.service.js";
import {GeneratedReport} from "@/reporting/domain/model/generated-report.entity.js";
import {REPORT_KINDS} from "@/reporting/domain/model/report-template.entity.js";

/**
 * Picks a template, renders the PDF of a spray session with it, downloads it and registers the generated report.
 */
const props = defineProps({visible: {type: Boolean, default: false}, sessionId: {type: Number, required: true}});
const emit = defineEmits(["update:visible", "generated"]);
const {t} = useI18n();
const store = useReportingStore();
const dataService = new ReportDataService();

const reportKind = ref("SESSION_REPORT");
const templateId = ref(null);
const working = ref(false);
const failure = ref("");

const kindOptions = computed(() => REPORT_KINDS.map(value => ({value, label: t("reports.kind." + value)})));
const templateOptions = computed(() => store.templatesOfKind(reportKind.value).map(tpl => ({value: tpl.id, label: tpl.defaultForKind ? `${tpl.name} · ${t("reports.default")}` : tpl.name})));
const template = computed(() => store.getTemplateById(templateId.value));

const pickDefault = () => { templateId.value = store.defaultTemplateOf(reportKind.value)?.id ?? null; };
watch(reportKind, pickDefault);
watch(() => props.visible, (v) => {
    if (!v) return;
    failure.value = "";
    (store.templatesLoaded ? Promise.resolve() : store.fetchTemplates()).then(pickDefault);
});

const close = () => emit("update:visible", false);

const generate = async () => {
    if (!template.value) return;
    working.value = true; failure.value = "";
    try {
        const context = await dataService.contextOfSession(props.sessionId);
        const {doc, fileName} = ReportPdfService.render(template.value, context, t);
        doc.save(fileName);
        const registered = await store.registerGeneratedReport(new GeneratedReport({
            reportTemplateId: template.value.id, subjectType: "SPRAY_SESSION", subjectId: props.sessionId, fileName,
            periodFrom: context.session.startedAt?.slice(0, 10) ?? null, periodTo: (context.session.endedAt ?? context.session.startedAt)?.slice(0, 10) ?? null
        }));
        emit("generated", registered);
        close();
    } catch (error) {
        console.error(error);
        failure.value = error?.message ?? String(error);
    } finally {
        working.value = false;
    }
};
</script>

<template>
  <pv-dialog :visible="visible" modal :header="t('reports.generate-title')" class="w-full max-w-30rem" @update:visible="close">
    <div class="flex flex-column gap-4 pt-2">
      <pv-float-label variant="on">
        <pv-select id="reportKind" v-model="reportKind" :options="kindOptions" option-label="label" option-value="value" class="w-full"/>
        <label for="reportKind">{{ t('reports.kind-label') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-select id="templateId" v-model="templateId" :options="templateOptions" option-label="label" option-value="value" class="w-full" :loading="!store.templatesLoaded"/>
        <label for="templateId">{{ t('reports.template') }}</label>
      </pv-float-label>
      <p v-if="template" class="m-0 text-sm text-color-secondary">{{ template.description }} · {{ t('reports.sections-count', {count: template.sections.length}) }}</p>
      <pv-message v-if="templateOptions.length === 0 && store.templatesLoaded" severity="warn" :closable="false">{{ t('reports.no-templates') }}</pv-message>
      <pv-message v-if="failure || store.error" severity="error" :closable="false">{{ failure || store.error }}</pv-message>
      <div class="flex justify-content-end gap-2">
        <pv-button :label="t('common.cancel')" text @click="close"/>
        <pv-button :label="t('reports.download-pdf')" icon="pi pi-file-pdf" :loading="working" :disabled="!template" @click="generate"/>
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
</style>
