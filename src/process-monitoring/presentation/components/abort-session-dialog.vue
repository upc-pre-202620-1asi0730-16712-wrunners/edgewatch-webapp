<script setup lang="js">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {ABORT_REASONS} from "@/process-monitoring/domain/model/spray-session.entity.js";

/**
 * Modal that asks the abort reason. Emits "confirm" with "REASON" or "REASON: notes".
 */
const visible = defineModel("visible", {type: Boolean, default: false});
const emit = defineEmits(["confirm"]);
const {t} = useI18n();

const reason = ref(null);
const notes = ref("");
const options = computed(() => ABORT_REASONS.map(value => ({value, label: t("session-detail.abort-reason-option." + value)})));

const confirm = () => {
    if (!reason.value) return;
    emit("confirm", notes.value.trim() ? `${reason.value}: ${notes.value.trim()}` : reason.value);
    visible.value = false;
    reason.value = null;
    notes.value = "";
};
</script>

<template>
  <pv-dialog v-model:visible="visible" :header="t('session-detail.abort-title')" modal :style="{width: '26rem'}">
    <div class="flex flex-column gap-3 pt-2">
      <pv-float-label variant="on">
        <pv-select id="abortReason" v-model="reason" :options="options" option-label="label" option-value="value" class="w-full"/>
        <label for="abortReason">{{ t('session-detail.abort-reason') }}</label>
      </pv-float-label>
      <pv-float-label variant="on">
        <pv-textarea id="abortNotes" v-model="notes" rows="3" class="w-full"/>
        <label for="abortNotes">{{ t('session-detail.abort-notes') }}</label>
      </pv-float-label>
    </div>
    <template #footer>
      <pv-button :label="t('session-detail.abort-cancel')" text @click="visible = false"/>
      <pv-button :label="t('session-detail.abort-confirm')" severity="danger" :disabled="!reason" @click="confirm"/>
    </template>
  </pv-dialog>
</template>
