type AnyObject = Record<string, any>;

export default function deepMerge<T extends AnyObject>(target: T, source: AnyObject): T {
  if (typeof target !== "object" || typeof source !== "object" || target === null || source === null) {
    return source as T;
  }

  const keys = Object.keys(source) as (keyof AnyObject)[];

  for (const key of keys) {
    if (!(key in target)) {
      (target as AnyObject)[key] = source[key];
    } else if (typeof (target as AnyObject)[key] === "object" && typeof source[key] === "object") {
      (target as AnyObject)[key] = deepMerge(
        (target as AnyObject)[key],
        source[key]
      ) as T[keyof T];
    } else {
      (target as AnyObject)[key] = source[key];
    }
  }

  return target;
}
