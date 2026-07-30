(function () {
  "use strict";

  function cloneFallback(fallback) {
    if (fallback === undefined) return null;
    return JSON.parse(JSON.stringify(fallback));
  }

  function read(key, fallback) {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null) return cloneFallback(fallback);

    try {
      return JSON.parse(rawValue);
    } catch (_error) {
      const safeValue = cloneFallback(fallback);
      window.localStorage.setItem(key, JSON.stringify(safeValue));
      return safeValue;
    }
  }

  function write(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function remove(key) {
    window.localStorage.removeItem(key);
  }

  window.AIStorage = Object.freeze({ read, write, remove });
})();
