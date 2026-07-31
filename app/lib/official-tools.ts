const OFFICIAL_DOMAINS = ["vinuni.edu.vn", "vingroup.net"] as const;
const SOCIAL_DOMAINS = [
  "facebook.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "instagram.com",
  "threads.net",
  "x.com",
  "twitter.com",
  "reddit.com",
  "discord.com",
  "discord.gg",
  "zalo.me",
] as const;
const PUBLIC_REFERENCE_DOMAINS = [
  "vnexpress.net",
  "vietnamnet.vn",
  "dantri.com.vn",
  "tuoitre.vn",
  "thanhnien.vn",
  "vtv.vn",
  "vov.vn",
  "nhandan.vn",
  "vietnamplus.vn",
  "cafef.vn",
  "genk.vn",
  "techinasia.com",
  "medium.com",
  "substack.com",
  "github.com",
  "quora.com",
  "topcv.vn",
  "vietnamworks.com",
] as const;
const SEARCH_DOMAINS = [
  ...OFFICIAL_DOMAINS,
  ...SOCIAL_DOMAINS,
  ...PUBLIC_REFERENCE_DOMAINS,
] as const;
const TOOL_TIMEOUT_MS = 12_000;

export type PublicWebSource = {
  id: string;
  title: string;
  audience: string;
  freshness: string;
  excerpt: string;
  url: string;
  kind: "official-web" | "community-web";
  trustLevel: "grounded" | "advisory";
  disclaimer?: string;
};

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
};

function isDomainMatch(hostname: string, domains: readonly string[]) {
  return domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function classifyPublicUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const hostname = parsed.hostname.toLowerCase();
    if (!isDomainMatch(hostname, SEARCH_DOMAINS)) return null;
    const official = isDomainMatch(hostname, OFFICIAL_DOMAINS);
    return {
      kind: official ? ("official-web" as const) : ("community-web" as const),
      trustLevel: official ? ("grounded" as const) : ("advisory" as const),
    };
  } catch {
    return null;
  }
}

export function shouldSearchOfficialWeb(query: string) {
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

  return /(?:tim (?:tren )?(?:mang|web|internet)|tra (?:tren )?(?:mang|web|internet)|tra cuu|tim kiem|search|google|website|nguon chinh thuc|link chinh thuc|moi nhat|hien tai|hom nay|lich|khoa\s*\d|han|deadline|dang ky|tuyen sinh|khai giang|hoc phi|ho tro|dia diem|thoi gian|nam\s*20\d{2})/u.test(
    normalizedQuery,
  );
}

async function requestTavily(
  query: string,
  domains: readonly string[],
  maxResults: number,
) {
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
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
      include_domains: [...domains],
      country: "vietnam",
    }),
    signal: AbortSignal.timeout(TOOL_TIMEOUT_MS),
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as { results?: TavilyResult[] };
  return payload.results || [];
}

async function searchWithTavily(query: string) {
  const [officialResults, broadResults] = await Promise.all([
    requestTavily(query, OFFICIAL_DOMAINS, 3),
    requestTavily(query, SEARCH_DOMAINS, 6),
  ]);
  const uniqueResults = new Map<string, TavilyResult>();
  for (const result of [...officialResults, ...broadResults]) {
    if (result.url && !uniqueResults.has(result.url)) {
      uniqueResults.set(result.url, result);
    }
  }

  return [...uniqueResults.values()]
    .filter(
      (result) =>
        typeof result.url === "string" &&
        classifyPublicUrl(result.url) &&
        (result.score ?? 1) >= 0.3,
    )
    .slice(0, 6);
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
      limit: 5,
      sources: ["web"],
      includeDomains: [...SEARCH_DOMAINS],
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
        classifyPublicUrl(result.url),
    )
    .map((result) => ({
      title: result.title,
      url: result.url,
      content: result.markdown || result.description,
      score: 1,
      published_date: undefined,
    }))
    .slice(0, 5);
}

async function scrapeWithFirecrawl(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey || !classifyPublicUrl(url)) return "";

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

export async function getPublicWebSources(
  query: string,
): Promise<PublicWebSource[]> {
  try {
    const lookups = await Promise.allSettled([
      searchWithTavily(query),
      searchWithFirecrawl(query),
    ]);
    const combinedResults = lookups.flatMap((lookup) =>
      lookup.status === "fulfilled" ? lookup.value : [],
    );
    const uniqueResults = new Map<string, TavilyResult>();
    for (const result of combinedResults) {
      if (result.url && !uniqueResults.has(result.url)) {
        uniqueResults.set(result.url, result);
      }
    }
    const results = [...uniqueResults.values()]
      .sort((left, right) => {
        const leftOfficial =
          classifyPublicUrl(left.url || "")?.kind === "official-web";
        const rightOfficial =
          classifyPublicUrl(right.url || "")?.kind === "official-web";
        if (leftOfficial !== rightOfficial) return leftOfficial ? -1 : 1;
        return (right.score ?? 0) - (left.score ?? 0);
      })
      .slice(0, 6);
    if (!results.length) return [];

    const scrapedTopResult =
      results[0]?.url && (results[0]?.content?.length ?? 0) < 1000
      ? await scrapeWithFirecrawl(results[0].url)
      : "";

    return results.flatMap((result, index) => {
      const classification = classifyPublicUrl(result.url || "");
      if (!classification) return [];
      const advisory = classification.trustLevel === "advisory";
      return [{
        id: `${classification.kind}-${index + 1}`,
        title:
          result.title?.trim() ||
          (advisory ? "Nguồn công khai tham khảo" : "Nguồn chính thức"),
        audience: advisory
          ? "Nguồn công khai hoặc mạng xã hội"
          : "Thông tin chính thức",
        freshness: result.published_date
          ? `Đăng/cập nhật: ${result.published_date}`
          : "Tìm trực tuyến — cần đối chiếu ngày trên trang",
        excerpt:
          index === 0 && scrapedTopResult
            ? scrapedTopResult
            : result.content?.trim().slice(0, 1800) || "",
        url: result.url as string,
        ...classification,
        ...(advisory
          ? {
              disclaimer:
                "Nguồn công khai hoặc mạng xã hội có thể không chính xác; chỉ nên tham khảo và cần đối chiếu với tài liệu chương trình hoặc nguồn chính thức.",
            }
          : {}),
      }];
    });
  } catch {
    // External tools are enrichment only. Local RAG remains available when a
    // provider is unavailable or rate limited.
    return [];
  }
}
