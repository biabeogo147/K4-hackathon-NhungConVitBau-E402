import examRules from "../../content/01-noi-quy-thi-vong-2.md?raw";
import handbook from "../../content/02-so-tay-hoc-vien.md?raw";
import zaloNotices from "../../content/03-thong-bao-zalo.md?raw";
import admissions from "../../content/04-thong-tin-tuyen-sinh.md?raw";
import practicalQa from "../../content/05-qa-thuc-te.md?raw";
import discordOnboarding from "../../content/06-onboarding-discord.md?raw";
import publicUpdates2026 from "../../content/07-cong-bo-chinh-thuc-2026.md?raw";

type KnowledgeDocument = {
  id: string;
  title: string;
  audience: string;
  freshness: string;
  priority: number;
  content: string;
};

export type RetrievedSource = {
  id: string;
  title: string;
  audience: string;
  freshness: string;
  excerpt: string;
  score: number;
};

const DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "exam-rules",
    title: "Nội quy thi vòng 2",
    audience: "Ứng viên",
    freshness: "Cần kiểm tra theo đợt thi",
    priority: 5,
    content: examRules,
  },
  {
    id: "student-handbook",
    title: "Sổ tay học viên",
    audience: "Học viên đã nhập học",
    freshness: "Phiên bản không ghi ngày",
    priority: 4,
    content: handbook,
  },
  {
    id: "zalo-notices",
    title: "Thông báo vận hành theo khóa",
    audience: "Ứng viên và học viên của khóa cụ thể",
    freshness: "Nhạy cảm theo thời gian — phải xác minh",
    priority: 1,
    content: zaloNotices,
  },
  {
    id: "admissions",
    title: "Thông tin tuyển sinh",
    audience: "Ứng viên",
    freshness: "Nhạy cảm theo thời gian — phải xác minh",
    priority: 5,
    content: admissions,
  },
  {
    id: "practical-qa",
    title: "Q&A vận hành nhập học",
    audience: "Học viên đã nhận thông báo nhập học",
    freshness: "Tổng hợp cộng đồng — phải xác minh ngoại lệ",
    priority: 2,
    content: practicalQa,
  },
  {
    id: "discord-onboarding",
    title: "Hướng dẫn onboarding và hỗ trợ nền tảng",
    audience: "Học viên đã nhập học",
    freshness: "Theo vận hành Discord — có thể thay đổi theo khóa",
    priority: 3,
    content: discordOnboarding,
  },
  {
    id: "public-updates-2026",
    title: "Thông tin công bố công khai năm 2026",
    audience: "Ứng viên và học viên",
    freshness: "Ảnh chụp thông tin đến 30/07/2026",
    priority: 4,
    content: publicUpdates2026,
  },
];

const STOP_WORDS = new Set([
  "cua",
  "cho",
  "va",
  "la",
  "co",
  "khong",
  "duoc",
  "nhung",
  "nhu",
  "the",
  "nao",
  "em",
  "minh",
  "toi",
  "ban",
  "anh",
  "chi",
  "ve",
  "voi",
  "trong",
  "mot",
  "cac",
  "thi",
  "gi",
  "a",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function chunkDocument(document: KnowledgeDocument) {
  const paragraphs = document.content
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > 1000) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n${paragraph}` : paragraph;
    }
  }
  if (current) chunks.push(current);

  return chunks.map((content, index) => ({
    document,
    id: `${document.id}-${index + 1}`,
    content,
  }));
}

const CHUNKS = DOCUMENTS.flatMap(chunkDocument);

export function retrieveKnowledge(
  query: string,
  limit = 6,
): RetrievedSource[] {
  const queryTokens = tokenize(query);
  const normalizedQuery = normalize(query);

  const scored = CHUNKS.map((chunk) => {
    const normalizedChunk = normalize(
      `${chunk.document.title} ${chunk.content}`,
    );
    const chunkTokens = new Set(tokenize(normalizedChunk));
    let score = chunk.document.priority * 0.12;
    let matchedTokens = 0;
    let intentScore = 0;

    for (const token of queryTokens) {
      if (chunkTokens.has(token)) {
        score += 1;
        matchedTokens += 1;
      }
      if (token.length >= 4 && normalizedChunk.includes(token)) score += 0.35;
    }

    const intentBoosts: Array<[string[], string, number]> = [
      [["thi", "vong 2", "phong thi", "cccd"], "exam-rules", 3],
      [["tuyen sinh", "dang ky", "ho so", "trai nganh"], "admissions", 3],
      [["lich hoc", "hoc vien", "phu cap", "thuc chien"], "student-handbook", 2],
      [["khai giang", "khoa 3", "khoa 4", "khoa 5", "khoa 6"], "zalo-notices", 2],
      [["onboarding", "github", "discord", "authenticator", "ticket", "role learner"], "discord-onboarding", 4],
      [["den muon", "doi lop", "doi khoa", "bao luu", "nhap hoc"], "practical-qa", 2],
      [["3+3+6", "khoa 1", "ket qua", "373", "20.000"], "public-updates-2026", 3],
    ];

    for (const [phrases, documentId, boost] of intentBoosts) {
      if (
        chunk.document.id === documentId &&
        phrases.some((phrase) => normalizedQuery.includes(normalize(phrase)))
      ) {
        score += boost;
        intentScore += boost;
      }
    }

    return {
      id: chunk.id,
      title: chunk.document.title,
      audience: chunk.document.audience,
      freshness: chunk.document.freshness,
      excerpt: chunk.content,
      score,
      matchedTokens,
      intentScore,
    };
  }).sort((a, b) => b.score - a.score);

  const topScore = scored[0]?.score || 0;
  const relevanceFloor = Math.max(0.5, topScore * 0.28);
  return scored
    .filter(
      (result) =>
        result.score >= relevanceFloor &&
        (result.intentScore > 0 ||
          result.matchedTokens >= Math.min(2, queryTokens.length)),
    )
    .slice(0, limit);
}
