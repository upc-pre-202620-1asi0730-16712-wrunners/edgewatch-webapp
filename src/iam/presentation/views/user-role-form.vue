<script setup lang="js">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useIamStore();

const userId = parseInt(route.params.id);
const user = computed(() => store.users.find(u => u.id === userId));
const selected = ref([]);
const options = computed(() => store.assignableRoles.map(r => ({value: r.id, label: t("iam.users.role-option." + r.name)})));

watch(user, (u) => { if (u) selected.value = u.roleIds.map(r => r.roleId); }, {immediate: true});

const back = () => router.push({name: "iam-users"});
const save = () => store.updateUserRoles(userId, selected.value).then(back);
onMounted(() => store.fetchUsersAndRoles());
</script>

<template>
  <section class="p-4 md:p-5">
    <template v-if="user">
      <h1 class="mt-0 text-3xl font-bold text-color">{{ t('iam.users.roles-title', {name: user.fullName}) }}</h1>
      <pv-listbox v-model="selected" :options="options" option-label="label" option-value="value" multiple checkmark class="max-w-30rem"/>
      <div class="flex gap-2 mt-3 max-w-30rem justify-content-end">
        <pv-button :label="t('iam.users.cancel')" text @click="back"/>
        <pv-button :label="t('iam.users.save')" icon="pi pi-check" @click="save"/>
      </div>
    </template>
  </section>
</template>
