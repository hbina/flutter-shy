import { invoke } from "@tauri-apps/api";

function apiCall(funName, args) {
  const result = invoke(funName, args);
  // console.log(`calling ${funName} with`, args, " result", result);
  return result;
}

export const load_openapi_definition = async ({ content }) =>
  apiCall("load_openapi_definition", { content });
