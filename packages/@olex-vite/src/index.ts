import path from "path";
import { compiler, parseContents } from "olex";
import type { Plugin, ResolvedConfig, ViteDevServer, Update, Rollup } from "vite";

export default function olex(): Plugin[] {
  let server: ViteDevServer | null = null;
  let config: ResolvedConfig | null = null;

  let isSSR = false;
  let isCssMinify = false;

  let cssModules: Record<
    string,
    {
      content: string;
      handled: boolean;
    }
  > = {};
  let cssPlugins: readonly Plugin[] = [];

  function getExtension(id: string) {
    let [filename] = id.split("?", 2);
    return path.extname(filename).slice(1);
  }

  function isOlex(id: string, code: string) {
    const ext = getExtension(id);
    const isCss = ext === "css" || (ext === "vue" && id.includes("&lang:css"));
    return isCss && code.includes("@olex");
  }

  function updateCSS(isSSR: boolean) {
    if (!server) return;

    let updates: Update[] = [];
    for (let id of Object.keys(cssModules)) {
      const cssModule = server.moduleGraph.getModuleById(id);
      if (!cssModule) {
        if (!isSSR) {
          delete cssModules[id];
        }
        continue;
      }

      server.moduleGraph.invalidateModule(cssModule);
      updates.push({
        type: `${cssModule.type}-update`,
        path: cssModule.url,
        acceptedPath: cssModule.url,
        timestamp: Date.now(),
      });

      if (updates.length > 0) {
        server.ws.send({
          type: "update",
          updates,
        });
      }
    }
  }

  async function transformWithPlugins(context: Rollup.PluginContext, id: string, css: string) {
    let transformPluginContext = {
      ...context,
      getCombinedSourcemap: () => {
        throw new Error("getCombinedSourcemap not implemented");
      },
    };

    for (let plugin of cssPlugins) {
      if (!plugin.transform) continue;
      let transformHandler = "handler" in plugin.transform! ? plugin.transform.handler : plugin.transform!;

      try {
        let result = await transformHandler.call(transformPluginContext, css, id);
        if (!result) continue;
        if (typeof result === "string") {
          css = result;
        } else if (result.code) {
          css = result.code;
        }
      } catch (e) {
        console.error(`Error running ${plugin.name} on Olex CSS output. Skipping.`);
      }
    }
    return css;
  }

  return [
    {
      name: "@olex/vite:scan",
      enforce: "pre",

      // サーバーインスタンスの保存
      configureServer(_server) {
        server = _server;
      },

      // 設定
      async configResolved(_config) {
        config = _config;

        isSSR = !!config.build.ssr;
        isCssMinify = !!config.build.cssMinify;

        // 有効にするプラグインリスト
        const allowedPlugins = ["vite:css", ...(config.command === "build" ? ["vite:css-post"] : [])];

        // プラグインリストを作成
        cssPlugins = config.plugins.filter((plugin) => {
          return allowedPlugins.includes(plugin.name);
        });
      },

      // エントリーポイントのHTML
      transformIndexHtml(html) {
        // HTMLをパース
        parseContents([html]);

        // アップデート
        updateCSS(isSSR);
      },

      // モジュールの更新
      transform(code, id, options) {
        if (id.includes("/.vite/")) return;

        const ext = getExtension(id);
        if (ext === "" || ext === "css") return;

        updateCSS(options?.ssr ?? false);
      },
    },

    // 配信時
    {
      name: "@olex/vite:generate:serve",
      apply: "serve",

      async transform(code, id, options) {
        if (!isOlex(id, code)) return;

        cssModules[id] = { content: "", handled: true };

        if (!options?.ssr) {
          await server?.waitForRequestsIdle?.(id);
        }

        code = await transformWithPlugins(this, id, await compiler(code, id));
        return { code };
      },
    },

    // ビルド時
    {
      name: "@olex/vite:generate:build",
      apply: "build",

      transform(code, id) {
        if (!isOlex(id, code)) return;
        cssModules[id] = { content: code, handled: false };
      },

      async renderChunk(_code, _chunk) {
        for (let [id, file] of Object.entries(cssModules)) {
          if (file.handled) {
            continue;
          }

          let css = await compiler(file.content, id);

          await transformWithPlugins(this, id, css);

          file.handled = true;
        }
      },
    },
  ] satisfies Plugin[];
}
