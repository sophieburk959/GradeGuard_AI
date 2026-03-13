function createInMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
}

export async function register() {
  if (typeof window !== "undefined") {
    return;
  }

  const maybeStorage = (globalThis as { localStorage?: unknown }).localStorage;
  const valid =
    maybeStorage &&
    typeof maybeStorage === "object" &&
    "getItem" in maybeStorage &&
    typeof (maybeStorage as Storage).getItem === "function";

  if (valid) {
    return;
  }

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: createInMemoryStorage()
  });
}
