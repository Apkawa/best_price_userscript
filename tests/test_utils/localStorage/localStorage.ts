type Store = {[key: string]: string};

export const intoString = (value: unknown): string => {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-return,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-call
  */
  return (value as any)?.toString?.() ?? '';
};

class LocalStorageMock {
  store: Store;
  length: number;

  constructor() {
    this.store = {};
    this.length = 0;
  }

  key(n: number): string | null {
    if (typeof n === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'key' " +
          "on 'Storage': 1 argument required, but only 0 present.",
      );
    }

    if (n >= Object.keys(this.store).length) {
      return null;
    }

    return Object.keys(this.store)[n];
  }

  getItem(key: string): string | null {
    if (!Object.keys(this.store).includes(key)) {
      return null;
    }

    return this.store[key];
  }

  setItem(key: string, value: unknown): void {
    if (typeof key === 'undefined' && typeof value === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'setItem' " +
          "on 'Storage': 2 arguments required, but only 0 present.",
      );
    }

    if (typeof value === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'setItem' " +
          "on 'Storage': 2 arguments required, but only 1 present.",
      );
    }

    if (!key) return undefined;

    this.store[key] = intoString(value);
    this.length = Object.keys(this.store).length;

    return undefined;
  }

  removeItem(key: string): undefined {
    if (typeof key === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'removeItem' " +
          "on 'Storage': 1 argument required, but only 0 present.",
      );
    }

    delete this.store[key];
    this.length = Object.keys(this.store).length;
    return undefined;
  }

  clear(): undefined {
    this.store = {};
    this.length = 0;

    return undefined;
  }
}

export const getLocalStorageMock = (): Storage => {
  return new LocalStorageMock() as Storage;
};
