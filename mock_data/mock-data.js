(function () {
  "use strict";

  window.MOCK_DATA = Object.freeze({
    appName: "Trợ lý AI Thực chiến",
    demoUser: Object.freeze({
      id: "demo-user",
      name: "Học viên Demo",
      email: "hocvien@example.com",
      password: "123456",
    }),
    welcomeMessage:
      "Xin chào! Mình là Trợ lý AI Thực chiến. Bạn có thể đặt câu hỏi để bắt đầu cuộc trò chuyện.",
    botReply:
      "Cảm ơn bạn đã đặt câu hỏi. Hiện tại Trợ lý AI Thực chiến đang trong quá trình hoàn thiện và sẽ sớm hỗ trợ bạn tốt hơn.",
    storageKeys: Object.freeze({
      users: "ai_agent_users",
      session: "ai_agent_session",
      conversations: "ai_agent_conversations",
    }),
  });
})();
