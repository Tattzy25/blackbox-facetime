export const MEMORY_ADD_URL = "https://memos.memtensor.cn/api/openmem/v1/add/message";
export const MEMORY_ADD_TOOL_NAME = "add_memory_message";

export type MemoryMessageRole = "user" | "assistant";

export interface MemoryMessage {
  role: MemoryMessageRole;
  content: string;
}

export interface AddMemoryRequestBody {
  user_id: string;
  conversation_id: string;
  messages: MemoryMessage[];
}

export const addMemoryToolDeclaration = {
  name: MEMORY_ADD_TOOL_NAME,
  description: "Add memory messages to memory service",
  parameters: {
    type: "OBJECT",
    properties: {
      messages: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            role: { type: "STRING", enum: ["user", "assistant"] },
            content: { type: "STRING" },
          },
          required: ["role", "content"],
        },
      },
    },
    required: ["messages"],
  },
};

export async function addMemoryMessage(params: {
  apiKey: string;
  body: AddMemoryRequestBody;
}): Promise<Response> {
  const { apiKey, body } = params;

  return fetch(MEMORY_ADD_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
