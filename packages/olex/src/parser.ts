import fs from "fs/promises";
import fg from "fast-glob";
import { Parser } from "htmlparser2";
import config from "./config";
import { Cache } from "./cache";

//  非同期でファイルを読み込む関数
export async function readHtmlFiles(filePaths: string[]): Promise<string[]> {
  const fileContents = await Promise.all(
    filePaths.map(async (filePath) => {
      return await fs.readFile(filePath, "utf8");
    })
  );
  return fileContents;
}

//  HTMLをパースしてMapに格納する関数
export function parseHtml(htmlContents: string[]): Map<string, string[]> {
  const attributesMap = new Map<string, Set<string>>();

  for (const htmlContent of htmlContents) {
    const parser = new Parser(
      {
        onopentag(name, attribs) {
          // data-属性の収集
          for (const attr in attribs) {
            if (attr.startsWith("data-")) {
              if (!attributesMap.has(attr)) {
                attributesMap.set(attr, new Set());
              }
              attributesMap.get(attr)?.add(attribs[attr]);
            }

            // class属性の収集
            if (attr === "class") {
              if (!attributesMap.has("class")) {
                attributesMap.set("class", new Set());
              }
              attribs[attr].split(/\s+/).forEach((cls) => attributesMap.get("class")?.add(cls));
            }

            // style属性の収集
            if (attr === "style") {
              if (!attributesMap.has("style")) {
                attributesMap.set("style", new Set());
              }
              attributesMap.get("style")?.add(attribs[attr]);
            }
          }
        },
      },
      { decodeEntities: true }
    );

    parser.write(htmlContent);
    parser.end();
  }

  // SetをArrayに変換
  const finalMap = new Map<string, string[]>();
  for (const [key, value] of attributesMap.entries()) {
    finalMap.set(key, Array.from(value));
  }

  return finalMap;
}

// HTMLファイルを取得する関数
export async function getHtmlFiles(patterns: string[] | string, cwd = process.cwd()) {
  try {
    // fast-glob を使用してパターンに一致するファイルを取得
    const files = await fg(patterns, { cwd });
    return files;
  } catch (error) {
    console.error("Error while fetching HTML files:", error);
    throw error;
  }
}

// 属性を取得
export async function getAttrbutes(htmlFilePaths: string[] | string) {
  const htmlFiles = await getHtmlFiles(htmlFilePaths);
  const htmlContents = await readHtmlFiles(htmlFiles);
  return parseHtml(htmlContents);
}

// 初回のキャッシュを行う
export const attibutesCache = new Cache();

// キャッシュ
export async function getCacheAttributes(): Promise<Map<string, string[]>> {
  const cachedAttributes = attibutesCache.getCache();

  if (cachedAttributes) {
    return cachedAttributes;
  }

  const attributes = await getAttrbutes(config.content);
  attibutesCache.setCache(attributes);
  return attributes;
}

// getCacheAttributes();
