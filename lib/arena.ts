import { arenaDefaultChannel, arenaToken, arenaUser } from "./storage";

export interface ArenaUser {
  id: string;
  slug: string;
}

export interface ArenaChannel {
  id: string;
  title: string;
  slug: string;
}

const API_BASE = "https://api.are.na/v3";

export async function arenaAuth(
  code: string,
  codeVerifier: string,
  redirectUri: string,
) {
  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: import.meta.env.WXT_ARENA_CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) throw new Error("Failed to get access token");

  const { access_token } = await response.json();
  await arenaToken.setValue(access_token);

  const user = await arenaCurrentUser();

  return user;
}

export async function arenaCurrentUser(): Promise<ArenaUser> {
  const token = await arenaToken.getValue();
  if (!token) throw new Error("Missing Are.na token");

  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const body = (await response.json()) as ArenaUser;
    await arenaUser.setValue(body.id);
    return body;
  } else {
    throw new Error("Failed to get current user");
  }
}

export async function arenaChannels(): Promise<ArenaChannel[]> {
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
    return (await response.json()).data as ArenaChannel[];
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
