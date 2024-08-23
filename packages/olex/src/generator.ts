import { version } from "../package.json";
import fs from "fs";
import postcss, { Root } from "postcss";
import { initTheme } from "./theme";
import { initLayout } from "./layout";
import { initUtilities } from "./utilities";
import { getFilePath } from "./utils/dirname";

const allowedStyles: Record<string, boolean> = {
  layouts: false,
  utilities: false,
};

function insertCss(key: string) {
  const filePath = getFilePath(`../${key}`);
  const file = fs.readFileSync(filePath, "utf8");
  return postcss.parse(file, { from: filePath });
}

export async function generateCss(root: Root): Promise<Root> {
  // 先頭のコメント
  root.prepend(postcss.parse(`/*! Olexcss v${version} | MIT License */`));

  // 有効チェック
  root.walkAtRules((atrule) => {
    Object.keys(allowedStyles).forEach((key) => {
      if (atrule.name === "olex" && atrule.params === key) {
        allowedStyles[key] = true; // 😍
      }
    });
  });

  // Themes
  initTheme(root);

  // Layout
  await initLayout(root);

  // Utilities
  await initUtilities(root);

  // ==========================
  // Layout
  // =============================

  // root.append(await initLayout());
  // const olexLayout = insertCss(styles.layouts);

  return root;
}
