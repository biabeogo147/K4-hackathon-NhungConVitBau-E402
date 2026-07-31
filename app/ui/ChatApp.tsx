"use client";

import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthWelcome } from "./AuthWelcome";

type Source = {
  id: string;
  title: string;
  audience: string;
  freshness: string;
  kind?: "program-document" | "official-web" | "community-web";
  trustLevel?: "grounded" | "advisory";
  disclaimer?: string;
  url?: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  suggestions?: string[];
  needsHumanHelp?: boolean;
  timeSensitive?: boolean;
  needsClarification?: boolean;
  hasAdvisorySources?: boolean;
  decision?: {
    intent: string;
    contextTurnsUsed?: number;
    toolMode?: "forced" | "automatic";
    toolStatus:
      | "official-web"
      | "public-web"
      | "official-web-unavailable"
      | "program-knowledge"
      | "no-source";
    confidence: "supported" | "limited";
  };
  isError?: boolean;
  isStreaming?: boolean;
  retryText?: string;
};

type ChatStreamEvent =
  | {
      type: "meta";
      sources?: Source[];
      suggestions?: string[];
      needsHumanHelp?: boolean;
      timeSensitive?: boolean;
      needsClarification?: boolean;
      hasAdvisorySources?: boolean;
      decision?: Message["decision"];
    }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

type ReadinessAnswers = {
  availability: string;
  coding: string;
  foundation: string;
  portfolio: string;
};

