import config from "./config";
import { prefix, breakpoints } from "./theme";
import postcss, { AtRule, Root } from "postcss";
import { generateCss } from "./generator";
import { parseHtml, getHtmlFiles, readHtmlFiles, attibutesCache } from "./parser";
import prettier from "prettier";

function parseCss(css: string) {
  return postcss.parse(css);
}

function searchMediaQuery(AtRule: AtRule) {
  const regex = new RegExp(`--${prefix}(\\w+)`);
  const match = AtRule.params.match(regex);
  if (match) {
    const customMediaKey = match[0];
    const screenKey = match[1];

    if (breakpoints instanceof Map && breakpoints.has(screenKey)) {
      return {
        customMediaKey,
        screenKey,
      };
    }
  }

  return false;
}

// ドキュメントから属性マップを生成（parser.tsの内容とまとめれそう）
export function parseContents(contents: string[]) {
  const attributes = parseHtml(contents);
  attibutesCache.setCache(attributes);
  return attributes;
}

// ファイルから属性マップを作成（parser.tsの内容とまとめれそう）
export async function parseFiles(filePaths: string[]) {
  const contents = await readHtmlFiles(filePaths);
  return parseContents(contents);
}

// ファイルを探す（parser.tsの内容とまとめれそう）
export async function searchFiles(base?: string) {
  return await getHtmlFiles(config.content, base);
}

export async function compiler(css: string, from: string, to?: string) {
  const root = parseCss(css);

  // ルートのチェック
  let isOlexRoot = false;
  root.walkAtRules((atrule) => {
    if (isOlexRoot) return;

    if ((atrule.name === "import" && atrule.params === "olex") || atrule.name === "olex") {
      isOlexRoot = true; // 😍
      return;
    }
  });

  if (isOlexRoot) {
    // CSS生成
    await generateCss(root);

    // カスタムメディアの処理
    root.walkAtRules("custom-media", (atrule) => {
      const mediaQuery = searchMediaQuery(atrule);
      if (mediaQuery && breakpoints instanceof Map) {
        const minWidthValue = breakpoints.get(mediaQuery.screenKey);
        const mediaValue = `screen and (width >= ${minWidthValue})`;
        atrule.params = `${mediaQuery.customMediaKey} ${mediaValue}`;
        atrule.remove();
      }
    });
  }

  // 既存のCSSファイルを含むカスタムメディアをメディアクエリに置き換え
  root.walkAtRules("media", (atrule) => {
    const mediaQuery = searchMediaQuery(atrule);
    if (mediaQuery && breakpoints instanceof Map) {
      const minWidthValue = breakpoints.get(mediaQuery.screenKey);
      const mediaValue = `screen and (width >= ${minWidthValue})`;
      atrule.params = mediaValue;
    }
  });

  return await prettier.format(root.toString(), { parser: "css" });
}
