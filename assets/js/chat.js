(function () {
  "use strict";

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function now() {
    return new Date().toISOString();
  }

  function getAllConversations() {
    return window.AIStorage.read(window.MOCK_DATA.storageKeys.conversations, []);
  }

  function saveAllConversations(conversations) {
    window.AIStorage.write(window.MOCK_DATA.storageKeys.conversations, conversations);
  }

  function createMessage(role, content) {
    return { id: createId("message"), role, content, timestamp: now() };
  }

  function getUserConversations(userEmail) {
    return getAllConversations()
      .filter((conversation) => conversation.userEmail === userEmail)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  }

  function getConversation(conversationId, userEmail) {
    return (
      getAllConversations().find(
        (conversation) =>
          conversation.id === conversationId && conversation.userEmail === userEmail,
      ) || null
    );
  }

  function createConversation(userEmail) {
    const timestamp = now();
    const conversation = {
      id: createId("conversation"),
      userEmail,
      title: "Cuộc trò chuyện mới",
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [createMessage("assistant", window.MOCK_DATA.welcomeMessage)],
    };
    saveAllConversations([...getAllConversations(), conversation]);
    return conversation;
  }

  function updateConversation(conversationId, userEmail, updater) {
    const conversations = getAllConversations();
    const index = conversations.findIndex(
      (conversation) =>
        conversation.id === conversationId && conversation.userEmail === userEmail,
    );
    if (index < 0) return null;

    const updated = updater({
      ...conversations[index],
      messages: [...conversations[index].messages],
    });
    conversations[index] = updated;
    saveAllConversations(conversations);
    return updated;
  }

  function sendUserMessage(conversationId, userEmail, rawContent) {
    const content = String(rawContent || "").trim();
    if (!content) return null;

    return updateConversation(conversationId, userEmail, (conversation) => {
      const hasUserMessage = conversation.messages.some((message) => message.role === "user");
      conversation.messages.push(createMessage("user", content));
      conversation.updatedAt = now();
      if (!hasUserMessage) conversation.title = content.slice(0, 32);
      return conversation;
    });
  }

  function addBotReply(conversationId, userEmail) {
    return updateConversation(conversationId, userEmail, (conversation) => {
      conversation.messages.push(createMessage("assistant", window.MOCK_DATA.botReply));
      conversation.updatedAt = now();
      return conversation;
    });
  }

  window.ChatService = Object.freeze({
    addBotReply,
    createConversation,
    getConversation,
    getUserConversations,
    sendUserMessage,
  });

  if (typeof document === "undefined") return;

  const state = {
    session: null,
    activeConversationId: null,
    isReplying: false,
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function redirectToAuth() {
    window.location.href = "auth.html";
  }

  function closeSidebar() {
    getElement("sidebar").classList.remove("is-open");
    getElement("sidebar-backdrop").classList.remove("is-visible");
    getElement("menu-toggle").setAttribute("aria-expanded", "false");
  }

  function openSidebar() {
    getElement("sidebar").classList.add("is-open");
    getElement("sidebar-backdrop").classList.add("is-visible");
    getElement("menu-toggle").setAttribute("aria-expanded", "true");
  }

  function renderConversationList() {
    const list = getElement("conversation-list");
    const conversations = getUserConversations(state.session.email);
    list.replaceChildren();

    conversations.forEach((conversation) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "conversation-item";
      if (conversation.id === state.activeConversationId) {
        button.classList.add("is-active");
        button.setAttribute("aria-current", "true");
      }
      button.dataset.conversationId = conversation.id;
      button.title = conversation.title;

      const icon = document.createElement("span");
      icon.className = "conversation-item__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "◇";

      const title = document.createElement("span");
      title.className = "conversation-item__title";
      title.textContent = conversation.title;

      button.append(icon, title);
      button.addEventListener("click", () => {
        state.activeConversationId = conversation.id;
        renderConversationList();
        renderMessages();
        closeSidebar();
      });
      item.append(button);
      list.append(item);
    });
  }

  function createMessageElement(message) {
    const article = document.createElement("article");
    article.className = `message message--${message.role}`;

    const avatar = document.createElement("div");
    avatar.className = "message__avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = message.role === "assistant" ? "AI" : state.session.name.charAt(0).toUpperCase();

    const bubble = document.createElement("div");
    bubble.className = "message__bubble";
    const text = document.createElement("p");
    text.textContent = message.content;
    bubble.append(text);

    article.append(avatar, bubble);
    return article;
  }

  function scrollMessagesToBottom() {
    const scroller = getElement("message-scroll");
    window.requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }

  function renderMessages() {
    const conversation = getConversation(
      state.activeConversationId,
      state.session.email,
    );
    const container = getElement("message-list");
    container.replaceChildren();
    if (!conversation) return;
    conversation.messages.forEach((message) => {
      container.append(createMessageElement(message));
    });
    scrollMessagesToBottom();
  }

  function setReplying(replying) {
    state.isReplying = replying;
    getElement("typing-indicator").hidden = !replying;
    getElement("send-button").disabled = replying;
    getElement("chat-input").setAttribute("aria-busy", String(replying));
    if (replying) scrollMessagesToBottom();
  }

  function resizeComposer() {
    const input = getElement("chat-input");
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 144)}px`;
  }

  function startNewConversation() {
    const conversation = createConversation(state.session.email);
    state.activeConversationId = conversation.id;
    renderConversationList();
    renderMessages();
    closeSidebar();
    getElement("chat-input").focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (state.isReplying) return;
    const input = getElement("chat-input");
    const conversationId = state.activeConversationId;
    const updated = sendUserMessage(conversationId, state.session.email, input.value);
    if (!updated) return;

    input.value = "";
    resizeComposer();
    renderConversationList();
    renderMessages();
    setReplying(true);

    window.setTimeout(() => {
      addBotReply(conversationId, state.session.email);
      setReplying(false);
      if (state.activeConversationId === conversationId) renderMessages();
      renderConversationList();
      input.focus();
    }, 650);
  }

  function initializeChatPage() {
    state.session = window.AIStorage.read(window.MOCK_DATA.storageKeys.session, null);
    if (!state.session) {
      redirectToAuth();
      return;
    }

    const conversations = getUserConversations(state.session.email);
    state.activeConversationId = conversations[0]?.id || createConversation(state.session.email).id;

    getElement("new-chat-button").addEventListener("click", startNewConversation);
    getElement("menu-toggle").addEventListener("click", openSidebar);
    getElement("sidebar-close").addEventListener("click", closeSidebar);
    getElement("sidebar-backdrop").addEventListener("click", closeSidebar);
    getElement("logout-button").addEventListener("click", () => {
      window.AIStorage.remove(window.MOCK_DATA.storageKeys.session);
      redirectToAuth();
    });
    getElement("chat-form").addEventListener("submit", handleSubmit);
    getElement("chat-input").addEventListener("input", resizeComposer);
    getElement("chat-input").addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        getElement("chat-form").requestSubmit();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });

    renderConversationList();
    renderMessages();
    getElement("chat-input").focus();
  }

  document.addEventListener("DOMContentLoaded", initializeChatPage);
})();
