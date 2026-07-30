const test = require("node:test");
const assert = require("node:assert/strict");
const { createLocalStorage, loadScripts } = require("./test-utils");

const scripts = [
  "mock_data/mock-data.js",
  "assets/js/storage.js",
  "assets/js/auth.js",
];

function loadAuth(initial = {}) {
  return loadScripts(scripts, { localStorage: createLocalStorage(initial) });
}

test("provides the agreed demo account and chatbot copy", () => {
  const { MOCK_DATA } = loadAuth();

  assert.equal(MOCK_DATA.demoUser.email, "hocvien@example.com");
  assert.equal(MOCK_DATA.demoUser.password, "123456");
  assert.match(MOCK_DATA.botReply, /Cảm ơn bạn đã đặt câu hỏi/);
});

test("rejects incomplete or invalid registration data", () => {
  const { AuthService } = loadAuth();

  assert.equal(AuthService.validateRegistration({}).field, "name");
  assert.equal(
    AuthService.validateRegistration({
      name: "An",
      email: "khong-hop-le",
      password: "123456",
      confirmPassword: "123456",
    }).field,
    "email",
  );
  assert.equal(
    AuthService.validateRegistration({
      name: "An",
      email: "an@example.com",
      password: "123",
      confirmPassword: "123",
    }).field,
    "password",
  );
  assert.equal(
    AuthService.validateRegistration({
      name: "An",
      email: "an@example.com",
      password: "123456",
      confirmPassword: "654321",
    }).field,
    "confirmPassword",
  );
});

test("rejects a duplicate email without case sensitivity", () => {
  const { AuthService } = loadAuth();

  const result = AuthService.validateRegistration({
    name: "Học viên khác",
    email: "HOCVIEN@EXAMPLE.COM",
    password: "123456",
    confirmPassword: "123456",
  });

  assert.equal(result.valid, false);
  assert.equal(result.field, "email");
});

test("logs in with the demo account and persists a session", () => {
  const { AuthService, AIStorage, MOCK_DATA } = loadAuth();

  const result = AuthService.login(" HOCVIEN@example.com ", "123456");

  assert.equal(result.ok, true);
  assert.equal(result.session.email, "hocvien@example.com");
  assert.equal(
    AIStorage.read(MOCK_DATA.storageKeys.session, null).email,
    "hocvien@example.com",
  );
});

test("rejects incorrect login credentials", () => {
  const { AuthService } = loadAuth();

  const result = AuthService.login("hocvien@example.com", "sai-mat-khau");

  assert.equal(result.ok, false);
  assert.match(result.message, /không chính xác/i);
});

test("registers a local account and automatically logs it in", () => {
  const { AuthService, AIStorage, MOCK_DATA } = loadAuth();

  const result = AuthService.register({
    name: "Nguyễn Minh An",
    email: " An@example.com ",
    password: "abcdef",
    confirmPassword: "abcdef",
  });

  assert.equal(result.ok, true);
  assert.equal(result.session.email, "an@example.com");
  assert.equal(AIStorage.read(MOCK_DATA.storageKeys.users, []).length, 1);
});

test("logout removes only the current login session", () => {
  const { AuthService, AIStorage, MOCK_DATA } = loadAuth();
  AuthService.register({
    name: "An",
    email: "an@example.com",
    password: "abcdef",
    confirmPassword: "abcdef",
  });

  AuthService.logout();

  assert.equal(AuthService.getSession(), null);
  assert.equal(AIStorage.read(MOCK_DATA.storageKeys.users, []).length, 1);
});
