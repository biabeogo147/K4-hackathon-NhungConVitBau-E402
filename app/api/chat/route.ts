import { retrieveKnowledge } from "../../lib/knowledge";
import {
  getOfficialWebSources,
  shouldSearchOfficialWeb,
} from "../../lib/official-tools";
import { getConversationGuidance } from "../../lib/product-intelligence";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

  // Deterministic per-conversation round robin. The client cannot request an
  // arbitrary model; this route can call only the two IDs declared above.
  const model = MODELS[(userMessages.length - 1) % MODELS.length];
  const initialGuidance = getConversationGuidance(latestQuestion, true);
  const retrieved = retrieveKnowledge(latestQuestion);
  // A short greeting does not need a public-web lookup.
  const webSearchRequested =
    initialGuidance.intent !== "greeting" &&
    shouldSearchOfficialWeb(latestQuestion);
  const officialWebSources = webSearchRequested
    ? await getOfficialWebSources(latestQuestion)
    : [];
  const rawContextSources = [
    ...retrieved.map((source) => ({
      ...source,
      kind: "program-document" as const,
      url: undefined,
    })),
    ...officialWebSources.map((source) => ({
      ...source,
      kind: "official-web" as const,
    })),
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
                : "Tài liệu tham chiếu của chương trình"
            } | Đối tượng: ${source.audience} | Độ mới: ${source.freshness}${
              source.url ? ` | URL: ${source.url}` : ""
            }]\n${source.excerpt}`,
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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`,
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
        signal: AbortSignal.timeout(45_000),
      },
    );

    const geminiPayload = (await response.json()) as unknown;
    if (!response.ok) {
      const errorPayload = geminiPayload as {
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

    const answer = extractGeminiText(geminiPayload);
    if (!answer) {
      return Response.json(
        { error: "Dịch vụ không trả về nội dung." },
        { status: 502 },
      );
    }

    const uniqueSources = contextSources.map(
      ({ id, title, audience, freshness, kind, url }) => ({
        id,
        title,
        audience,
        freshness,
        kind,
        ...(kind === "official-web" && url ? { url } : {}),
      }),
    );

    return Response.json({
      answer,
      sources: uniqueSources.slice(0, 5),
      suggestions: guidance.suggestions,
      needsHumanHelp:
        guidance.needsHumanHelp ||
        (guidance.timeSensitive && officialWebSources.length === 0),
      timeSensitive: guidance.timeSensitive,
      needsClarification: guidance.needsClarification,
      decision: {
        intent: guidance.intent,
        toolStatus: webSearchRequested
          ? officialWebSources.length
            ? "official-web"
            : "official-web-unavailable"
          : retrieved.length
            ? "program-knowledge"
            : "no-source",
        confidence:
          contextSources.length > 0 &&
          (!guidance.timeSensitive || officialWebSources.length > 0)
            ? "supported"
            : "limited",
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
