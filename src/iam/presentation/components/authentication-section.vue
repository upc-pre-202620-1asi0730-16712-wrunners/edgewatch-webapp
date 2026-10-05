<script setup lang="js">
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useIamStore();
const menu = ref(null);

const items = [{label: t("iam.section.sign-out"), icon: "pi pi-sign-out", command: () => store.signOut(router)}];
const toggle = (event) => menu.value.toggle(event);
</script>

<template>
  <template v-if="store.isSignedIn">
    <pv-button :label="t('iam.section.welcome', {name: store.fullName})" icon="pi pi-user" text class="text-white" @click="toggle"/>
    <pv-menu ref="menu" :model="items" popup>
      <template #start>
        <div class="px-3 py-2 text-sm text-color-secondary">{{ store.email }}<br><small>{{ store.organizationType }}</small></div>
      </template>
    </pv-menu>
  </template>
  <template v-else>
    <pv-button :label="t('iam.section.sign-in')" text class="text-white" @click="router.push({name: 'iam-sign-in'})"/>
    <pv-button :label="t('iam.section.sign-up')" outlined class="text-white border-white" @click="router.push({name: 'iam-sign-up'})"/>
  </template>
</template>
