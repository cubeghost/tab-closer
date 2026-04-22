import { instapaperPassword, instapaperUsername } from "./storage";

const API_BASE = "https://www.instapaper.com/api";

export async function instapaperAuth(username: string, password: string) {
  const formdata = new FormData();
  formdata.set("username", username);
  formdata.set("password", password);

  const response = await fetch(`${API_BASE}/authenticate`, {
    method: "POST",
    mode: "no-cors",
    body: formdata,
  });

  await instapaperUsername.setValue(username);
  await instapaperPassword.setValue(password);

  console.log(await response.text());
  return response.status;
}

export async function instapaperSave(tab: Browser.tabs.Tab) {
  if (!tab.url) throw new Error("Cannot save tab without url");

  const username = await instapaperUsername.getValue();
  const password = await instapaperPassword.getValue();

  const formdata = new FormData();
  formdata.set("username", username);
  formdata.set("password", password);
  formdata.set("url", tab.url);

  const response = await fetch(`${API_BASE}/add`, {
    method: "POST",
    body: formdata,
  });

  return response.ok;
}
