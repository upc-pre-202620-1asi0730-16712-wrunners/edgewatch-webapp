<script setup lang="js">
import {computed} from "vue";
import {useI18n} from "vue-i18n";

/** Miniature of how a template lays out on the page, updated as the form changes. */
const props = defineProps({template: {type: Object, required: true}});
const {t} = useI18n();
const landscape = computed(() => props.template.orientation === "LANDSCAPE");
const sections = computed(() => [...props.template.sections].sort((a, b) => a.sectionOrder - b.sectionOrder));
const isFull = (w) => w.width === "FULL" || w.viewType === "TREND" || w.viewType === "TABLE";
</script>

<template>
  <div class="preview-page" :class="{landscape}" :style="{'--primary': template.primaryColor, '--secondary': template.secondaryColor}">
    <div class="band"><span>{{ template.headerText || template.name || t('reports.preview-header') }}</span></div>
    <div class="body">
      <div class="title">{{ template.name || t('reports.preview-title') }}</div>
      <div v-for="section in sections" :key="section.sectionOrder" class="section">
        <div class="section-title">{{ section.title || t('reports.preview-section') }}</div>
        <div class="grid-widgets">
          <div v-for="widget in section.widgets" :key="widget.position" class="widget" :class="{full: isFull(widget), chart: widget.viewType === 'TREND', table: widget.viewType === 'TABLE'}">
            <small>{{ widget.variableLabel || widget.variableCode || t('reports.preview-widget') }}</small>
            <template v-if="widget.viewType === 'TREND'"><svg viewBox="0 0 100 24" preserveAspectRatio="none"><polyline points="0,16 15,12 30,14 45,6 60,10 75,4 90,9 100,7" fill="none" stroke="var(--secondary)" stroke-width="2"/></svg></template>
            <template v-else-if="widget.viewType === 'TABLE'"><div class="rows"><i/><i/><i/></div></template>
            <template v-else><b>{{ widget.viewType === 'MIN_MAX' ? '152 – 168' : '160' }}</b></template>
          </div>
        </div>
      </div>
      <div v-if="template.showSignatureBlock" class="signature"><span></span><span></span></div>
    </div>
    <div class="footer">{{ template.footerText || 'EdgeWatch' }}<em>1 / 1</em></div>
  </div>
</template>

<style scoped>
.preview-page { width: 100%; max-width: 320px; aspect-ratio: 210 / 297; background: #fff; border: 1px solid var(--edgewatch-border); box-shadow: 0 6px 18px rgba(16,28,45,.12); display: flex; flex-direction: column; font-size: 7px; color: #222; overflow: hidden; margin: 0 auto; }
.preview-page.landscape { aspect-ratio: 297 / 210; max-width: 420px; }
.band { background: var(--primary); color: #fff; padding: 6px 8px; font-weight: 700; font-size: 8px; border-bottom: 2px solid var(--secondary); }
.body { padding: 8px; flex: 1; overflow: hidden; }
.title { color: var(--primary); font-weight: 700; font-size: 11px; margin-bottom: 6px; }
.section { margin-bottom: 6px; }
.section-title { border-left: 2px solid var(--secondary); padding-left: 4px; color: var(--primary); font-weight: 700; margin-bottom: 3px; }
.grid-widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
.widget { background: #f6f7fa; border-radius: 3px; padding: 3px 4px; display: flex; flex-direction: column; gap: 1px; min-height: 16px; }
.widget small { color: #6b7280; font-size: 5.5px; text-transform: uppercase; letter-spacing: .03em; }
.widget b { font-size: 8px; }
.widget.full { grid-column: 1 / -1; }
.widget.chart svg { width: 100%; height: 22px; }
.rows { display: flex; flex-direction: column; gap: 2px; }
.rows i { display: block; height: 3px; background: #dde2ea; border-radius: 2px; }
.signature { display: flex; gap: 10px; margin-top: 10px; }
.signature span { flex: 1; border-top: 1px solid #999; height: 6px; }
.footer { border-top: 1px solid var(--secondary); padding: 3px 8px; color: #888; display: flex; justify-content: space-between; font-size: 6px; }
</style>
