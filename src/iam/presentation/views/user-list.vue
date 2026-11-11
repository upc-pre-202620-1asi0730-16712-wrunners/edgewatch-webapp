<script setup lang="js">
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";

const {t} = useI18n();
const router = useRouter();
const store = useIamStore();
const editRoles = (id) => router.push({name: "iam-user-roles", params: {id}});
onMounted(() => store.fetchUsersAndRoles());
</script>

<template>
  <section class="p-4 md:p-5">
    <h1 class="mt-0 text-3xl font-bold text-color">{{ t('iam.users.title') }}</h1>
    <pv-data-table :value="store.users" striped-rows>
      <pv-column field="fullName" :header="t('iam.users.name')"/>
      <pv-column field="email" :header="t('iam.users.email')"/>
      <pv-column :header="t('iam.users.roles')">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <pv-tag v-for="r in data.roleIds" :key="r.roleId" :value="t('iam.users.role-option.' + store.roleName(r.roleId))" severity="secondary"/>
          </div>
        </template>
      </pv-column>
      <pv-column field="status" :header="t('iam.users.status')"/>
      <pv-column :header="t('iam.users.actions')" style="width: 5rem">
        <template #body="{ data }"><pv-button icon="pi pi-users" text rounded v-tooltip.top="t('iam.users.edit-roles')" @click="editRoles(data.id)"/></template>
      </pv-column>
    </pv-data-table>
  </section>
</template>
