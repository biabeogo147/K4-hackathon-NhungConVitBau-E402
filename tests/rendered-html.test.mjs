import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the auth gate and keeps the assistant experience available", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AI Thực Chiến — Trợ lý tìm hiểu chương trình<\/title>/i);
  assert.match(html, /class="auth-shell"/);
  assert.match(html, /Đăng nhập để tiếp tục/);
  assert.match(html, /giao diện minh họa/);
  assert.doesNotMatch(html, /Lượt trả lời tiếp theo|Hai model, một luồng nhất quán/);
  assert.doesNotMatch(html, /Gemini 3\.[15] Flash Lite/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);

  const [authSource, chatSource] = await Promise.all([
    readFile(new URL("../app/ui/AuthWelcome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ui/ChatApp.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(authSource, /Đăng nhập để tiếp tục/);
  assert.match(authSource, /Tạo tài khoản mới/);
  assert.match(authSource, /giao diện minh họa/);
  assert.match(chatSource, /Hỏi sâu\. Hiểu đúng\. Sẵn sàng cho bước tiếp theo\./);
  assert.match(chatSource, /Kho tri thức đang dùng/);
  assert.match(chatSource, /Kiểm tra mức độ sẵn sàng/);
  assert.match(chatSource, /Tài liệu chương trình \+ nguồn công khai/);
  assert.match(chatSource, /Onboarding & hỗ trợ nền tảng/);
});

test("does not expose the private Google document as a citation URL", async () => {
  const routeSource = await readFile(
    new URL("../app/api/chat/route.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(routeSource, /docs\.google\.com/i);
  assert.match(routeSource, /kind: "program-document"/);
});

test("golden set covers hackathon risk classes and intent routing", async () => {
  const goldenSet = JSON.parse(
    await readFile(new URL("../eval/golden-set.json", import.meta.url), "utf8"),
  );
  const { getConversationGuidance } = await import(
    "../app/lib/product-intelligence.ts"
  );

  assert.equal(goldenSet.length, 24);
  assert.equal(new Set(goldenSet.map((testCase) => testCase.id)).size, 24);
  assert.ok(
    goldenSet.every(
      (testCase) =>
        typeof testCase.expectedBehavior === "string" &&
        testCase.expectedBehavior.trim().length > 0,
    ),
    "every case must define an observable expected behavior",
  );
  const coveredClasses = new Set(goldenSet.map((testCase) => testCase.class));
  for (const requiredClass of [
    "normal",
    "source-truth",
    "ambiguous",
    "authority",
    "domain-risk",
    "rare",
    "correction",
  ]) {
    assert.ok(coveredClasses.has(requiredClass), `missing ${requiredClass}`);
  }
  for (const riskClass of [
    "source-truth",
    "ambiguous",
    "authority",
    "domain-risk",
  ]) {
    assert.ok(
      goldenSet.filter((testCase) => testCase.class === riskClass).length >= 2,
      `${riskClass} must have at least two cases`,
    );
  }
  assert.equal(
    goldenSet.filter((testCase) => testCase.class === "normal").length,
    10,
  );
  assert.equal(
    goldenSet.filter((testCase) => testCase.class === "rare").length,
    4,
  );
  assert.ok(
    goldenSet.filter((testCase) =>
      testCase.origin.startsWith("source-doc-observation-"),
    ).length >= 10,
  );

  for (const testCase of goldenSet) {
    const guidance = getConversationGuidance(testCase.input, true);
    assert.equal(
      guidance.intent,
      testCase.expectedIntent,
      `${testCase.id}: ${testCase.input}`,
    );
  }
});

test("rejects malformed chat payloads without calling a model", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("api-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: "invalid" }),
    }),
    {
      GEMINI_API_KEY: "test-key",
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Thiếu lịch sử hội thoại." });
});
