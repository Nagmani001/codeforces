import axios from "axios";

export type MailhogMessage = {
  ID?: string;
  Content?: {
    Headers?: Record<string, string[]>;
    Body?: string;
  };
  Raw?: {
    Data?: string;
  };
  To?: { Mailbox: string; Domain: string }[];
};

export type MailhogClient = {
  clear: () => Promise<void>;
  list: () => Promise<MailhogMessage[]>;
  waitForMessage: (predicate: (msg: MailhogMessage) => boolean, timeoutMs?: number) => Promise<MailhogMessage>;
};

const DEFAULT_MAILHOG_URL = process.env.MAILHOG_URL || "http://localhost:8025";

function normalizeMessages(payload: any): MailhogMessage[] {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.Messages)) return payload.Messages;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function createMailhogClient(baseURL: string = DEFAULT_MAILHOG_URL): MailhogClient {
  async function clear() {
    try {
      await axios.delete(`${baseURL}/api/v1/messages`);
    } catch (err) {
      // Best-effort cleanup; ignore if endpoint isn't available
    }
  }

  async function list(): Promise<MailhogMessage[]> {
    const res = await axios.get(`${baseURL}/api/v2/messages`);
    return normalizeMessages(res.data);
  }

  async function waitForMessage(
    predicate: (msg: MailhogMessage) => boolean,
    timeoutMs: number = 10000,
  ): Promise<MailhogMessage> {
    const start = Date.now();
    // Poll every 250ms
    while (Date.now() - start < timeoutMs) {
      const messages = await list();
      const found = messages.find(predicate);
      if (found) return found;
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error("Timed out waiting for MailHog message");
  }

  return { clear, list, waitForMessage };
}

export function extractOtpFromMessage(message: MailhogMessage): string | null {
  const body = message?.Content?.Body || message?.Raw?.Data || "";
  const match = body.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

export function extractResetTokenFromMessage(message: MailhogMessage): string | null {
  const body = message?.Content?.Body || message?.Raw?.Data || "";
  const match = body.match(/token=([A-Za-z0-9_-]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function extractRecipients(message: MailhogMessage): string[] {
  const to = message.To?.map((t) => `${t.Mailbox}@${t.Domain}`) ?? [];
  const headerTo = message.Content?.Headers?.To ?? [];
  return [...to, ...headerTo];
}
