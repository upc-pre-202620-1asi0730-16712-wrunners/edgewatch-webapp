<script setup lang="js">
import {computed, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";
import {SignUpCommand} from "@/iam/domain/model/sign-up.command.js";

const {t} = useI18n();
const router = useRouter();
const store = useIamStore();

const step = ref("1");
const submitted = ref(false);
const org = reactive({organizationName: "", ruc: "", organizationType: "RECUPERATION_SUPPLIER"});
const admin = reactive({fullName: "", email: "", password: ""});

const required = (v) => String(v ?? "").trim().length > 0;
const rucValid = computed(() => /^\d{11}$/.test(org.ruc));
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email));
const orgValid = computed(() => required(org.organizationName) && rucValid.value);
const adminValid = computed(() => required(admin.fullName) && emailValid.value && admin.password.length >= 8);

const submit = () => {
    submitted.value = true;
    if (!orgValid.value || !adminValid.value) return;
    store.signUp(new SignUpCommand({...org, ...admin}), router);
};
</script>

<template>
  <section class="p-4 md:p-5 flex justify-content-center">
    <pv-card class="w-full max-w-40rem">
      <template #title>{{ t('iam.sign-up.title') }}</template>
      <template #content>
        <pv-stepper v-model:value="step" linear>
          <pv-step-list>
            <pv-step value="1">{{ t('iam.sign-up.organization-step') }}</pv-step>
            <pv-step value="2">{{ t('iam.sign-up.admin-step') }}</pv-step>
          </pv-step-list>
          <pv-step-panels>
            <pv-step-panel v-slot="{ activateCallback }" value="1">
              <div class="flex flex-column gap-4 pt-3">
                <pv-float-label variant="on">
                  <pv-input-text id="organizationName" v-model="org.organizationName" class="w-full" :invalid="submitted && !required(org.organizationName)"/>
                  <label for="organizationName">{{ t('iam.sign-up.organization-name') }}</label>
                </pv-float-label>
                <div class="flex flex-column gap-1">
                  <pv-float-label variant="on">
                    <pv-input-text id="ruc" v-model="org.ruc" maxlength="11" class="w-full" :invalid="submitted && !rucValid"/>
                    <label for="ruc">{{ t('iam.sign-up.ruc') }}</label>
                  </pv-float-label>
                  <small v-if="submitted && !rucValid" class="text-red-500">{{ t('iam.error.ruc') }}</small>
                </div>
                <p class="m-0 text-sm text-color-secondary">{{ t('iam.sign-up.organization-type') }}</p>
                <div class="flex flex-column gap-2">
                  <label class="type-option flex gap-3 align-items-start" :class="{selected: org.organizationType === 'RECUPERATION_SUPPLIER'}">
                    <pv-radio-button v-model="org.organizationType" value="RECUPERATION_SUPPLIER" input-id="supplier"/>
                    <span><strong>{{ t('iam.sign-up.supplier') }}</strong><br><small class="text-color-secondary">{{ t('iam.sign-up.supplier-hint') }}</small></span>
                  </label>
                  <label class="type-option flex gap-3 align-items-start" :class="{selected: org.organizationType === 'ASSET_OWNER'}">
                    <pv-radio-button v-model="org.organizationType" value="ASSET_OWNER" input-id="assetOwner"/>
                    <span><strong>{{ t('iam.sign-up.asset-owner') }}</strong><br><small class="text-color-secondary">{{ t('iam.sign-up.asset-owner-hint') }}</small></span>
                  </label>
                </div>
                <div class="flex justify-content-end">
                  <pv-button :label="t('iam.sign-up.next')" icon="pi pi-arrow-right" icon-pos="right" :disabled="!orgValid" @click="activateCallback('2')"/>
                </div>
              </div>
            </pv-step-panel>
            <pv-step-panel v-slot="{ activateCallback }" value="2">
              <form class="flex flex-column gap-4 pt-3" @submit.prevent="submit">
                <pv-float-label variant="on">
                  <pv-input-text id="fullName" v-model="admin.fullName" class="w-full" :invalid="submitted && !required(admin.fullName)"/>
                  <label for="fullName">{{ t('iam.sign-up.full-name') }}</label>
                </pv-float-label>
                <div class="flex flex-column gap-1">
                  <pv-float-label variant="on">
                    <pv-input-text id="email" v-model="admin.email" type="email" class="w-full" :invalid="submitted && !emailValid"/>
                    <label for="email">{{ t('iam.sign-up.email') }}</label>
                  </pv-float-label>
                  <small v-if="submitted && !emailValid" class="text-red-500">{{ t('iam.error.email') }}</small>
                </div>
                <div class="flex flex-column gap-1">
                  <pv-float-label variant="on">
                    <pv-password id="password" v-model="admin.password" toggle-mask :feedback="false" input-class="w-full" class="w-full" :invalid="submitted && admin.password.length < 8"/>
                    <label for="password">{{ t('iam.sign-up.password') }}</label>
                  </pv-float-label>
                  <small v-if="submitted && admin.password.length < 8" class="text-red-500">{{ t('iam.error.password-min') }}</small>
                </div>
                <pv-message v-if="store.error" severity="error">{{ store.error }}</pv-message>
                <div class="flex justify-content-between">
                  <pv-button type="button" :label="t('iam.sign-up.back')" icon="pi pi-arrow-left" text @click="activateCallback('1')"/>
                  <pv-button type="submit" :label="t('iam.sign-up.submit')" icon="pi pi-check"/>
                </div>
              </form>
            </pv-step-panel>
          </pv-step-panels>
        </pv-stepper>
        <p class="text-center mt-4 mb-0">{{ t('iam.sign-up.have-account') }} <router-link :to="{name: 'iam-sign-in'}" class="text-primary font-medium">{{ t('iam.sign-up.sign-in-link') }}</router-link></p>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.type-option { border: 1px solid var(--p-surface-300); border-radius: 8px; padding: .75rem 1rem; cursor: pointer; }
.type-option.selected { border-color: var(--p-primary-color); background: var(--p-primary-50); }
</style>
