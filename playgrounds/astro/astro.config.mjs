import { defineConfig } from "astro/config";
import olex from "vite-plugin-olex";
// @ts-check

// https://astro.build/config
export default defineConfig({

  vite: {
    plugins: [olex()],
    css: {
      transformer: "lightningcss",
      lightningcss: {
        drafts: {
          customMedia: true,
        },
      },
    },
  },

  server: {
    host: true,
    open: true,
  },

});
