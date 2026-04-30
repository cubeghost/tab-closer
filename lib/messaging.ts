import { defineExtensionMessaging } from "@webext-core/messaging";
import type { Service } from "./services";
import type { ArenaChannel, ArenaUser } from "./arena";
import type { InstapaperFolder } from "./instapaper";

interface ProtocolMap {
  save(data: { service: Service; tab: Browser.tabs.Tab }): boolean;

  anytypeAuthChallenge(data: undefined): string;
  anytypeAuthKey(data: { challengeId: string; code: string }): boolean;
  anytypeSpaces(data: undefined): { name: string; id: string }[];

  arenaAuth(data: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): ArenaUser;
  arenaChannels(data: undefined): ArenaChannel[];

  instapaperAuth(data: { username: string; password: string }): unknown;
  instapaperFolders(data: undefined): InstapaperFolder[];
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
