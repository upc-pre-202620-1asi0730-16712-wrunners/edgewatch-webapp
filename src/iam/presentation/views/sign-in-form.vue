<script setup lang="js">
import {computed, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";
import {SignInCommand} from "@/iam/domain/model/sign-in.command.js";

const {t} = useI18n();
const router = useRouter();
const store = useIamStore();

const submitted = ref(false);
const form = reactive({email: "", password: ""});
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));
const formValid = computed(() => emailValid.value && form.password.length > 0);

const submit = () => {
    submitted.value = true;
    if (!formValid.value) return;
    store.signIn(new SignInCommand({email: form.email, password: form.password}), router);
};
</script>

<template>
  <section class="p-4 md:p-5 flex justify-content-center">
    <pv-card class="w-full max-w-26rem">
      <template #title>{{ t('iam.sign-in.title') }}</template>
      <template #content>
        <form class="flex flex-column gap-4 pt-2" @submit.prevent="submit">
          <div class="flex flex-column gap-1">
            <pv-float-label variant="on">
              <pv-input-text id="email" v-model="form.email" type="email" autocomplete="username" class="w-full" :invalid="submitted && !emailValid"/>
              <label for="email">{{ t('iam.sign-in.email') }}</label>
            </pv-float-label>
            <small v-if="submitted && !emailValid" class="text-red-500">{{ t('iam.error.email') }}</small>
          </div>
          <pv-float-label variant="on">
            <pv-password id="password" v-model="form.password" toggle-mask :feedback="false" input-class="w-full" class="w-full"/>
            <label for="password">{{ t('iam.sign-in.password') }}</label>
          </pv-float-label>
          <pv-message v-if="store.error" severity="error">{{ t('iam.sign-in.failed') }}</pv-message>
          <pv-button type="submit" :label="t('iam.sign-in.submit')" icon="pi pi-sign-in"/>
        </form>
        <p class="text-center mt-4 mb-0">{{ t('iam.sign-in.no-account') }} <router-link :to="{name: 'iam-sign-up'}" class="text-primary font-medium">{{ t('iam.sign-in.sign-up-link') }}</router-link></p>
      </template>
    </pv-card>
  </section>
</template>
