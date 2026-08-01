/**
 * Gloo AI Studio Completions V2 (platform.ai.gloo.com).
 * Uses OAuth client credentials; routes to Google Gemma via model_family when requested.
 */

const TOKEN_URL = "https://platform.ai.gloo.com/oauth2/token";
const COMPLETIONS_URL = "https://platform.ai.gloo.com/ai/v2/chat/completions";

let cachedToken = null;

function getGlooCredentials() {
  const clientId = process.env.GLOO_CLIENT_ID;
  const clientSecret =
    process.env.GLOO_CLIENT_SECRET || process.env.GLOO_API_KEY;

  return { clientId, clientSecret };
}

export function isGlooConfigured() {
  const { clientId, clientSecret } = getGlooCredentials();
  return Boolean(clientId && clientSecret);
}

async function fetchAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires_at > now + 60) {
    return cachedToken.access_token;
  }

  const { clientId, clientSecret } = getGlooCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("Gloo credentials not configured");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "api/access",
  });

  const authRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!authRes.ok) {
    const errText = await authRes.text().catch(() => "");
    throw new Error(`Gloo OAuth failed (${authRes.status}): ${errText.slice(0, 200)}`);
  }

  const tokenData = await authRes.json();
  cachedToken = {
    access_token: tokenData.access_token,
    expires_at: now + (tokenData.expires_in || 3600),
  };
  return cachedToken.access_token;
}

/**
 * Chat completion via Gloo V2 — defaults to Google model family (Gemma).
 */
export async function glooChatCompletion({
  messages,
  system,
  temperature = 0.5,
  max_tokens = 512,
  model_family = "google",
  auto_routing = false,
  response_json = true,
}) {
  const token = await fetchAccessToken();
  const payload = {
    messages: system
      ? [{ role: "system", content: system }, ...messages]
      : messages,
    temperature,
    max_tokens,
  };

  if (auto_routing) {
    payload.auto_routing = true;
    payload.tradition = "evangelical";
  } else {
    payload.model_family = model_family;
  }

  if (response_json) {
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch(COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gloo completion failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const model = data.model || data.routing?.model || model_family;

  return { content, model, raw: data };
}
