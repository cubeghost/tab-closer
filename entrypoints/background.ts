import { onMessage } from "@/lib/messaging";
import { instapaperAuth, instapaperSave } from "@/lib/instapaper";
import {
  anytypeAuthChallenge,
  anytypeAuthKey,
  anytypeSave,
  anytypeSpaces,
  anytypeTypes,
} from "@/lib/anytype";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  (browser.action ?? browser.browserAction).onClicked.addListener(async () => {
    console.log("browser action triggered");
    const url = browser.runtime.getURL("/page.html");
    await browser.tabs.create({ url });
  });

  onMessage("save", async (message) => {
    switch (message.data.service) {
      case "anytype":
        return await anytypeSave(message.data.tab);
      case "instapaper":
        return await instapaperSave(message.data.tab);
    }
  });

  onMessage(
    "instapaperAuth",
    async (message) =>
      await instapaperAuth(message.data.username, message.data.password),
  );

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
});
