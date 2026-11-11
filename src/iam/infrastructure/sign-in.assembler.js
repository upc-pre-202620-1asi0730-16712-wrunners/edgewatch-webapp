import {SignInResource} from "@/iam/infrastructure/sign-in.response.js";

export class SignInAssembler {
    static toRequestFromCommand(command) {
        return {email: command.email, password: command.password};
    }

    static toResourceFromResponse(response) {
        return new SignInResource({...response.data});
    }
}
