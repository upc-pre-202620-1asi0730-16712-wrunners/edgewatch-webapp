<script setup lang="js">
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useReportingStore from "@/reporting/application/reporting.store.js";
import useEquipmentStore from "@/equipment/application/equipment.store.js";
import {
    AGGREGATIONS, emptySection, emptyWidget, ORIENTATIONS, PAGE_SIZES, REPORT_KINDS, ReportTemplate, SOURCE_VARIABLES, VARIABLE_SOURCES,
    VIEWS_BY_SOURCE, WIDGET_WIDTHS
} from "@/reporting/domain/model/report-template.entity.js";
import TemplatePreview from "@/reporting/presentation/components/template-preview.vue";

/**
 * Template builder: branding and page setup on the left, sections with widgets in the middle, live preview on the right.
 */
const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useReportingStore();
const equipment = useEquipmentStore();

const editingId = computed(() => route.params.id ? parseInt(route.params.id) : null);
const submitted = ref(false);
const saving = ref(false);
const form = reactive({
    name: "", description: "", reportKind: "SESSION_REPORT", primaryColor: "#0E1A2B", secondaryColor: "#D4781C", headerText: "", footerText: "Documento generado con EdgeWatch",
    pageSize: "A4", orientation: "PORTRAIT", showSignatureBlock: false, defaultForKind: false, sections: [emptySection(1)]
});

const kindOptions = computed(() => REPORT_KINDS.map(value => ({value, label: t("reports.kind." + value)})));
const pageSizeOptions = PAGE_SIZES.map(value => ({value, label: value}));
const orientationOptions = computed(() => ORIENTATIONS.map(value => ({value, label: t("reports.orientation-option." + value)})));
const sourceOptions = computed(() => VARIABLE_SOURCES.map(value => ({value, label: t("reports.source." + value)})));
const aggregationOptions = computed(() => AGGREGATIONS.map(value => ({value, label: t("reports.aggregation." + value)})));
const widthOptions = computed(() => WIDGET_WIDTHS.map(value => ({value, label: t("reports.width." + value)})));
const viewOptions = (source) => VIEWS_BY_SOURCE[source].map(value => ({value, label: t("reports.view." + value)}));

const processParameters = computed(() => [...new Set(equipment.hvofSystems.flatMap(s => equipment.parametersOf(s.id)))].sort());
const variableOptions = (source) => source === "PROCESS"
    ? processParameters.value.map(value => ({value, label: t("session-detail.parameter." + value, value)}))
    : SOURCE_VARIABLES[source].map(value => ({value, label: t("reports.variable." + source + "." + value, value)}));

const hexValid = (v) => /^#[0-9A-Fa-f]{6}$/.test(v ?? "");
const required = (v) => String(v ?? "").trim().length > 0;
const widgetValid = (w) => required(w.variableCode) && required(w.variableLabel);
const sectionValid = (s) => required(s.title) && s.widgets.length > 0 && s.widgets.every(widgetValid);
const formValid = computed(() => required(form.name) && hexValid(form.primaryColor) && hexValid(form.secondaryColor) && form.sections.length > 0 && form.sections.every(sectionValid));

const renumber = () => form.sections.forEach((s, i) => { s.sectionOrder = i + 1; s.widgets.forEach((w, j) => w.position = j + 1); });
const addSection = () => { form.sections.push(emptySection(form.sections.length + 1)); };
const removeSection = (i) => { form.sections.splice(i, 1); renumber(); };
const moveSection = (i, delta) => { const j = i + delta; if (j < 0 || j >= form.sections.length) return; [form.sections[i], form.sections[j]] = [form.sections[j], form.sections[i]]; renumber(); };
const addWidget = (s) => { s.widgets.push(emptyWidget(s.widgets.length + 1)); };
const removeWidget = (s, j) => { s.widgets.splice(j, 1); renumber(); };
const moveWidget = (s, j, delta) => { const k = j + delta; if (k < 0 || k >= s.widgets.length) return; [s.widgets[j], s.widgets[k]] = [s.widgets[k], s.widgets[j]]; renumber(); };
const onSourceChange = (w) => { w.variableCode = ""; w.viewType = VIEWS_BY_SOURCE[w.variableSource][0]; if (w.variableSource !== "PROCESS") w.aggregation = w.variableSource === "FAULT_CASES" ? "COUNT" : "LAST"; };
const onVariableChange = (w) => { if (!w.variableLabel) w.variableLabel = variableOptions(w.variableSource).find(o => o.value === w.variableCode)?.label ?? w.variableCode; };

