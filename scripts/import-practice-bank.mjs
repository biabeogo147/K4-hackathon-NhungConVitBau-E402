import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory =
  process.argv[2] ?? "C:/Users/Namdr/Downloads/New folder (5)";
const outputFile =
  process.argv[3] ??
  path.resolve("app/data/practice-question-bank.json");

const moduleCatalog = {
  A: {
    title: "Tư duy định lượng",
    description: "Đại số, xác suất, thống kê và tư duy toán học nền tảng.",
  },
  B: {
    title: "Python & dữ liệu",
    description: "Python, NumPy, Pandas và thao tác dữ liệu.",
  },
  C: {
    title: "AI & Machine Learning",
    description: "Bài toán AI, đánh giá mô hình và tư duy sản phẩm.",
  },
  D: {
    title: "Logic & AI có trách nhiệm",
    description: "Lập luận, thiên lệch, quyền riêng tư và sử dụng AI an toàn.",
  },
};

function normalizePrompt(prompt) {
  return prompt.trim().replace(/\r\n/g, "\n");
}

function inferSkill(question) {
  const text = `${question.prompt} ${question.tags.join(" ")}`.toLowerCase();
  if (question.module === "A") {
    if (/xác suất|probability/.test(text)) return "Xác suất";
    if (/thống kê|statistics|trung bình|median|độ lệch/.test(text))
      return "Thống kê";
    if (/vector|matrix|ma trận/.test(text)) return "Vector & ma trận";
    return "Đại số & định lượng";
  }
  if (question.module === "B") {
    if (/dataframe|pandas|groupby|read_csv|\.loc|\.iloc/.test(text))
      return "Pandas";
    if (/numpy|np\.|array|broadcast|shape|reshape/.test(text)) return "NumPy";
    return "Python";
  }
  if (question.module === "C") {
    if (/đạo đức|bias|fairness|quyền riêng tư|privacy/.test(text))
      return "Responsible AI";
    if (/precision|recall|f1|accuracy|metric|đánh giá/.test(text))
      return "Đánh giá mô hình";
    if (/overfit|cross-validation|train|test|validation/.test(text))
      return "Huấn luyện mô hình";
    return "Tư duy AI Product";
  }
  if (/bias|thiên lệch|quyền riêng tư|privacy|đạo đức/.test(text))
    return "Responsible AI";
  return "Logic";
}

function inferDifficulty(question) {
  const length = question.prompt.length;
  if (length > 280) return "advanced";
  if (length > 150) return "intermediate";
  return "foundation";
}

const seenPrompts = new Set();
const questions = [];
const rejected = [];

for (let examNumber = 1; examNumber <= 10; examNumber += 1) {
  const fileName = `exam-${String(examNumber).padStart(2, "0")}.json`;
  const exam = JSON.parse(
    await readFile(path.join(sourceDirectory, fileName), "utf8"),
  );

  for (const question of exam.questions ?? []) {
    const prompt = normalizePrompt(question.prompt ?? "");
    const promptKey = prompt.toLocaleLowerCase("vi");
    const optionKeys = new Set(
      (question.options ?? []).map((option) => option.key),
    );
    const valid =
      question.type === "mcq" &&
      prompt.length > 0 &&
      moduleCatalog[question.module] &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      optionKeys.has(question.answer) &&
      typeof question.explanation === "string" &&
      question.explanation.trim().length > 0;

    if (!valid) {
      rejected.push({ id: question.id, reason: "invalid-question-shape" });
      continue;
    }
    if (seenPrompts.has(promptKey)) {
      rejected.push({ id: question.id, reason: "duplicate-prompt" });
      continue;
    }

    seenPrompts.add(promptKey);
    questions.push({
      id: question.id,
      module: question.module,
      skill: inferSkill(question),
      difficulty: inferDifficulty(question),
      prompt,
      options: question.options.map(({ key, text }) => ({ key, text })),
      answer: question.answer,
      explanation: question.explanation.trim(),
      source: {
        kind: "community-practice-bank",
        label: "Ngân hàng câu hỏi luyện tập đã kiểm định",
        originalExam: fileName,
      },
      reviewStatus: "automated-validation",
      version: 1,
    });
  }
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  purpose: "practice-and-self-assessment",
  disclaimer:
    "Nội dung dùng để tự ôn luyện và định hướng điểm yếu; không phải đề thi, tiêu chí tuyển chọn hay thông báo chính thức của chương trình.",
  modules: moduleCatalog,
  quality: {
    accepted: questions.length,
    rejected: rejected.length,
    sourceExams: "exam-01.json đến exam-10.json",
    excludedExams:
      "exam-11 đến exam-20 chưa được nhập do sai lệch điểm, schema hoặc nội dung cần rà soát.",
  },
  questions,
};

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Imported ${questions.length} questions; rejected ${rejected.length}.`,
);
console.log(`Output: ${outputFile}`);
