const test = require("node:test");
const assert = require("node:assert/strict");
const { createLocalStorage, loadScripts } = require("./test-utils");

const scripts = [
  "mock_data/mock-data.js",
  "assets/js/storage.js",
  "assets/js/chat.js",
];

function loadChat() {
  return loadScripts(scripts, { localStorage: createLocalStorage() });
}

test("creates a conversation with the welcome message", () => {
  const { ChatService, MOCK_DATA } = loadChat();

  const conversation = ChatService.createConversation("an@example.com");

  assert.equal(conversation.userEmail, "an@example.com");
  assert.equal(conversation.title, "Cuộc trò chuyện mới");
  assert.equal(conversation.messages.length, 1);
  assert.equal(conversation.messages[0].content, MOCK_DATA.welcomeMessage);
});

test("uses the first 32 characters of the first question as the title", () => {
  const { ChatService } = loadChat();
  const conversation = ChatService.createConversation("an@example.com");
  const question = "Hãy giúp tôi xây dựng lộ trình học AI thực chiến";

  const updated = ChatService.sendUserMessage(
    conversation.id,
    "an@example.com",
    question,
  );

  assert.equal(updated.title, question.slice(0, 32));
  assert.equal(updated.messages.at(-1).content, question);
  assert.equal(updated.messages.at(-1).role, "user");
});

test("ignores an empty user message", () => {
  const { ChatService } = loadChat();
  const conversation = ChatService.createConversation("an@example.com");

  const result = ChatService.sendUserMessage(
    conversation.id,
    "an@example.com",
    "   \n ",
  );

  assert.equal(result, null);
  assert.equal(
    ChatService.getConversation(conversation.id, "an@example.com").messages.length,
    1,
  );
});

test("appends the fixed bot reply", () => {
  const { ChatService, MOCK_DATA } = loadChat();
  const conversation = ChatService.createConversation("an@example.com");

  const updated = ChatService.addBotReply(conversation.id, "an@example.com");

  assert.equal(updated.messages.at(-1).role, "assistant");
  assert.equal(updated.messages.at(-1).content, MOCK_DATA.botReply);
});

test("keeps conversations isolated by account", () => {
  const { ChatService } = loadChat();
  ChatService.createConversation("an@example.com");
  ChatService.createConversation("binh@example.com");

  const anConversations = ChatService.getUserConversations("an@example.com");
  const binhConversations = ChatService.getUserConversations("binh@example.com");

  assert.equal(anConversations.length, 1);
  assert.equal(binhConversations.length, 1);
  assert.equal(anConversations[0].userEmail, "an@example.com");
  assert.equal(binhConversations[0].userEmail, "binh@example.com");
});

test("does not allow one account to update another account's conversation", () => {
  const { ChatService } = loadChat();
  const conversation = ChatService.createConversation("an@example.com");

  const result = ChatService.sendUserMessage(
    conversation.id,
    "binh@example.com",
    "Tin nhắn không hợp lệ",
  );

  assert.equal(result, null);
});
