import fs from "fs";
import postcss, { AtRule, decl, Root } from "postcss";
import { getFilePath } from "./utils/dirname";

type Themes = Map<string, Map<string, string> | string>;

export let themes: Themes;
export let userThemes: Themes;
export let defaultThemes: Themes;
export let prefix: string;
export let breakpoints: Map<string, string> | string;

export function initTheme(root: Root) {
  // テーマの設定
  themes = createTheme(root);
  prefix = themes.has("prefix") && themes.get("prefix") !== "" ? `${themes.get("prefix")}-` : `${themes.get("prefix")}`;
  if (themes.has("breakpoint")) breakpoints = themes.get("breakpoint")!;

  // ルート
  const themeRoot = postcss.root();

  // カスタムメディア
  if (breakpoints instanceof Map) {
    breakpoints.forEach((value, key) => {
      themeRoot.append(postcss.atRule({ name: "custom-media", params: `--${prefix}${key} screen and (width >= ${value})` }));
    });
  }

  // ルール
  const rootRule = postcss.rule({ selector: ":root" });

  // カスタムプロパティ
  themes.forEach((topValue, topKey) => {
    if (topKey === "prefix" || topKey === "breakpoint") {
      return;
    }

    rootRule.append(postcss.comment({ text: `${capitalize(topKey.replace(/-/g, " "))}` }));

    if (topValue instanceof Map) {
      topValue.forEach((value, key) => {
        const propertyName = `${prefix}${topKey}-${key}`;
        rootRule.append(postcss.decl({ prop: `--${propertyName}`, value: addPrefix(value) }));
      });
    } else {
      const propertyName = `${prefix}${topKey}`;
      rootRule.append(postcss.decl({ prop: `--${propertyName}`, value: addPrefix(topValue) }));
    }
  });

  // Viewport
  rootRule.insertBefore(0, "\n");
  rootRule.append(postcss.comment({ text: `Viewpoint` }));

  const designWidths = themes.get("design-width");
  if (designWidths instanceof Map) {
    let isFirst = true;
    designWidths.forEach((value, key) => {
      const breakpoint = breakpoints instanceof Map && breakpoints.has(key) ? breakpoints.get(key) : false;
      if (!breakpoint) return;

      if (isFirst) {
        rootRule.append(postcss.decl({ prop: `--${prefix}design-viewport`, value: `var(--${prefix}design-width-${key})` }));
        isFirst = false;
        return;
      }

      if (breakpoints instanceof Map && breakpoints.has(key)) {
        const mediaRule = postcss.atRule({ name: "media", params: `(--${prefix}${key})` });

        mediaRule.append(postcss.decl({ prop: `--${prefix}design-viewport`, value: `var(--${prefix}design-width-${key})` }));

        rootRule.append(mediaRule);
        return;
      }
    });
  }

  themeRoot.append(rootRule);

  let layer = false;
  root.walkAtRules("layer", (atRule) => {
    if (!layer && atRule.params === "theme") {
      atRule.prepend(themeRoot);
      layer = true; // 😍
      return;
    }
  });
}

function createTheme(root: Root) {
  const themes: Themes = new Map();

  root.walkAtRules("theme", (atRule) => {
    atRule.walkDecls((decl) => {
      const prop = decl.prop.trim().replace("--", "");
      const value = decl.value.trim();

      // 最後のハイフンの位置を探す
      const index = prop.lastIndexOf("-");

      if (index !== -1) {
        const topKey = prop.substring(0, index); // 最初のキー
        const subKey = prop.substring(index + 1); // サブキー

        if (!themes.has(topKey)) {
          themes.set(topKey, new Map([[subKey, value]]));
        }

        const subValue = themes.get(topKey);

        if (typeof subValue !== "string") {
          subValue?.set(subKey, value);
        }
      } else {
        themes.set(prop, value);
      }
    });

    atRule.remove();
  });

  return themes;
}

function capitalize(str: string): string {
  return str
    .split("-") // ハイフンで分割
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // 各単語の頭文字を大文字に変換
    .join(" "); // 空白で結合
}

function addPrefix(str: string): string {
  return str.replaceAll("var(--", `var(--${prefix}`);
}

function insertCss(key: string) {
  const filePath = getFilePath(`../${key}`);
  const file = fs.readFileSync(filePath, "utf8");
  return postcss.parse(file, { from: filePath });
}
