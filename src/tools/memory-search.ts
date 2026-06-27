export const MEMORY_SEARCH_URL = "https://memos.memtensor.cn/api/openmem/v1/search/memory";
export const MEMORY_SEARCH_TOOL_NAME = "search_memory";

export interface SearchMemoryRequestBody {
  query: string;
  user_id: string;
  conversation_id: string;
}

export const searchMemoryToolDeclaration = {
  name: MEMORY_SEARCH_TOOL_NAME,
  description: "Search memory service for relevant context",
  parameters: {
    type: "OBJECT",
    properties: {
      query: { type: "STRING" },
    },
    required: ["query"],
  },
};

export async function searchMemory(params: {
  apiKey: string;
  body: SearchMemoryRequestBody;
}): Promise<Response> {
  const { apiKey, body } = params;

  return fetch(MEMORY_SEARCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
