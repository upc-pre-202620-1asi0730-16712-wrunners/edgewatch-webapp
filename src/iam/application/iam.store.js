import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {SignInAssembler} from "@/iam/infrastructure/sign-in.assembler.js";
import {ROLE} from "@/iam/domain/model/role.entity.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import {RoleAssembler} from "@/iam/infrastructure/role.assembler.js";

const iamApi = new IamApi();
const TOKEN_KEY = "edgewatch.token";
const SESSION_KEY = "edgewatch.session";

const restore = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw && localStorage.getItem(TOKEN_KEY) ? JSON.parse(raw) : null;
    } catch { return null; }
};

/**
 * Application store of the IAM bounded context: session, sign-in, sign-up, sign-out.
 */
const useIamStore = defineStore("iam", () => {
    const session = ref(restore());
    const error = ref(null);

    const isSignedIn = computed(() => session.value !== null);
    const userId = computed(() => session.value?.userId ?? null);
    const email = computed(() => session.value?.email ?? null);
    const fullName = computed(() => session.value?.fullName ?? null);
    const organizationId = computed(() => session.value?.organizationId ?? null);
    const organizationType = computed(() => session.value?.organizationType ?? null);
    const roleIds = computed(() => session.value?.roleIds ?? []);
    const isSupplier = computed(() => organizationType.value === "RECUPERATION_SUPPLIER");
    const isAssetOwner = computed(() => organizationType.value === "ASSET_OWNER");
    const isAdmin = computed(() => hasRole(ROLE.ORG_ADMIN));
    const currentToken = computed(() => isSignedIn.value ? localStorage.getItem(TOKEN_KEY) : null);

    const users = ref([]);
    const roles = ref([]);

    const SUPPLIER_ROLES = ["ROLE_ORG_ADMIN", "ROLE_QUALITY_ENGINEER", "ROLE_MAINTENANCE_SUPERVISOR", "ROLE_HVOF_OPERATOR", "ROLE_OPERATIONS_SUPERVISOR"];
    const ASSET_OWNER_ROLES = ["ROLE_ORG_ADMIN", "ROLE_RELIABILITY_ENGINEER", "ROLE_PROCUREMENT_ANALYST"];
    const assignableRoles = computed(() => roles.value.filter(r => (isSupplier.value ? SUPPLIER_ROLES : ASSET_OWNER_ROLES).includes(r.name)));

    function hasRole(...ids) {
        return ids.some(id => roleIds.value.includes(id));
    }

    function clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
        session.value = null;
    }

    function signIn(command, router) {
        error.value = null;
        return iamApi.signIn(command).then(response => {
            const resource = SignInAssembler.toResourceFromResponse(response);
            const stored = {
                userId: resource.id, email: resource.email, fullName: resource.fullName, organizationId: resource.organizationId,
                organizationType: resource.organizationType, roleIds: resource.roleIds.map(r => r.roleId)
            };
            localStorage.setItem(TOKEN_KEY, resource.token);
            localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
            session.value = stored;
            router.push({name: "home"});
        }).catch(err => {
            console.error("Sign-in failed:", err);
            clear();
            error.value = err.message;
        });
    }

    function signUp(command, router) {
        error.value = null;
        return iamApi.signUp(command)
            .then(() => router.push({name: "iam-sign-in"}))
            .catch(err => { console.error("Sign-up failed:", err); error.value = err.message; });
    }

    function signOut(router) {
        clear();
        router.push({name: "iam-sign-in"});
    }

    function fetchUsersAndRoles() {
        if (!organizationId.value) return;
        iamApi.getRoles().then(r => { roles.value = RoleAssembler.toEntitiesFromResponse(r); });
        iamApi.getUsersByOrganizationId(organizationId.value).then(r => { users.value = UserAssembler.toEntitiesFromResponse(r); });
    }

    function roleName(roleId) {
        return roles.value.find(r => r.id === roleId)?.name ?? `#${roleId}`;
    }

    function updateUserRoles(userId, ids) {
        return iamApi.updateUserRoles(userId, ids.map(roleId => ({roleId}))).then(response => {
            const updated = UserAssembler.toEntityFromResource(response.data);
            const index = users.value.findIndex(u => u.id === updated.id);
            if (index !== -1) users.value[index] = updated;
        }).catch(err => { error.value = err.message; });
    }

    return {
        session, error, isSignedIn, userId, email, fullName, organizationId, organizationType, roleIds,
        isSupplier, isAssetOwner, isAdmin, currentToken, hasRole, signIn, signUp, signOut,
        users, roles, assignableRoles, fetchUsersAndRoles, roleName, updateUserRoles
    };
});

export default useIamStore;