const STORAGE_KEY = "ai-thuc-chien-chat-v5";
const CONTACT_EMAIL = "AIThucchien@vinuni.edu.vn";
const SUGGESTIONS = [
  "Chương trình phù hợp với ai?",
  "Lộ trình học và dự án thực chiến gồm những gì?",
  "Sinh viên trái ngành có thể tham gia không?",
  "Tôi cần chuẩn bị gì trước khi đăng ký?",
];
const SOURCE_CATALOG = [
  "Nội quy thi vòng 2",
  "Sổ tay học viên",
  "Thông tin tuyển sinh",
  "Onboarding & hỗ trợ nền tảng",
  "Nguồn chính thức VinUni/Vingroup",
];
const EMPTY_READINESS: ReadinessAnswers = {
  availability: "",
  coding: "",
  foundation: "",
  portfolio: "",
};

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[Nguồn \d+\])/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (/^\[Nguồn \d+\]$/.test(part)) {
      return (
        <span className="inline-citation" key={index}>
          {part}
        </span>
      );
    }
    return part;
  });
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="formatted-message">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));
        if (isList) {
          return (
            <ul key={index}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInline(line.replace(/^\s*[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block.replace(/^#{1,4}\s+/, ""))}</p>;
      })}
    </div>
  );
}

function scoreReadiness(answers: ReadinessAnswers) {
  const score =
    Number(answers.availability) +
    Number(answers.coding) +
    Number(answers.foundation) +
    Number(answers.portfolio);
  if (score >= 75) {
    return {
      score,
      label: "Sẵn sàng tốt",
      plan: "Tập trung tìm hiểu quy trình tuyển chọn, hoàn thiện CV/portfolio và xác nhận khả năng tham gia chương trình.",
    };
  }
  if (score >= 50) {
    return {
      score,
      label: "Đang trên đà sẵn sàng",
      plan: "Dành 2 tuần củng cố Python, toán nền tảng và hoàn thiện một dự án nhỏ có thể trình bày.",
    };
  }
  return {
    score,
    label: "Cần củng cố nền tảng",
    plan: "Dành 4 tuần học Python cơ bản, ôn tư duy dữ liệu và tìm hiểu kỹ yêu cầu đầu vào trước khi đăng ký.",
  };
}

export function ChatApp() {
  const [hasEntered, setHasEntered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [readiness, setReadiness] = useState(EMPTY_READINESS);
  const [readinessResult, setReadinessResult] =
    useState<ReturnType<typeof scoreReadiness>>();
  const endRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);
  const requestController = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved) as Message[]);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    const historyWithoutErrors = messages.filter((message) => !message.isError);
    const nextMessages = [...historyWithoutErrors, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setIsWaitingForResponse(true);
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 50_000);

    let streamingMessageId: string | undefined;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Không thể nhận câu trả lời lúc này.");
      }
      if (!response.body) throw new Error("Trình duyệt không nhận được luồng trả lời.");

      streamingMessageId = crypto.randomUUID();
      const responseMessageId = streamingMessageId;
      setMessages((current) => [
        ...current,
        {
          id: responseMessageId,
          role: "assistant",
          content: "",
          isStreaming: true,
        },
      ]);
      setIsWaitingForResponse(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedText = false;

      const applyEvent = (event: ChatStreamEvent) => {
        if (event.type === "error") throw new Error(event.message);
        if (event.type === "delta" && event.text) {
          receivedText = true;
          setMessages((current) =>
            current.map((message) =>
              message.id === responseMessageId
                ? { ...message, content: message.content + event.text }
                : message,
            ),
          );
        }
        if (event.type === "meta") {
          setMessages((current) =>
            current.map((message) =>
              message.id === responseMessageId
                ? {
                    ...message,
                    sources: event.sources,
                    suggestions: event.suggestions,
                    needsHumanHelp: event.needsHumanHelp,
                    timeSensitive: event.timeSensitive,
                    needsClarification: event.needsClarification,
                    hasAdvisorySources: event.hasAdvisorySources,
                    decision: event.decision,
                  }
                : message,
            ),
          );
        }
        if (event.type === "done") {
          setMessages((current) =>
            current.map((message) =>
              message.id === responseMessageId
                ? { ...message, isStreaming: false }
                : message,
            ),
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim()) applyEvent(JSON.parse(line) as ChatStreamEvent);
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) {
        applyEvent(JSON.parse(buffer) as ChatStreamEvent);
      }
      if (!receivedText) throw new Error("Dịch vụ không trả về nội dung.");
    } catch (error) {
      setMessages((current) => [
        ...current.filter((message) => message.id !== streamingMessageId),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof DOMException && error.name === "AbortError"
              ? "Yêu cầu mất quá nhiều thời gian. Hãy thử lại hoặc đặt câu hỏi ngắn hơn."
              : error instanceof Error
                ? error.message
                : "Có lỗi kết nối. Bạn vui lòng thử lại.",
          isError: true,
          retryText: question,
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      requestController.current = undefined;
      setIsWaitingForResponse(false);
      setIsLoading(false);
    }
  }

  function resetConversation() {
    requestController.current?.abort();
    setMessages([]);
    setInput("");
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const readinessComplete = Object.values(readiness).every(Boolean);

  if (!hasEntered) {
    return <AuthWelcome onContinue={() => setHasEntered(true)} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            AI
          </div>
          <div className="brand-copy">
            <strong>AI Thực Chiến</strong>
            <span>Trợ lý dành cho người đang tìm hiểu chương trình</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="status-pill">
            <span className="status-dot" />
            Tài liệu chương trình + nguồn công khai
          </div>
          {messages.length > 0 && (
            <button className="ghost-button" onClick={resetConversation} type="button">
              Cuộc trò chuyện mới
            </button>
          )}
        </div>
      </header>

      <section className="workspace">
        <article className="chat-card">
          <div className="chat-heading">
            <div>
              <p className="eyebrow">Hỏi đáp chương trình</p>
              <h1>Hỏi sâu. Hiểu đúng. Sẵn sàng cho bước tiếp theo.</h1>
            </div>
          </div>

          <div className="messages" aria-live="polite" aria-busy={isLoading}>
            {messages.length === 0 ? (
              <div className="welcome">
                <div className="welcome-icon" aria-hidden="true">?</div>
                <h2>Bạn đang ở bước nào?</h2>
                <p>
                  Tìm hiểu sâu về chương trình, đối chiếu mức độ phù hợp và nhận
                  gợi ý chuẩn bị từ tài liệu chương trình cùng các trang chính thức.
                </p>
                <div className="journey-labels">
                  <span>Đang tìm hiểu</span><span>Chuẩn bị dự tuyển</span>
                  <span>Sắp tham gia</span>
                </div>
                <div className="suggestions">
                  {SUGGESTIONS.map((suggestion) => (
                    <button className="suggestion" key={suggestion}
                      onClick={() => void sendMessage(suggestion)} type="button">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, messageIndex) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <div className="avatar" aria-hidden="true">
                    {message.role === "assistant" ? "AI" : "Bạn"}
                  </div>
                  <div className="message-content">
                    <div
                      className={`bubble ${
                        message.isError ? "error-text" : ""
                      } ${message.isStreaming ? "streaming" : ""}`}
                    >
                      <FormattedMessage content={message.content} />
                    </div>
                    {message.role === "assistant" && !message.isError && (
                      <>
                        {message.timeSensitive && (
                          <p className="freshness-warning">
                            Lịch và thông tin theo khóa có thể thay đổi — hãy mở
                            nguồn bên dưới để xác minh ngày cập nhật.
                          </p>
                        )}
                        {message.hasAdvisorySources && (
                          <p className="source-disclaimer">
                            Nguồn mạng xã hội hoặc nguồn công khai không chính
                            thức có thể không chính xác và chỉ nên tham khảo.
                            Hãy ưu tiên tài liệu chương trình và nguồn chính
                            thức khi ra quyết định.
                          </p>
                        )}
                        {message.decision && (
                          <div className="decision-trace">
                            <span>
                              Ngữ cảnh: {message.decision.contextTurnsUsed || 1}
                              {" "}lượt gần nhất
                            </span>
                            <span>
                              {message.decision.toolStatus === "official-web"
                                ? message.decision.toolMode === "forced"
                                  ? "Đã bắt buộc gọi công cụ web"
                                  : "Đã kiểm tra nguồn công khai"
                                : message.decision.toolStatus === "public-web"
                                  ? "Đã tìm nguồn công khai để tham khảo"
                                : message.decision.toolStatus ===
                                    "official-web-unavailable"
                                  ? message.decision.toolMode === "forced"
                                    ? "Đã gọi tool nhưng chưa có nguồn phù hợp"
                                    : "Chưa xác minh được nguồn công khai"
                                  : message.decision.toolStatus ===
                                      "program-knowledge"
                                    ? "Đã tra cứu kho chương trình"
                                    : "Không tìm thấy nguồn phù hợp"}
                            </span>
                            <span
                              className={
                                message.decision.confidence === "supported"
                                  ? "supported"
                                  : "limited"
                              }
                            >
                              {message.decision.confidence === "supported"
                                ? "Có căn cứ"
                                : "Cần xác minh"}
                            </span>
                          </div>
                        )}
                        <div className="bubble-meta">
                          {message.sources?.map((source, index) =>
                            source.kind === "official-web" && source.url ? (
                              <a className="source-badge official"
                                href={source.url} key={`${source.id}-${index}`}
                                rel="noreferrer" target="_blank"
                                title={`Website công khai · ${source.freshness}`}>
                                Chính thức {index + 1}: {source.title} ↗
                              </a>
                            ) : source.kind === "community-web" && source.url ? (
                              <a className="source-badge advisory"
                                href={source.url} key={`${source.id}-${index}`}
                                rel="noreferrer" target="_blank"
                                title={source.disclaimer ||
                                  "Nguồn công khai chỉ nên tham khảo"}>
                                Tham khảo {index + 1}: {source.title} ↗
                              </a>
                            ) : (
                              <span className="source-badge internal"
                                key={`${source.id}-${index}`}
                                title={`Tài liệu chương trình có căn cứ · ${source.freshness}`}>
                                Tài liệu {index + 1}: {source.title}
                              </span>
                            ),
                          )}
                        </div>
                        {message.needsHumanHelp && (
                          <div className="handoff-card">
                            <strong>Cần người phụ trách xác nhận?</strong>
                            <span>Gửi email cho Ban Tổ chức để nhận thông tin chính thức hoặc tư vấn thêm.</span>
                            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Cần tư vấn chương trình AI Thực Chiến")}`}>
                              Liên hệ Ban Tổ chức
                            </a>
                          </div>
                        )}
                        {messageIndex === messages.length - 1 &&
                          message.suggestions?.length ? (
                          <div className="follow-ups" aria-label="Câu hỏi tiếp theo">
                            {message.suggestions.map((suggestion) => (
                              <button key={suggestion} onClick={() => void sendMessage(suggestion)}
                                type="button">{suggestion}</button>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                    {message.isError && message.retryText && (
                      <button className="retry-button"
                        onClick={() => void sendMessage(message.retryText as string)}
                        type="button">Thử lại</button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && isWaitingForResponse && (
              <div className="message assistant">
                <div className="avatar" aria-hidden="true">AI</div>
                <div className="bubble typing" aria-label="Đang tìm và soạn câu trả lời">
                  <span /><span /><span />
                  <small>Đang tra cứu nguồn phù hợp</small>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="composer-area" onSubmit={handleSubmit}>
            <div className="composer">
              <textarea aria-label="Câu hỏi của bạn" disabled={isLoading}
                maxLength={5000} onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ví dụ: Sinh viên trái ngành nên chuẩn bị gì trước khi đăng ký?"
                rows={1} value={input} />
              <button aria-label="Gửi câu hỏi" className="send-button"
                disabled={!input.trim() || isLoading} type="submit">↑</button>
            </div>
            <p className="composer-hint">
              Enter để gửi · Không gửi CCCD, OTP hoặc thông tin nhạy cảm
            </p>
          </form>
        </article>

        <aside className="sidebar">
          <div className="side-card readiness-card">
            <p className="eyebrow">Công cụ cá nhân hóa</p>
            <h3>Kiểm tra mức độ sẵn sàng</h3>
            <p>Đánh giá nhanh để nhận gợi ý chuẩn bị phù hợp. Kết quả chỉ mang tính định hướng, không phải kết quả tuyển chọn.</p>
            <div className="readiness-form">
              <label>Khả năng dành thời gian cho chương trình
                <select value={readiness.availability}
                  onChange={(event) => setReadiness({ ...readiness, availability: event.target.value })}>
                  <option value="">Chọn một phương án</option>
                  <option value="35">Sẵn sàng</option><option value="20">Cần sắp xếp thêm</option>
                  <option value="5">Chưa thể</option>
                </select>
              </label>
              <label>Nền tảng lập trình
                <select value={readiness.coding}
                  onChange={(event) => setReadiness({ ...readiness, coding: event.target.value })}>
                  <option value="">Chọn mức độ</option>
                  <option value="25">Tự làm được dự án nhỏ</option><option value="15">Biết cơ bản</option>
                  <option value="5">Chưa học</option>
                </select>
              </label>
              <label>Toán và tư duy dữ liệu
                <select value={readiness.foundation}
                  onChange={(event) => setReadiness({ ...readiness, foundation: event.target.value })}>
                  <option value="">Chọn mức độ</option>
                  <option value="25">Khá vững</option><option value="15">Biết cơ bản</option>
                  <option value="5">Cần học lại</option>
                </select>
              </label>
              <label>CV hoặc portfolio
                <select value={readiness.portfolio}
                  onChange={(event) => setReadiness({ ...readiness, portfolio: event.target.value })}>
                  <option value="">Chọn trạng thái</option>
                  <option value="15">Đã sẵn sàng</option><option value="8">Đang hoàn thiện</option>
                  <option value="0">Chưa có</option>
                </select>
              </label>
              <button disabled={!readinessComplete}
                onClick={() => setReadinessResult(scoreReadiness(readiness))}
                type="button">Xem kết quả</button>
            </div>
            {readinessResult && (
              <div className="readiness-result" role="status" aria-live="polite">
                <span>{readinessResult.score}/100</span>
                <strong>{readinessResult.label}</strong>
                <p>{readinessResult.plan}</p>
                <button onClick={() => void sendMessage(
                  `Tôi tự đánh giá ${readinessResult.score}/100: ${readinessResult.label}. ${readinessResult.plan} Hãy giúp tôi lập lộ trình chuẩn bị cá nhân hóa dựa trên tài liệu chương trình.`
                )} type="button">Nhờ trợ lý lập lộ trình</button>
              </div>
            )}
          </div>

          <div className="side-card">
            <h3>Kho tri thức đang dùng</h3>
            <p>Tài liệu tham chiếu của chương trình được bổ sung bằng website công khai của VinUni/Vingroup khi cần thông tin mới.</p>
            <div className="source-list">
              {SOURCE_CATALOG.map((source, index) => (
                <div className="source-item" key={source}>
                  <span className="source-number">0{index + 1}</span>{source}
                </div>
              ))}
            </div>
          </div>

          <div className="side-card privacy-note">
            <h3>Không chắc chắn? AI sẽ nói rõ.</h3>
            <p>
              Với lịch, địa điểm hoặc chính sách theo khóa, hãy xác minh lại
              từ nguồn dẫn hoặc email {CONTACT_EMAIL}.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
