import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  save(data: {
    service: "instapaper" | "anytype";
    tab: Browser.tabs.Tab;
  }): boolean;

  instapaperAuth(data: { username: string; password: string }): unknown;
  anytypeAuthChallenge(data: undefined): string;
  anytypeAuthKey(data: { challengeId: string; code: string }): boolean;
  anytypeSpaces(data: undefined): { name: string; id: string }[];
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
