const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(relativePath) {
  return fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");
}

test("auth page contains both accessible authentication forms", () => {
  const html = read("auth.html");

  assert.match(html, /id="login-form"/);
  assert.match(html, /id="register-form"/);
  assert.match(html, /id="auth-alert"[^>]*aria-live="polite"/);
  assert.match(html, /name="confirmPassword"/);
});

test("chat page provides the conversation sidebar and chat composer", () => {
  const html = read("chat.html");

  assert.match(html, /id="conversation-list"/);
  assert.match(html, /id="new-chat-button"/);
  assert.match(html, /id="message-list"/);
  assert.match(html, /id="chat-input"/);
  assert.match(html, /id="logout-button"/);
});

test("both pages load classic scripts in dependency order", () => {
  const auth = read("auth.html");
  const chat = read("chat.html");

  assert.ok(auth.indexOf("mock-data.js") < auth.indexOf("storage.js"));
  assert.ok(auth.indexOf("storage.js") < auth.indexOf("auth.js"));
  assert.ok(chat.indexOf("mock-data.js") < chat.indexOf("storage.js"));
  assert.ok(chat.indexOf("storage.js") < chat.indexOf("chat.js"));
  assert.doesNotMatch(auth, /type="module"/);
  assert.doesNotMatch(chat, /type="module"/);
});

test("stylesheet defines the approved palette and responsive accessibility rules", () => {
  const css = read("assets/css/styles.css");

  ["#F9F8F6", "#EFE9E3", "#D9CFC7", "#C9B59C", "#2F2A26"].forEach(
    (color) => assert.match(css.toUpperCase(), new RegExp(color.toUpperCase())),
  );
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});
