import practiceBank from "../data/practice-question-bank.json";

export type PracticeModule = "A" | "B" | "C" | "D";
export type PracticeMode = "diagnostic" | "focus" | "review";
export type ConfidenceLevel = "unsure" | "fair" | "confident";

export type PracticeQuestion = {
  id: string;
  module: PracticeModule;
  skill: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  prompt: string;
  options: Array<{ key: string; text: string }>;
  answer: string;
  explanation: string;
  source: {
    kind: "community-practice-bank";
    label: string;
    originalExam: string;
  };
  reviewStatus: "automated-validation";
  version: number;
};

export type PracticeAttempt = {
  questionId: string;
  module: PracticeModule;
  skill: string;
  correct: boolean;
  confidence: ConfidenceLevel;
  selectedAnswer: string;
  timeSpentSeconds: number;
  attemptedAt: string;
};

export type ModuleScore = {
  module: PracticeModule;
  title: string;
  correct: number;
  total: number;
  accuracy: number;
};

type PracticeBank = {
  disclaimer: string;
  modules: Record<
    PracticeModule,
    { title: string; description: string }
  >;
  quality: {
    accepted: number;
    rejected: number;
    sourceExams: string;
    excludedExams: string;
  };
  questions: PracticeQuestion[];
};

export const PRACTICE_BANK = practiceBank as PracticeBank;
export const PRACTICE_STORAGE_KEY = "ai-thuc-chien-practice-v1";

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function latestAttemptByQuestion(attempts: PracticeAttempt[]) {
  return new Map(attempts.map((attempt) => [attempt.questionId, attempt]));
}

export function createPracticeSession(
  mode: PracticeMode,
  attempts: PracticeAttempt[],
  focusModule?: PracticeModule,
): PracticeQuestion[] {
  if (mode === "diagnostic") {
    return (Object.keys(PRACTICE_BANK.modules) as PracticeModule[]).flatMap(
      (module) =>
        shuffled(
          PRACTICE_BANK.questions.filter(
            (question) => question.module === module,
          ),
        ).slice(0, 3),
    );
  }

  if (mode === "review") {
    const latest = latestAttemptByQuestion(attempts);
    const incorrect = PRACTICE_BANK.questions.filter(
      (question) => latest.get(question.id)?.correct === false,
    );
    if (incorrect.length > 0) return shuffled(incorrect).slice(0, 10);
  }

  const targetModule = focusModule ?? getWeakestModule(attempts) ?? "B";
  const latest = latestAttemptByQuestion(attempts);
  const pool = PRACTICE_BANK.questions.filter(
    (question) => question.module === targetModule,
  );
  return shuffled(pool).sort((first, second) => {
    const firstCorrect = latest.get(first.id)?.correct === true ? 1 : 0;
    const secondCorrect = latest.get(second.id)?.correct === true ? 1 : 0;
    return firstCorrect - secondCorrect;
  }).slice(0, 10);
}

export function scoreModules(attempts: PracticeAttempt[]): ModuleScore[] {
  return (Object.keys(PRACTICE_BANK.modules) as PracticeModule[]).map(
    (module) => {
      const moduleAttempts = attempts.filter(
        (attempt) => attempt.module === module,
      );
      const correct = moduleAttempts.filter((attempt) => attempt.correct).length;
      return {
        module,
        title: PRACTICE_BANK.modules[module].title,
        correct,
        total: moduleAttempts.length,
        accuracy:
          moduleAttempts.length === 0
            ? 0
            : Math.round((correct / moduleAttempts.length) * 100),
      };
    },
  );
}

export function getWeakestModule(
  attempts: PracticeAttempt[],
): PracticeModule | undefined {
  const measured = scoreModules(attempts).filter((score) => score.total > 0);
  return measured.sort(
    (first, second) =>
      first.accuracy - second.accuracy || second.total - first.total,
  )[0]?.module;
}

export function buildCoachSummary(
  attempts: PracticeAttempt[],
  readinessScore?: number,
): string {
  const scores = scoreModules(attempts).filter((score) => score.total > 0);
  const moduleSummary = scores
    .map((score) => `${score.title}: ${score.accuracy}%`)
    .join("; ");
  const lowConfidenceCorrect = attempts.filter(
    (attempt) => attempt.correct && attempt.confidence === "unsure",
  ).length;
  return [
    "Tôi vừa hoàn thành bài luyện tập tự đánh giá.",
    readinessScore !== undefined
      ? `Điểm survey mức độ sẵn sàng: ${readinessScore}/100.`
      : "",
    `Kết quả theo nhóm: ${moduleSummary}.`,
    `Có ${lowConfidenceCorrect} câu trả lời đúng nhưng tôi chưa tự tin.`,
    "Hãy đề xuất lộ trình ôn tập 2 tuần dựa trên kết quả này. Chỉ sử dụng kết quả để định hướng, không suy diễn đây là kết quả tuyển chọn.",
  ]
    .filter(Boolean)
    .join(" ");
}
