console.log('Dispatching fetchMeta event with ytcfg:', window.ytcfg);

function deepMakeAllEnumerable(
  target: any, 
  seen: WeakSet<object> = new WeakSet()
): any {
  // 1. Base case: Return primitives (strings, numbers, etc.) and null as-is
  if (target === null || typeof target !== "object") {
    return target;
  }

  // 2. Prevent infinite loops from circular references
  // WeakSet only accepts objects, and we've already ruled out primitives above
  if (seen.has(target)) {
    return "[Circular Reference]"; 
  }
  seen.add(target);

  // 3. Let native objects (like Dates) pass through so JSON.stringify can handle them
  if (target instanceof Date || target instanceof RegExp) {
    return target;
  }

  // 4. Handle Arrays recursively
  if (Array.isArray(target)) {
    return target.map((item: any) => deepMakeAllEnumerable(item, seen));
  }

  // 5. Handle standard Objects recursively
  const newObj: Record<string, any> = {};
  const allKeys = Object.getOwnPropertyNames(target);

  allKeys.forEach((key: string) => {
    // Call the function on every value, attaching the result to the new object
    newObj[key] = deepMakeAllEnumerable(target[key], seen);
  });

  return newObj;
}

window.dispatchEvent(new CustomEvent('fetchMeta', {
  detail: JSON.stringify(deepMakeAllEnumerable(window.ytcfg))
}));

export {};
