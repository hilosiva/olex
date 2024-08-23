import chokidar from "chokidar";
import fs from "fs";
import { attibutesCache } from "./parser";

export class Watcher {
  private paths: string | string[];
  private from: string | null;
  private to?: string | undefined;
  private isWatch: boolean;

  constructor(content: string | string[], from: string, to?: string) {
    this.paths = content;
    this.from = from;
    this.to = to;

    this.isWatch = false;

    this.start();
  }

  start() {
    if (!this.isWatch) {
      const watcher = chokidar.watch(this.paths, {
        persistent: true,
      });

      // ファイルが変更された時に実行する処理
      watcher.on("change", async (path) => {
        if (this.from) {
          const cssFile = fs.readFileSync(this.from, "utf-8");

          attibutesCache.clearCache();

          fs.writeFileSync(this.to ? this.to : this.from, cssFile);
        }
      });
    }
    this.isWatch = true;
  }

  setFrom(from: string) {
    this.from = from;
  }

  setTo(to: string) {
    this.to = to;
  }
}
