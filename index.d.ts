import Types from "./types/typepoint";

const { default: ModuleClient } = Types.ModuleClient;

declare module "@op-web-code/tele2-ats2-sdk" {
  export = ModuleClient;
}
