"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCoachSummary,
  ConfidenceLevel,
  createPracticeSession,
  getWeakestModule,
  PRACTICE_BANK,
  PRACTICE_STORAGE_KEY,
  PracticeAttempt,
  PracticeMode,
  PracticeModule,
  PracticeQuestion,
  scoreModules,
} from "../lib/practice";

type PracticeLabProps = {
  readinessScore?: number;
  onAskCoach: (summary: string) => void;
};

type LabScreen = "intro" | "question" | "result";

const confidenceOptions: Array<{
  value: ConfidenceLevel;
  label: string;
}> = [
  { value: "unsure", label: "Chưa chắc" },
  { value: "fair", label: "Khá chắc" },
  { value: "confident", label: "Rất chắc" },
];

function readAttempts(): PracticeAttempt[] {
  try {
    const saved = localStorage.getItem(PRACTICE_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as PracticeAttempt[]) : [];
  } catch {
    localStorage.removeItem(PRACTICE_STORAGE_KEY);
    return [];
  }
}

function moduleTitle(module: PracticeModule) {
  return PRACTICE_BANK.modules[module].title;
}

function answerText(question: PracticeQuestion, key: string) {
  return question.options.find((option) => option.key === key)?.text ?? key;
}

export function PracticeLab({
  readinessScore,
  onAskCoach,
}: PracticeLabProps) {
  const [screen, setScreen] = useState<LabScreen>("intro");
  const [mode, setMode] = useState<PracticeMode>("diagnostic");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [confidence, setConfidence] =
    useState<ConfidenceLevel>("fair");
  const [isChecked, setIsChecked] = useState(false);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [sessionAttempts, setSessionAttempts] = useState<PracticeAttempt[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setAttempts(readAttempts());
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const currentQuestion = questions[questionIndex];
  const weakestModule = getWeakestModule(attempts);
  const historyScores = useMemo(() => scoreModules(attempts), [attempts]);
  const sessionScores = useMemo(
    () => scoreModules(sessionAttempts).filter((score) => score.total > 0),
    [sessionAttempts],
  );
  const sessionAccuracy =
    sessionAttempts.length === 0
      ? 0
      : Math.round(
          (sessionAttempts.filter((attempt) => attempt.correct).length /
            sessionAttempts.length) *
            100,
        );

  function startSession(
    nextMode: PracticeMode,
    focusModule?: PracticeModule,
  ) {
    const nextQuestions = createPracticeSession(
      nextMode,
      attempts,
      focusModule,
    );
    setMode(nextMode);
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setConfidence("fair");
    setIsChecked(false);
    setSessionAttempts([]);
    startedAt.current = window.performance.now();
    setScreen("question");
  }

  function checkAnswer() {
    if (!currentQuestion || !selectedAnswer || isChecked) return;
    const attempt: PracticeAttempt = {
      questionId: currentQuestion.id,
      module: currentQuestion.module,
      skill: currentQuestion.skill,
      correct: selectedAnswer === currentQuestion.answer,
      confidence,
      selectedAnswer,
      timeSpentSeconds: Math.max(
        1,
        Math.round((window.performance.now() - startedAt.current) / 1000),
      ),
      attemptedAt: new Date().toISOString(),
    };
    const nextAttempts = [...attempts, attempt].slice(-500);
    setAttempts(nextAttempts);
    setSessionAttempts((current) => [...current, attempt]);
    localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(nextAttempts));
    setIsChecked(true);
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      setScreen("result");
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
    setConfidence("fair");
    setIsChecked(false);
    startedAt.current = window.performance.now();
  }

  function resetProgress() {
    localStorage.removeItem(PRACTICE_STORAGE_KEY);
    setAttempts([]);
    setSessionAttempts([]);
    setScreen("intro");
  }

  function exportAnki() {
    const latestByQuestion = new Map(
      attempts.map((attempt) => [attempt.questionId, attempt]),
    );
    const cards = PRACTICE_BANK.questions.filter((question) => {
      const attempt = latestByQuestion.get(question.id);
      return attempt && (!attempt.correct || attempt.confidence === "unsure");
    });
    if (cards.length === 0) return;

    const header = "#separator:tab\n#html:false\n#columns:Front\tBack\tTags";
    const rows = cards.map((question) => {
      const correctAnswer = answerText(question, question.answer);
      const clean = (value: string) =>
        value.replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
      return [
        clean(question.prompt),
        clean(`Đáp án: ${correctAnswer}. ${question.explanation}`),
        clean(`AIThucChien Module-${question.module} ${question.skill}`),
      ].join("\t");
    });
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/tab-separated-values;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-thuc-chien-on-tap-anki.tsv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (screen === "intro") {
    return (
      <article className="practice-card">
        <header className="practice-hero">
          <div>
            <p className="eyebrow">Phòng luyện tập cá nhân hóa</p>
            <h1>Biết mình đang yếu ở đâu trước khi học tiếp.</h1>
            <p>
              Bài chẩn đoán ngắn theo bốn nhóm năng lực. Kết quả được lưu trên
              trình duyệt để gợi ý nội dung ôn phù hợp hơn ở những lần sau.
            </p>
          </div>
          <div className="practice-bank-stat">
            <strong>{PRACTICE_BANK.quality.accepted}</strong>
            <span>câu đã qua kiểm tra cấu trúc và loại trùng</span>
          </div>
        </header>

        <div className="practice-disclaimer">
          <span aria-hidden="true">i</span>
          <p>{PRACTICE_BANK.disclaimer}</p>
        </div>

        <section className="practice-start-grid">
          <button
            className="practice-mode primary"
            onClick={() => startSession("diagnostic")}
            type="button"
          >
            <span>01 · Khuyến nghị</span>
            <strong>Làm bài chẩn đoán</strong>
            <small>12 câu · khoảng 10 phút · cân bằng 4 nhóm</small>
          </button>
          <button
            className="practice-mode"
            onClick={() => startSession("focus", weakestModule)}
            type="button"
          >
            <span>02 · Thích ứng</span>
            <strong>
              {weakestModule
                ? `Luyện ${moduleTitle(weakestModule)}`
                : "Luyện Python & dữ liệu"}
            </strong>
            <small>10 câu · ưu tiên câu chưa làm hoặc từng trả lời sai</small>
          </button>
          <button
            className="practice-mode"
            disabled={!attempts.some((attempt) => !attempt.correct)}
            onClick={() => startSession("review")}
            type="button"
          >
            <span>03 · Ôn lại</span>
            <strong>Ôn các câu từng sai</strong>
            <small>
              {attempts.some((attempt) => !attempt.correct)
                ? "Tập trung vào lỗ hổng đã ghi nhận"
                : "Chưa có câu sai để ôn lại"}
            </small>
          </button>
        </section>

        {attempts.length > 0 && (
          <section className="practice-history">
            <div className="practice-section-heading">
              <div>
                <p className="eyebrow">Tiến trình trên thiết bị này</p>
                <h2>{attempts.length} lượt trả lời đã ghi nhận</h2>
              </div>
              <button onClick={resetProgress} type="button">
                Xóa tiến trình
              </button>
            </div>
            <div className="module-score-grid">
              {historyScores.map((score) => (
                <div className="module-score" key={score.module}>
                  <span>{score.module}</span>
                  <strong>{score.total ? `${score.accuracy}%` : "Chưa đo"}</strong>
                  <small>{score.title}</small>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    );
  }

  if (screen === "result") {
    const weakModule = getWeakestModule(sessionAttempts);
    const ankiCardCount = (() => {
      const latest = new Map(
        attempts.map((attempt) => [attempt.questionId, attempt]),
      );
      return [...latest.values()].filter(
        (attempt) => !attempt.correct || attempt.confidence === "unsure",
      ).length;
    })();
    return (
      <article className="practice-card">
        <section className="practice-result">
          <div className="result-score-ring">
            <strong>{sessionAccuracy}%</strong>
            <span>{sessionAttempts.length} câu</span>
          </div>
          <div className="result-copy">
            <p className="eyebrow">Kết quả luyện tập</p>
            <h1>
              {sessionAccuracy >= 80
                ? "Nền tảng đang khá tốt."
                : sessionAccuracy >= 55
                  ? "Bạn đang đi đúng hướng."
                  : "Đã xác định được phần cần củng cố."}
            </h1>
            <p>
              Đây là tín hiệu tự học từ ngân hàng luyện tập, không phải dự đoán
              khả năng trúng tuyển hay kết quả chính thức.
            </p>
          </div>
        </section>

        <div className="module-result-list">
          {sessionScores.map((score) => (
            <div className="module-result-row" key={score.module}>
              <span className="module-letter">{score.module}</span>
              <div>
                <strong>{score.title}</strong>
                <small>
                  {score.correct}/{score.total} câu đúng
                </small>
              </div>
              <div className="score-bar" aria-label={`${score.accuracy}%`}>
                <span style={{ width: `${score.accuracy}%` }} />
              </div>
              <b>{score.accuracy}%</b>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button
            className="primary-action"
            onClick={() =>
              onAskCoach(buildCoachSummary(sessionAttempts, readinessScore))
            }
            type="button"
          >
            Nhờ AI lập lộ trình 2 tuần
          </button>
          {weakModule && (
            <button
              onClick={() => startSession("focus", weakModule)}
              type="button"
            >
              Luyện tiếp {moduleTitle(weakModule)}
            </button>
          )}
          <button
            disabled={ankiCardCount === 0}
            onClick={exportAnki}
            type="button"
          >
            Xuất {ankiCardCount} thẻ cần ôn cho Anki
          </button>
          <button onClick={() => setScreen("intro")} type="button">
            Về tổng quan
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="practice-card practice-question-shell">
      <header className="question-topbar">
        <div>
          <p className="eyebrow">
            {mode === "diagnostic"
              ? "Bài chẩn đoán"
              : mode === "review"
                ? "Ôn câu từng sai"
                : "Luyện theo điểm yếu"}
          </p>
          <strong>
            Câu {questionIndex + 1}/{questions.length}
          </strong>
        </div>
        <button onClick={() => setScreen("intro")} type="button">
          Thoát
        </button>
      </header>
      <div className="question-progress">
        <span
          style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {currentQuestion && (
        <section className="question-stage">
          <div className="question-context">
            <span>Module {currentQuestion.module}</span>
            <span>{moduleTitle(currentQuestion.module)}</span>
            <span>{currentQuestion.skill}</span>
          </div>
          <h2>{currentQuestion.prompt}</h2>

          <div className="answer-list">
            {currentQuestion.options.map((option) => {
              const isCorrect =
                isChecked && option.key === currentQuestion.answer;
              const isWrong =
                isChecked &&
                option.key === selectedAnswer &&
                option.key !== currentQuestion.answer;
              return (
                <button
                  className={[
                    selectedAnswer === option.key ? "selected" : "",
                    isCorrect ? "correct" : "",
                    isWrong ? "wrong" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={isChecked}
                  key={option.key}
                  onClick={() => setSelectedAnswer(option.key)}
                  type="button"
                >
                  <span>{option.key}</span>
                  <strong>{option.text}</strong>
                </button>
              );
            })}
          </div>

          {!isChecked ? (
            <div className="question-controls">
              <fieldset>
                <legend>Bạn tự tin đến đâu?</legend>
                <div>
                  {confidenceOptions.map((option) => (
                    <label key={option.value}>
                      <input
                        checked={confidence === option.value}
                        name="confidence"
                        onChange={() => setConfidence(option.value)}
                        type="radio"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                className="primary-action"
                disabled={!selectedAnswer}
                onClick={checkAnswer}
                type="button"
              >
                Kiểm tra đáp án
              </button>
            </div>
          ) : (
            <div
              className={`answer-feedback ${
                selectedAnswer === currentQuestion.answer
                  ? "is-correct"
                  : "is-wrong"
              }`}
            >
              <div>
                <strong>
                  {selectedAnswer === currentQuestion.answer
                    ? "Chính xác"
                    : `Đáp án đúng: ${currentQuestion.answer}`}
                </strong>
                <p>{currentQuestion.explanation}</p>
              </div>
              <button
                className="primary-action"
                onClick={nextQuestion}
                type="button"
              >
                {questionIndex === questions.length - 1
                  ? "Xem kết quả"
                  : "Câu tiếp theo"}
              </button>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
