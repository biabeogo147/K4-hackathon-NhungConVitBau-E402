const OFFICIAL_DOMAINS = ["vinuni.edu.vn", "vingroup.net"] as const;
const TOOL_TIMEOUT_MS = 12_000;

export type OfficialWebSource = {
  id: string;
  title: string;
  audience: string;
  freshness: string;
  excerpt: string;
  url: string;
};

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
};

function isOfficialUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return OFFICIAL_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

function isProgramRelevant(title = "", content = "") {
  const text = `${title} ${content}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /(nhan tai ai|ai thuc chien|chuong trinh ai)/.test(text);
}

export function shouldSearchOfficialWeb(query: string) {
  return /(?:mới nhất|hiện tại|hôm nay|lịch|khóa\s*\d|hạn|deadline|đăng ký|tuyển sinh|khai giảng|học phí|hỗ trợ|địa điểm|thời gian|năm\s*20\d{2})/iu.test(
    query,
  );
}

async function searchWithTavily(query: string) {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return [] as TavilyResult[];

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `AI Thực Chiến ${query}`,
      topic: "general",
      search_depth: "basic",
      max_results: 4,
      include_answer: false,
      include_raw_content: false,
      include_domains: [...OFFICIAL_DOMAINS],
      country: "vietnam",
    }),
    signal: AbortSignal.timeout(TOOL_TIMEOUT_MS),
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as { results?: TavilyResult[] };
  return (payload.results || [])
    .filter(
      (result) =>
        typeof result.url === "string" &&
        isOfficialUrl(result.url) &&
        isProgramRelevant(result.title, result.content) &&
        (result.score ?? 1) >= 0.35,
    )
    .slice(0, 3);
}

async function searchWithFirecrawl(query: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) return [] as TavilyResult[];

  const response = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `AI Thực Chiến ${query}`,
      limit: 3,
      sources: ["web"],
      includeDomains: [...OFFICIAL_DOMAINS],
      country: "VN",
      location: "Vietnam",
      timeout: 30_000,
      ignoreInvalidURLs: true,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    }),
    signal: AbortSignal.timeout(TOOL_TIMEOUT_MS),
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as {
    data?: {
      web?: Array<{
        title?: string;
        description?: string;
        url?: string;
        markdown?: string;
      }>;
    };
  };

  return (payload.data?.web || [])
    .filter(
      (result) =>
        typeof result.url === "string" &&
        isOfficialUrl(result.url) &&
        isProgramRelevant(
          result.title,
          `${result.description || ""} ${result.markdown || ""}`,
        ),
    )
    .map((result) => ({
      title: result.title,
      url: result.url,
      content: result.markdown || result.description,
      score: 1,
    }))
    .slice(0, 3);
}

async function scrapeWithFirecrawl(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey || !isOfficialUrl(url)) return "";

  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      maxAge: 3_600_000,
      removeBase64Images: true,
      timeout: 20_000,
    }),
    signal: AbortSignal.timeout(TOOL_TIMEOUT_MS),
  });

  if (!response.ok) return "";
  const payload = (await response.json()) as {
    data?: { markdown?: string };
  };
  return payload.data?.markdown?.replace(/\s+/g, " ").trim().slice(0, 5000) || "";
}

export async function getOfficialWebSources(
  query: string,
): Promise<OfficialWebSource[]> {
  if (!shouldSearchOfficialWeb(query)) return [];

  try {
    const tavilyResults = await searchWithTavily(query);
    const results = tavilyResults.length
      ? tavilyResults
      : await searchWithFirecrawl(query);
    if (!results.length) return [];

    const scrapedTopResult =
      results[0]?.url && (results[0]?.content?.length ?? 0) < 1000
      ? await scrapeWithFirecrawl(results[0].url)
      : "";

    return results.map((result, index) => ({
      id: `official-web-${index + 1}`,
      title: result.title?.trim() || "Nguồn chính thức",
      audience: "Thông tin công khai",
      freshness: result.published_date
        ? `Đăng/cập nhật: ${result.published_date}`
        : "Tìm trực tuyến — cần đối chiếu ngày trên trang",
      excerpt:
        index === 0 && scrapedTopResult
          ? scrapedTopResult
          : result.content?.trim().slice(0, 1800) || "",
      url: result.url as string,
    }));
  } catch {
    // External tools are enrichment only. Local RAG remains available when a
    // provider is unavailable or rate limited.
    return [];
  }
}
