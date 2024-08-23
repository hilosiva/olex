export class Cache {
  private cache: Map<string, string[]> | null = null;

  constructor() {
    this.cache = null;
  }

  setCache(cacheContent: Map<string, string[]>) {
    this.cache = cacheContent;
  }

  getCache(): Map<string, string[]> | null {
    return this.cache;
  }

  clearCache() {
    this.cache = null;
  }

  hasCache(): boolean {
    return this.cache !== null;
  }
}
