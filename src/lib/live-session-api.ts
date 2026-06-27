export type LivePersonaConfig = {
  systemInstruction: string;
  model?: string;
  enableGoogleSearch?: boolean;
  enabledMcpTools?: string[];
};

export async function startLiveSession(_params: {
  model: string;
  voice: string;
  startedAt: string;
  metadata?: Record<string, unknown>;
}) {}

export async function endLiveSession(_params: {
  elapsedMs: number;
  reason: string;
  metadata?: Record<string, unknown>;
}) {}

export async function heartbeatLiveSession(_params: {
  elapsedMs: number;
  muted: boolean;
  videoEnabled: boolean;
  metadata?: Record<string, unknown>;
}) {}
