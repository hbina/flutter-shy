import { invoke } from "@tauri-apps/api";

async function apiCall<O>(
  funName: string,
  args: Record<string, unknown>
): Promise<O> {
  const result = await invoke<O>(funName, args);
  // console.log(`calling ${funName} with`, args, " result", result);
  return result;
}

export const load_openapi_definition = async ({
  content,
}: {
  content: string;
}) => apiCall<void>("load_openapi_definition", { content });
