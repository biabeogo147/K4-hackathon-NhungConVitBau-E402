const test = require("node:test");
const assert = require("node:assert/strict");
const { createLocalStorage, loadScripts } = require("./test-utils");

test("reads and writes JSON values", () => {
  const localStorage = createLocalStorage();
  const { AIStorage } = loadScripts(["assets/js/storage.js"], { localStorage });

  AIStorage.write("profile", { name: "An" });

  assert.deepEqual(AIStorage.read("profile", {}), { name: "An" });
});

test("replaces malformed JSON with the safe fallback", () => {
  const localStorage = createLocalStorage({ broken: "{not-json" });
  const { AIStorage } = loadScripts(["assets/js/storage.js"], { localStorage });

  const value = AIStorage.read("broken", []);

  assert.deepEqual(value, []);
  assert.equal(localStorage.getItem("broken"), "[]");
});

test("removes stored values", () => {
  const localStorage = createLocalStorage({ session: '{"id":"1"}' });
  const { AIStorage } = loadScripts(["assets/js/storage.js"], { localStorage });

  AIStorage.remove("session");

  assert.equal(localStorage.getItem("session"), null);
});
