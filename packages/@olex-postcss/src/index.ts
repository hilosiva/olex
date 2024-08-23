import path from "path";
import postcss, { type AcceptedPlugin, type PluginCreator } from "postcss";
import postcssImport from "postcss-import";
import { compiler, searchFiles, parseFiles } from "olex";

interface PluginOptions {
  // オプションの型を定義
  minViewPort?: number;
  maxViewPort?: number;
  [key: string]: any;
}

function olex(opts: PluginOptions = {}): AcceptedPlugin {
  return {
    postcssPlugin: "@olex/postcss",
    plugins: [
      postcssImport(),
      {
        postcssPlugin: "olex",
        async Once(root: any, { result }: any) {},
        async OnceExit(root: any, { result }: any) {
          const { from, to } = result.opts;

          let inputFile = result.opts.from ?? "";
          let inputBasePath = path.dirname(path.resolve(inputFile));

          const files = await searchFiles();

          const attributes = await parseFiles(files);

          files.forEach((file) => {
            result.messages.push({
              type: "dependency",
              plugin: "@olex/postcss",
              file: file,
              parent: result.opts.from,
            });
          });

          result.messages.push({
            type: "dir-dependency",
            plugin: "@olex/postcss",
            dir: opts.base ?? process.cwd(),
            glob: "**/*.{html,css}", // ファイルから取得した形式に変更すること
            parent: result.opts.from,
          });

          const compileRoot = await compiler(root.toString(), from);

          if (compileRoot) {
            root.removeAll();
            root.prepend(postcss.parse(compileRoot, { from }));
          }
        },
      },
    ],
  };
}

olex.postcss = true;

module.exports = olex as PluginCreator<PluginOptions>;
