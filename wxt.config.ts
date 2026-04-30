import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  manifest: ({ browser }) => ({
    action: {},
    permissions: ["tabs", "tabGroups", "storage", "identity"],
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt7NXeKHJ9eLvadNT6DuE3eSq4ezYpaCQsV3DfjApeUK3cRMXMfDTiVRtxOoqwaStF49RBPImEdb7g7Dv7bdNupwL7jDCmh9FgQQQVPPJ8jvvCBUz/QqB0OPiOSnbOtAI46mzBR109ZBmeDU4ibtn2BZz3MrJQj+4R21qin84ZTeM9KsIXfDjgoy5olFEPNKe9T0Stu8Ur5Hkqsk8+LmSP5dx0ENQkd8XE0to0XdLwgRe5K2DQTShvEgqqWWrI46PVaFHoszKlUDQ8k9Q0ESKHOtkOSEl65Pg27RnYZYWcdRDdTpT3DmDKZs7+spAzKxUIOwb2jUONZpqs4Fk1X4SNwIDAQAB",
  }),
  webExt: {
    chromiumArgs: [
      "https://google.com",
      "https://youtube.com",
      "https://developer.mozilla.org",
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  autoIcons: {
    baseIconPath: "assets/icon.svg",
    grayscaleOnDevelopment: false,
  },
});
