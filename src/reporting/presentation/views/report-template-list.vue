<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useReportingStore from "@/reporting/application/reporting.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {ROLE} from "@/iam/domain/model/role.entity.js";

/**
 * Report templates of the organization: list grouped by kind, create, edit, archive and reactivate.
 */
const {t} = useI18n();
const router = useRouter();
const store = useReportingStore();
const iam = useIamStore();

const showArchived = ref(false);
const canManage = computed(() => iam.hasRole(ROLE.ORG_ADMIN, ROLE.QUALITY_ENGINEER));
const rows = computed(() => showArchived.value ? store.templates : store.activeTemplates);

const openNew = () => router.push({name: "reporting-template-new"});
const openEdit = (tpl) => router.push({name: "reporting-template-edit", params: {id: tpl.id}});
const toggle = (tpl) => tpl.isActive ? store.archiveTemplate(tpl.id) : store.reactivateTemplate(tpl.id);

onMounted(() => store.fetchTemplates());
</script>

<template>
  <section class="p-4 md:p-5">
    <div class="flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <div>
        <h1 class="page-title">{{ t('reports.templates-title') }}</h1>
        <p class="m-0 text-color-secondary">{{ t('reports.templates-hint') }}</p>
      </div>
      <pv-button v-if="canManage" :label="t('reports.new-template')" icon="pi pi-plus" @click="openNew"/>
    </div>
    <div class="flex align-items-center gap-2 mb-3">
      <pv-checkbox v-model="showArchived" input-id="showArchived" binary/>
      <label for="showArchived">{{ t('reports.show-archived') }}</label>
    </div>
    <pv-message v-if="store.error" severity="error" class="mb-3">{{ store.error }}</pv-message>

    <pv-data-table :value="rows" :loading="!store.templatesLoaded" striped-rows row-group-mode="subheader" group-rows-by="reportKind" sort-field="reportKind" :sort-order="1">
      <template #empty>{{ t('reports.no-templates') }}</template>
      <template #groupheader="{ data }"><span class="font-bold text-primary">{{ t('reports.kind.' + data.reportKind) }}</span></template>
      <pv-column field="reportKind" :header="t('reports.kind-label')" style="display: none"/>
      <pv-column field="name" :header="t('reports.name')">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span class="swatch" :style="{background: data.primaryColor, borderColor: data.secondaryColor}"></span>
            <span class="font-semibold">{{ data.name }}</span>
            <pv-tag v-if="data.defaultForKind" :value="t('reports.default')" severity="info"/>
            <pv-tag v-if="!data.isActive" :value="t('reports.archived')" severity="secondary"/>
          </div>
          <small class="text-color-secondary">{{ data.description }}</small>
        </template>
      </pv-column>
      <pv-column :header="t('reports.layout')">
        <template #body="{ data }">{{ data.pageSize }} · {{ t('reports.orientation-option.' + data.orientation) }} · {{ t('reports.sections-count', {count: data.sections.length}) }} · {{ t('reports.widgets-count', {count: data.widgetCount}) }}</template>
      </pv-column>
      <pv-column :header="t('common.actions')" style="width: 8rem">
        <template #body="{ data }">
          <pv-button v-if="canManage && data.isActive" icon="pi pi-pencil" text rounded v-tooltip.top="t('common.edit')" @click="openEdit(data)"/>
          <pv-button v-if="canManage" :icon="data.isActive ? 'pi pi-inbox' : 'pi pi-replay'" text rounded :severity="data.isActive ? 'secondary' : 'success'" v-tooltip.top="t(data.isActive ? 'reports.archive' : 'reports.reactivate')" @click="toggle(data)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
.swatch { width: 14px; height: 14px; border-radius: 4px; border: 3px solid; flex-shrink: 0; }
</style>
