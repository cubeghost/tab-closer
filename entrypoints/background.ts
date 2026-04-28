import { onMessage } from "@/lib/messaging";
import { instapaperAuth, instapaperSave } from "@/lib/instapaper";
import {
  anytypeAuthChallenge,
  anytypeAuthKey,
  anytypeSave,
  anytypeSpaces,
} from "@/lib/anytype";
import {
  arenaAuth,
  arenaChannels,
  arenaCurrentUser,
  arenaSave,
} from "@/lib/arena";

export default defineBackground(() => {
  (browser.action ?? browser.browserAction).onClicked.addListener(async () => {
    const url = browser.runtime.getURL("/page.html");
    await browser.tabs.create({ url });
  });

  onMessage("save", async (message) => {
    switch (message.data.service) {
      case "anytype":
        return await anytypeSave(message.data.tab);
      case "arena":
        return await arenaSave(message.data.tab);
      case "instapaper":
        return await instapaperSave(message.data.tab);
    }
  });

  onMessage(
    "anytypeAuthChallenge",
    async (message) => await anytypeAuthChallenge(),
  );
  onMessage(
    "anytypeAuthKey",
    async (message) =>
      await anytypeAuthKey(message.data.challengeId, message.data.code),
  );
  onMessage("anytypeSpaces", async (message) => await anytypeSpaces());

  onMessage(
    "arenaAuth",
    async (message) =>
      await arenaAuth(
        message.data.code,
        message.data.codeVerifier,
        message.data.redirectUri,
      ),
  );
  onMessage(
    "arenaCurrentUser",
    async (message) => await arenaCurrentUser(message.data.token),
  );
  onMessage("arenaChannels", async (message) => await arenaChannels());

  onMessage(
    "instapaperAuth",
    async (message) =>
      await instapaperAuth(message.data.username, message.data.password),
  );
});
