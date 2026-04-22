import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    action: {},
    permissions: ["tabs", "tabGroups", "storage"],
  },
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
});
