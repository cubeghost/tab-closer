import { instapaperToken, instapaperTokenSecret } from "./storage";

const API_PROXY_BASE = import.meta.env.WXT_INSTAPAPER_API_PROXY;

export async function instapaperAuth(username: string, password: string) {
  try {
    const response = await fetch(`${API_PROXY_BASE}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const token = await response.json();
    await instapaperToken.setValue(token.oauth_token);
    await instapaperTokenSecret.setValue(token.oauth_token_secret);

    return token;
  } catch (err) {
    console.log(err);
  }
}

export async function instapaperSave(tab: Browser.tabs.Tab) {
  if (!tab.url) throw new Error("Cannot save tab without url");

  const token = await instapaperToken.getValue();
  const secret = await instapaperTokenSecret.getValue();

  const response = await fetch(`${API_PROXY_BASE}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: tab.url, token: { key: token, secret } }),
  });

  return response.ok;
}
