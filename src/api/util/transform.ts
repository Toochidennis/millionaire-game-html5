const isObject = (obj: any): obj is Record<string, any> =>
  obj !== null && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date);

const isArray = (obj: any): obj is any[] => Array.isArray(obj);

export const toSnake = (obj: any): any => {
  if (isArray(obj)) {
    return obj.map(toSnake);
  }
  if (isObject(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`),
        toSnake(v)
      ])
    );
  }
  return obj;
};

export const toCamel = (obj: any): any => {
  if (isArray(obj)) {
    return obj.map(toCamel);
  }
  if (isObject(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/^_+/, "").replace(/_([a-z])/g, (_, m) => m.toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
};
