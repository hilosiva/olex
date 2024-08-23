import { fileURLToPath } from "url";
import path from "path";

// デュアルパッケージ用の __dirname
export const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export function getFilePath(filePath: string) {
  return path.resolve(dirname, filePath);
}
