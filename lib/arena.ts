import { arenaDefaultChannel, arenaToken, arenaUser } from "./storage";

const API_BASE = "https://api.are.na/v3";

export async function arenaCurrentUser(token: string) {
  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const body = await response.json();
    await arenaToken.setValue(token);
    await arenaUser.setValue(body.id);
    return body;
  } else {
    throw new Error("Failed to get current user");
  }
}

export async function arenaChannels() {
  const token = await arenaToken.getValue();
  const userId = await arenaUser.getValue();
  if (!token || !userId) return [];

  const response = await fetch(
    `${API_BASE}/users/${userId}/contents?type=Channel&per=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    return (await response.json()).data;
  } else {
    throw new Error("Failed to get current user");
  }
}

export async function arenaSave(tab: Browser.tabs.Tab) {
  const token = await arenaToken.getValue();
  const userId = await arenaUser.getValue();
  const channel = await arenaDefaultChannel.getValue();
  if (!token || !userId || !channel) return false;

  const response = await fetch(`${API_BASE}/blocks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      value: tab.url,
      channel_ids: [channel],
    }),
  });

  if (response.ok) {
    return true;
  } else {
    throw new Error("Failed to create block");
  }
}
