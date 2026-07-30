const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    snapshot() {
      return Object.fromEntries(values.entries());
    },
  };
}

function loadScripts(relativePaths, extras = {}) {
  const localStorage = extras.localStorage || createLocalStorage();
  const context = {
    console,
    Date,
    JSON,
    Math,
    setTimeout,
    clearTimeout,
    localStorage,
    ...extras,
  };
  context.window = context;
  vm.createContext(context);

  relativePaths.forEach((relativePath) => {
    const filename = path.resolve(__dirname, "..", relativePath);
    const source = fs.readFileSync(filename, "utf8");
    vm.runInContext(source, context, { filename });
  });

  return context;
}

module.exports = { createLocalStorage, loadScripts };
