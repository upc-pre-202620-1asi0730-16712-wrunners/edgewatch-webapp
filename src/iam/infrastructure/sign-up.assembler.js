import {SignUpResource} from "@/iam/infrastructure/sign-up.response.js";

export class SignUpAssembler {
    static toRequestFromCommand(command) {
        return {...command};
    }

    static toResourceFromResponse(response) {
        return new SignUpResource({...response.data});
    }
}
