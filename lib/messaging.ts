import { defineExtensionMessaging } from "@webext-core/messaging";
import { Service } from "./services";

interface ProtocolMap {
  save(data: { service: Service; tab: Browser.tabs.Tab }): boolean;

  anytypeAuthChallenge(data: undefined): string;
  anytypeAuthKey(data: { challengeId: string; code: string }): boolean;
  anytypeSpaces(data: undefined): { name: string; id: string }[];

  arenaCurrentUser(data: { token: string }): { id: string; slug: string };
  arenaChannels(data: undefined): { id: string; title: string; slug: string }[];

  instapaperAuth(data: { username: string; password: string }): unknown;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
