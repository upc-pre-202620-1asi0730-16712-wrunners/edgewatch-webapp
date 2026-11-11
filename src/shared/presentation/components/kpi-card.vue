<script setup lang="js">
/** A single key figure with a label, an icon and an optional hint. */
defineProps({
    label: {type: String, required: true},
    value: {type: [Number, String], required: true},
    icon: {type: String, default: "pi pi-chart-bar"},
    hint: {type: String, default: ""},
    severity: {type: String, default: "primary"}
});
</script>

<template>
  <pv-card class="kpi-card h-full" :class="'kpi-' + severity">
    <template #content>
      <div class="flex align-items-center gap-3">
        <span class="kpi-icon flex align-items-center justify-content-center border-circle"><i :class="icon"></i></span>
        <div class="flex flex-column">
          <span class="text-sm text-color-secondary">{{ label }}</span>
          <span class="text-3xl font-bold line-height-1">{{ value }}</span>
          <small v-if="hint" class="text-color-secondary mt-1">{{ hint }}</small>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.kpi-card { border-left: 5px solid var(--kpi-color); }
.kpi-icon { width: 2.75rem; height: 2.75rem; background: color-mix(in srgb, var(--kpi-color) 15%, transparent); color: var(--kpi-color); font-size: 1.25rem; }
.kpi-primary { --kpi-color: #8b1fe0; }
.kpi-success { --kpi-color: #15803d; }
.kpi-warn    { --kpi-color: #ea580c; }
.kpi-danger  { --kpi-color: #b91c1c; }
.kpi-info    { --kpi-color: #0ea5e9; }
</style>
