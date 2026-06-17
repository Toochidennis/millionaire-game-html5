import localforage from "localforage";

const db = localforage.createInstance({ name: "trivia-millionaire", storeName: "cache" });

export const cache = {
  get: <T>(k: string) => db.getItem<T>(k),
  set: <T>(k: string, v: T) => db.setItem(k, v),
  remove: (k: string) => db.removeItem(k),
};