const load = () => {
    const tpl = store.getTemplateById(editingId.value);
    if (!tpl) return;
    Object.assign(form, {
        name: tpl.name, description: tpl.description, reportKind: tpl.reportKind, primaryColor: tpl.primaryColor, secondaryColor: tpl.secondaryColor,
        headerText: tpl.headerText, footerText: tpl.footerText, pageSize: tpl.pageSize, orientation: tpl.orientation,
        showSignatureBlock: tpl.showSignatureBlock, defaultForKind: tpl.defaultForKind,
        sections: tpl.orderedSections.map(s => ({...s, widgets: s.widgets.map(w => ({...w}))}))
    });
};

onMounted(() => {
    equipment.fetchAll();
    (store.templatesLoaded ? Promise.resolve() : store.fetchTemplates()).then(() => { if (editingId.value) load(); });
});

const cancel = () => router.push({name: "reporting-templates"});
const save = () => {
    submitted.value = true;
    if (!formValid.value) return;
    saving.value = true;
    renumber();
    const template = new ReportTemplate({...form, id: editingId.value, sections: form.sections.map(s => ({...s, widgets: s.widgets.map(w => ({...w}))}))});
    (editingId.value ? store.updateTemplate(template) : store.addTemplate(template))
        .then(saved => { if (saved) router.push({name: "reporting-templates"}); })
        .finally(() => { saving.value = false; });
};
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h1 class="page-title">{{ t(editingId ? 'reports.edit-template' : 'reports.new-template') }}</h1>
      <div class="flex gap-2">
        <pv-button :label="t('common.cancel')" severity="secondary" text @click="cancel"/>
        <pv-button :label="t('common.save')" icon="pi pi-check" :loading="saving" @click="save"/>
      </div>
    </div>
    <pv-message v-if="store.error" severity="error" class="mb-3">{{ store.error }}</pv-message>
    <pv-message v-if="submitted && !formValid" severity="warn" class="mb-3" :closable="false">{{ t('reports.form-invalid') }}</pv-message>

    <div class="grid">
      <div class="col-12 lg:col-3">
        <pv-card class="mb-3">
          <template #title><span class="text-base">{{ t('reports.general') }}</span></template>
          <template #content>
            <div class="flex flex-column gap-4 pt-2">
              <pv-float-label variant="on">
                <pv-input-text id="name" v-model="form.name" class="w-full" maxlength="120" :invalid="submitted && !required(form.name)"/>
                <label for="name">{{ t('reports.name') }}</label>
              </pv-float-label>
              <pv-float-label variant="on">
                <pv-textarea id="description" v-model="form.description" rows="2" auto-resize class="w-full" maxlength="300"/>
                <label for="description">{{ t('reports.description') }}</label>
              </pv-float-label>
              <pv-float-label variant="on">
                <pv-select id="reportKind" v-model="form.reportKind" :options="kindOptions" option-label="label" option-value="value" class="w-full" :disabled="!!editingId"/>
                <label for="reportKind">{{ t('reports.kind-label') }}</label>
              </pv-float-label>
              <div class="flex align-items-center gap-2">
                <pv-checkbox v-model="form.defaultForKind" input-id="defaultForKind" binary/>
                <label for="defaultForKind">{{ t('reports.default-for-kind') }}</label>
              </div>
            </div>
          </template>
        </pv-card>
        <pv-card>
          <template #title><span class="text-base">{{ t('reports.branding') }}</span></template>
          <template #content>
            <div class="flex flex-column gap-4 pt-2">
              <div class="flex gap-3">
                <div class="flex flex-column gap-1 flex-1">
                  <label class="text-sm" for="primaryColor">{{ t('reports.primary-color') }}</label>
                  <div class="flex align-items-center gap-2"><input id="primaryColor" type="color" v-model="form.primaryColor" class="color-input"/><pv-input-text v-model="form.primaryColor" class="w-full" maxlength="7" :invalid="submitted && !hexValid(form.primaryColor)"/></div>
                </div>
                <div class="flex flex-column gap-1 flex-1">
                  <label class="text-sm" for="secondaryColor">{{ t('reports.secondary-color') }}</label>
                  <div class="flex align-items-center gap-2"><input id="secondaryColor" type="color" v-model="form.secondaryColor" class="color-input"/><pv-input-text v-model="form.secondaryColor" class="w-full" maxlength="7" :invalid="submitted && !hexValid(form.secondaryColor)"/></div>
                </div>
              </div>
              <pv-float-label variant="on">
                <pv-input-text id="headerText" v-model="form.headerText" class="w-full" maxlength="160"/>
                <label for="headerText">{{ t('reports.header-text') }}</label>
              </pv-float-label>
              <pv-float-label variant="on">
                <pv-input-text id="footerText" v-model="form.footerText" class="w-full" maxlength="160"/>
                <label for="footerText">{{ t('reports.footer-text') }}</label>
              </pv-float-label>
              <div class="flex gap-2">
                <pv-select v-model="form.pageSize" :options="pageSizeOptions" option-label="label" option-value="value" class="flex-1"/>
                <pv-select v-model="form.orientation" :options="orientationOptions" option-label="label" option-value="value" class="flex-1"/>
              </div>
              <div class="flex align-items-center gap-2">
                <pv-checkbox v-model="form.showSignatureBlock" input-id="showSignatureBlock" binary/>
                <label for="showSignatureBlock">{{ t('reports.signature-block') }}</label>
              </div>
            </div>
          </template>
        </pv-card>
      </div>

      <div class="col-12 lg:col-6">
        <div class="flex align-items-center justify-content-between mb-2">
          <h2 class="m-0 text-lg">{{ t('reports.sections') }}</h2>
          <pv-button :label="t('reports.add-section')" icon="pi pi-plus" size="small" outlined @click="addSection"/>
        </div>
        <pv-card v-for="(section, i) in form.sections" :key="i" class="mb-3 section-card">
          <template #content>
            <div class="flex align-items-center gap-2 mb-3">
              <span class="order-badge">{{ i + 1 }}</span>
              <pv-input-text v-model="section.title" :placeholder="t('reports.section-title')" class="flex-1" maxlength="80" :invalid="submitted && !required(section.title)"/>
              <pv-button icon="pi pi-arrow-up" text rounded size="small" :disabled="i === 0" @click="moveSection(i, -1)"/>
              <pv-button icon="pi pi-arrow-down" text rounded size="small" :disabled="i === form.sections.length - 1" @click="moveSection(i, 1)"/>
              <pv-button icon="pi pi-trash" text rounded size="small" severity="danger" :disabled="form.sections.length === 1" @click="removeSection(i)"/>
            </div>
            <div v-for="(widget, j) in section.widgets" :key="j" class="widget-row">
              <div class="grid align-items-center">
                <div class="col-12 md:col-3"><pv-select v-model="widget.variableSource" :options="sourceOptions" option-label="label" option-value="value" class="w-full" size="small" @change="onSourceChange(widget)"/></div>
                <div class="col-12 md:col-4"><pv-select v-model="widget.variableCode" :options="variableOptions(widget.variableSource)" option-label="label" option-value="value" editable class="w-full" size="small" :placeholder="t('reports.variable-label')" :invalid="submitted && !required(widget.variableCode)" @change="onVariableChange(widget)"/></div>
                <div class="col-12 md:col-5"><pv-input-text v-model="widget.variableLabel" class="w-full" size="small" :placeholder="t('reports.label')" maxlength="80" :invalid="submitted && !required(widget.variableLabel)"/></div>
                <div class="col-6 md:col-3"><pv-select v-model="widget.viewType" :options="viewOptions(widget.variableSource)" option-label="label" option-value="value" class="w-full" size="small"/></div>
                <div class="col-6 md:col-3"><pv-select v-model="widget.aggregation" :options="aggregationOptions" option-label="label" option-value="value" class="w-full" size="small" :disabled="widget.variableSource !== 'PROCESS'"/></div>
                <div class="col-6 md:col-3"><pv-select v-model="widget.width" :options="widthOptions" option-label="label" option-value="value" class="w-full" size="small"/></div>
                <div class="col-6 md:col-3 flex justify-content-end">
                  <pv-button icon="pi pi-arrow-up" text rounded size="small" :disabled="j === 0" @click="moveWidget(section, j, -1)"/>
                  <pv-button icon="pi pi-arrow-down" text rounded size="small" :disabled="j === section.widgets.length - 1" @click="moveWidget(section, j, 1)"/>
                  <pv-button icon="pi pi-times" text rounded size="small" severity="danger" :disabled="section.widgets.length === 1" @click="removeWidget(section, j)"/>
                </div>
              </div>
            </div>
            <pv-button :label="t('reports.add-widget')" icon="pi pi-plus" text size="small" @click="addWidget(section)"/>
          </template>
        </pv-card>
      </div>

      <div class="col-12 lg:col-3">
        <h2 class="m-0 mb-2 text-lg">{{ t('reports.preview') }}</h2>
        <template-preview :template="form"/>
      </div>
    </div>
  </section>
</template>

<style scoped>
.color-input { width: 2.2rem; height: 2.2rem; padding: 0; border: 1px solid var(--edgewatch-border); border-radius: 6px; background: none; cursor: pointer; }
.order-badge { width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--edgewatch-orange); color: #fff; font-size: .8rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.widget-row { border-top: 1px dashed var(--edgewatch-border); padding: .5rem 0 .25rem; }
.section-card { border-left: 4px solid var(--edgewatch-blue); }
</style>
