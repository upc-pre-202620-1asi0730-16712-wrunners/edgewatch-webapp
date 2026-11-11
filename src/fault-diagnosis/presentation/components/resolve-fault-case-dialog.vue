<script setup lang="js">
import {ref, watch} from "vue";
import {useI18n} from "vue-i18n";

/** Asks for the resolution notes before resolving a case. */
const props = defineProps({visible: {type: Boolean, default: false}});
const emit = defineEmits(["update:visible", "confirm"]);
const {t} = useI18n();
const notes = ref("");
watch(() => props.visible, (v) => { if (v) notes.value = ""; });
const close = () => emit("update:visible", false);
const confirm = () => { emit("confirm", notes.value.trim() || null); close(); };
</script>

<template>
  <pv-dialog :visible="visible" modal :header="t('fault-cases.resolve-title')" class="w-full max-w-30rem" @update:visible="close">
    <div class="flex flex-column gap-3 pt-2">
      <pv-float-label variant="on">
        <pv-textarea id="resolutionNotes" v-model="notes" rows="3" auto-resize class="w-full" maxlength="500"/>
        <label for="resolutionNotes">{{ t('fault-cases.resolution-notes') }}</label>
      </pv-float-label>
      <div class="flex justify-content-end gap-2">
        <pv-button :label="t('fault-cases.cancel')" text @click="close"/>
        <pv-button :label="t('fault-cases.resolve')" icon="pi pi-check" @click="confirm"/>
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
</style>
