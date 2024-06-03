import Types from "./types/typepoint";

const { default: ModuleApi } = Types.ModuleApi;

declare module "@op-web-code/tele2-ats2-sdk/api" {
  export = ModuleApi;
}
