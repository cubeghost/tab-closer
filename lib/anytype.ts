import { anytypeApiKey, anytypeSpace } from "./storage";

const API_BASE = "http://localhost:31009/v1";

export async function anytypeAuthChallenge() {
  const response = await fetch(`${API_BASE}/auth/challenges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Anytype-Version": "2025-11-08",
    },
    body: JSON.stringify({ app_name: "Tab Closer extension" }),
  });

  const body = await response.json();
  return body.challenge_id;
}

export async function anytypeAuthKey(challengeId: string, code: string) {
  const response = await fetch(`${API_BASE}/auth/api_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Anytype-Version": "2025-11-08",
    },
    body: JSON.stringify({ challenge_id: challengeId, code }),
  });

  if (response.ok) {
    const body = await response.json();
    await anytypeApiKey.setValue(body.api_key);
    return true;
  } else {
    throw new Error("Failed to get API key");
  }
}

export async function anytypeSpaces() {
  const apiKey = await anytypeApiKey.getValue();
  if (!apiKey) return [];

  const response = await fetch(`${API_BASE}/spaces`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Anytype-Version": "2025-11-08",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (response.ok) {
    return (await response.json()).data;
  } else {
    throw new Error("Failed to get spaces");
  }
}

export async function anytypeSave(tab: Browser.tabs.Tab) {
  if (!tab.url) throw new Error("Cannot save tab without url");

  const apiKey = await anytypeApiKey.getValue();
  const spaceId = await anytypeSpace.getValue();
  if (!apiKey || !anytypeSpace) return false;

  const response = await fetch(`${API_BASE}/spaces/${spaceId}/objects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Anytype-Version": "2025-11-08",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: tab.title || tab.url,
      type_key: "bookmark",
      layout: "bookmark",

      // source: tab.url,
      properties: [{ key: "source", url: tab.url }],
    }),
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to create object");
  }
}
