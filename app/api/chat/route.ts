import { retrieveKnowledge } from "../../lib/knowledge";
import {
  getPublicWebSources,
  shouldSearchOfficialWeb,
} from "../../lib/official-tools";
import { getConversationGuidance } from "../../lib/product-intelligence";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const TOOL_CONTEXT_WINDOW_SIZE = 6;
const TOOL_CONTEXT_MESSAGE_LIMIT = 260;

const MODELS = [
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash Lite",
  },
] as const;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ChatMessage>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    candidate.content.length <= 5000
  );
}

function extractGeminiText(payload: unknown) {
  const data = payload as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

function buildToolContext(messages: ChatMessage[]) {
  const contextMessages = messages.slice(-TOOL_CONTEXT_WINDOW_SIZE);
  const query = contextMessages
    .map((message, index) => {
      const content = message.content
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, TOOL_CONTEXT_MESSAGE_LIMIT);
      const isCurrent = index === contextMessages.length - 1;
      const role = message.role === "user" ? "Người dùng" : "Trợ lý";
      return `${role}${isCurrent ? " (câu hỏi hiện tại)" : ""}: ${content}`;
    })
    .join("\n");

  return {
    query,
    turnsUsed: contextMessages.length,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Agent chưa được cấu hình GEMINI_API_KEY. Hãy thêm biến môi trường rồi thử lại.",
      },
      { status: 503 },
    );
  }

  let payload: { messages?: unknown };
  try {
    payload = (await request.json()) as { messages?: unknown };
  } catch {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  if (!Array.isArray(payload.messages)) {
    return Response.json({ error: "Thiếu lịch sử hội thoại." }, { status: 400 });
  }

  const messages = payload.messages.filter(isChatMessage).slice(-12);
  const userMessages = messages.filter((message) => message.role === "user");
  const latestQuestion = userMessages.at(-1)?.content.trim();
  if (!latestQuestion) {
    return Response.json({ error: "Bạn chưa nhập câu hỏi." }, { status: 400 });
  }

  const toolContext = buildToolContext(messages);
  // Deterministic per-conversation round robin. The client cannot request an
  // arbitrary model; this route can call only the two IDs declared above.
  const model = MODELS[(userMessages.length - 1) % MODELS.length];
  const initialGuidance = getConversationGuidance(latestQuestion, true);
  const retrieved = retrieveKnowledge(toolContext.query);
  const forceWebTools =
    process.env.FORCE_WEB_TOOLS?.trim().toLowerCase() === "true";
  // FORCE_WEB_TOOLS is useful for demos and audited flows where every answer
  // must attempt a live official-source lookup before Gemini is called.
  const webSearchRequested =
    forceWebTools ||
    (initialGuidance.intent !== "greeting" &&
      shouldSearchOfficialWeb(latestQuestion));
  const publicWebSources = webSearchRequested
    ? await getPublicWebSources(toolContext.query)
    : [];
  const groundedWebSources = publicWebSources.filter(
    (source) => source.trustLevel === "grounded",
  );
  const advisoryWebSources = publicWebSources.filter(
    (source) => source.trustLevel === "advisory",
  );
  const rawContextSources = [
    ...retrieved.map((source) => ({
      ...source,
      kind: "program-document" as const,
      trustLevel: "grounded" as const,
      disclaimer: undefined,
    })),
    ...publicWebSources,
  ];
  const contextSources = Array.from(
    rawContextSources.reduce((grouped, source) => {
      const key = `${source.kind}::${source.title}::${source.url || "internal"}`;
      const existing = grouped.get(key);
      if (existing && !existing.excerpt.includes(source.excerpt)) {
        grouped.set(key, {
          ...existing,
          excerpt: `${existing.excerpt}\n${source.excerpt}`.slice(0, 4200),
        });
      } else if (!existing) {
        grouped.set(key, source);
      }
      return grouped;
    }, new Map<string, (typeof rawContextSources)[number]>()),
  ).map(([, source]) => source);
  const context = contextSources.length
    ? contextSources
        .map(
          (source, index) =>
            `[Nguồn ${index + 1}: ${source.title} | Loại: ${
              source.kind === "official-web"
                ? "Website công khai của VinUni/Vingroup"
                : source.kind === "community-web"
                  ? "Nguồn công khai hoặc mạng xã hội — chỉ tham khảo, có thể không chính xác"
                  : "Tài liệu chương trình đã cung cấp"
            } | Đối tượng: ${source.audience} | Độ mới: ${source.freshness}${
              source.kind !== "program-document" && source.url
                ? ` | URL: ${source.url}`
                : ""
            }${source.disclaimer ? ` | Cảnh báo: ${source.disclaimer}` : ""}]\n${source.excerpt}`,
        )
        .join("\n\n")
    : "Không tìm thấy đoạn tài liệu phù hợp.";

  const guidance = getConversationGuidance(
    latestQuestion,
    contextSources.length > 0,
  );
  const today = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const systemInstruction = `Bạn là trợ lý hỏi đáp cho sinh viên và ứng viên quan tâm Chương trình Đào tạo Nhân tài AI Thực Chiến.

Ngày hiện tại: ${today}.
Intent đã phân loại: ${guidance.intent}.

NGUYÊN TẮC BẮT BUỘC:
- Chỉ trả lời dựa trên NGỮ CẢNH TÀI LIỆU được cung cấp bên dưới.
- Không tự bịa thời hạn, mức phụ cấp, điều kiện, kết quả hồ sơ hay cơ hội việc làm.
- Phân biệt rõ ứng viên với học viên đã nhập học.
- Khi dữ liệu nhạy cảm theo thời gian, nói rõ cần xác minh với Ban Tổ chức.
- Ưu tiên giúp người đang tìm hiểu hiểu sâu chương trình, tự đánh giá mức phù hợp và biết bước chuẩn bị tiếp theo.
- Nếu intent là "preparation" nhưng chưa biết nền tảng, thời gian hoặc mục tiêu của người dùng, hỏi đúng một câu làm rõ trước khi tư vấn; không tự giả định.
- Với lịch, thời điểm khai giảng, học phí, hỗ trợ hoặc điều kiện tuyển sinh: chỉ khẳng định khi có nguồn phù hợp và còn hiệu lực. Nếu không đủ căn cứ thì hướng dẫn xác minh với Ban Tổ chức.
- Nếu intent là "greeting", trả lời tối đa 2 câu và gợi ý ngắn phạm vi trợ lý.
- Khi đưa lộ trình chuẩn bị, phân biệt rõ phần dựa trên tài liệu và phần gợi ý định hướng; không trình bày điểm sẵn sàng như kết quả tuyển chọn chính thức.
- Ưu tiên nguồn website chính thức mới hơn cho lịch, hạn, địa điểm và tuyển sinh. Không trình bày thông báo cũ như thông tin hiện hành.
- Tài liệu chương trình được cung cấp và website VinUni/Vingroup là nguồn có căn cứ để trả lời.
- Nguồn báo chí, diễn đàn hoặc mạng xã hội chỉ dùng để bổ sung góc nhìn. Luôn nói rõ chúng có thể không chính xác và chỉ nên tham khảo.
- Không dùng nguồn công khai không chính thức làm căn cứ duy nhất để khẳng định học phí, lịch, hạn, điều kiện tuyển sinh hoặc quyền lợi.
- Nếu không đủ dữ liệu, nói thẳng chưa tìm thấy thông tin chính thức; không dùng kiến thức bên ngoài.
- Không yêu cầu người dùng gửi CCCD, OTP, mật khẩu hoặc dữ liệu nhạy cảm.
- Trả lời bằng tiếng Việt, thân thiện, trực tiếp, tối đa khoảng 220 từ.
- Khi dùng thông tin, trích dẫn dạng [Nguồn 1], [Nguồn 2].
- Dùng tiêu đề ngắn và danh sách gạch đầu dòng khi giúp nội dung dễ đọc. Không thêm mục "Nguồn" ở cuối vì giao diện sẽ hiển thị riêng.

NGỮ CẢNH TÀI LIỆU:
${context}`;

  const geminiContents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const uniqueSources = contextSources.map(
    ({
      id,
      title,
      audience,
      freshness,
      kind,
      url,
      trustLevel,
      disclaimer,
    }) => ({
      id,
      title,
      audience,
      freshness,
      kind,
      trustLevel,
      ...(disclaimer ? { disclaimer } : {}),
      ...(url ? { url } : {}),
    }),
  );
  const responseMetadata = {
    sources: uniqueSources.slice(0, 7),
    suggestions: guidance.suggestions,
    needsHumanHelp:
      guidance.needsHumanHelp ||
      (guidance.timeSensitive && groundedWebSources.length === 0),
    timeSensitive: guidance.timeSensitive,
    needsClarification: guidance.needsClarification,
    hasAdvisorySources: advisoryWebSources.length > 0,
    decision: {
      intent: guidance.intent,
      contextTurnsUsed: toolContext.turnsUsed,
      toolMode: forceWebTools ? ("forced" as const) : ("automatic" as const),
      toolStatus: webSearchRequested
        ? publicWebSources.length
          ? groundedWebSources.length
            ? ("official-web" as const)
            : ("public-web" as const)
          : ("official-web-unavailable" as const)
        : retrieved.length
          ? ("program-knowledge" as const)
          : ("no-source" as const),
      confidence:
        contextSources.length > 0 &&
        (!guidance.timeSensitive || groundedWebSources.length > 0)
          ? ("supported" as const)
          : ("limited" as const),
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.any([
          request.signal,
          AbortSignal.timeout(60_000),
        ]),
      },
    );

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      return Response.json(
        {
          error:
            errorPayload.error?.message ||
            "Dịch vụ trả lời chưa sẵn sàng lúc này.",
        },
        { status: response.status >= 500 ? 502 : 400 },
      );
    }

    if (!response.body) {
      return Response.json(
        { error: "Dịch vụ không mở được luồng trả lời." },
        { status: 502 },
      );
    }

    const upstreamReader = response.body.getReader();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const send = (event: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(`${JSON.stringify(event)}\n`),
          );
        };
        let buffer = "";
        let answerLength = 0;

        send({ type: "meta", ...responseMetadata });

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") return;
          try {
            const text = extractGeminiText(JSON.parse(data));
            if (text) {
              answerLength += text.length;
              send({ type: "delta", text });
            }
          } catch {
            // A malformed upstream event is skipped; subsequent events can
            // still complete the answer.
          }
        };

        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";
            lines.forEach(processLine);
          }
          buffer += decoder.decode();
          if (buffer) processLine(buffer);

          if (!answerLength) {
            send({
              type: "error",
              message: "Dịch vụ không trả về nội dung.",
            });
          } else {
            send({ type: "done" });
          }
        } catch (error) {
          const timedOut =
            error instanceof Error &&
            (error.name === "TimeoutError" || error.name === "AbortError");
          send({
            type: "error",
            message: timedOut
              ? "Luồng trả lời mất quá nhiều thời gian. Hãy thử lại."
              : "Luồng trả lời bị gián đoạn. Hãy thử lại.",
          });
        } finally {
          controller.close();
        }
      },
      cancel() {
        void upstreamReader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        "cache-control": "no-cache, no-transform",
        "content-type": "application/x-ndjson; charset=utf-8",
        "x-accel-buffering": "no",
      },
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return Response.json(
      {
        error: timedOut
          ? "Yêu cầu mất quá nhiều thời gian. Bạn có thể thử lại ngay."
          : "Không thể kết nối dịch vụ trả lời. Vui lòng thử lại.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
