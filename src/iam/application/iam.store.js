import {defineStore} from "pinia";
import {ref} from "vue";
import {IamApi} from "@/iam/infrastructure/iam-api.js";

const iamApi = new IamApi();

const useIamStore = defineStore("iam", () => {
    const error = ref(null);

    function signUp(command, router) {
        error.value = null;
        return iamApi.signUp(command)
            .then(() => router.push({name: "iam-sign-in"}))
            .catch(err => { console.error("Sign-up failed:", err); error.value = err.message; });
    }

    return {error, signUp};
});

export default useIamStore;
