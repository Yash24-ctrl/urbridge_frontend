import { useState, useEffect, useRef } from "react";
import styles from "./InterviewPrep.module.css";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from "../../Icon.png";

const TIMER_SECONDS = 20;

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedField, setSelectedField] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showTimer, setShowTimer] = useState(false);
  const [showQuestionCard, setShowQuestionCard] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [correctOption, setCorrectOption] = useState(-1);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [answered, setAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [interviewQsData, setInterviewQsData] = useState({ easy: [], medium: [], hard: [] });
  const [showInterviewQs, setShowInterviewQs] = useState(false);
  const [showIQLoader, setShowIQLoader] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const timerInterval = useRef(null);

  useEffect(() => {
    if (showTimer && timeLeft > 0 && !answered) {
      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            if (!answered) handleAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [showTimer, answered]);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ─── Anthropic API Call ───────────────────────────────────────────────────
  const callClaude = async (prompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system:
          "You are a senior technical interviewer at a top-tier tech company with 15+ years of experience. " +
          "You create precise, realistic, and challenging interview questions that are actually asked in real interviews. " +
          "Always respond with valid JSON only — no markdown fences, no explanation, no extra text.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API Error:", response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || "";
  };

  // ─── Fallback Quiz Questions (realistic, role-agnostic) ──────────────────
  const mockQuizQuestions = (field) => [
    {
      question: `Which data structure provides O(1) average-case lookup, insertion, and deletion?`,
      options: ["Binary Search Tree", "Hash Map", "Linked List", "AVL Tree"],
      correct: 1,
    },
    {
      question: `In object-oriented programming, which SOLID principle states that a class should have only one reason to change?`,
      options: ["Open/Closed Principle", "Liskov Substitution", "Single Responsibility Principle", "Interface Segregation"],
      correct: 2,
    },
    {
      question: `What HTTP status code indicates that a resource was successfully created?`,
      options: ["200 OK", "204 No Content", "201 Created", "202 Accepted"],
      correct: 2,
    },
    {
      question: `In a SQL database, which JOIN returns only rows that have matching values in both tables?`,
      options: ["LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "INNER JOIN"],
      correct: 3,
    },
    {
      question: `What does the CAP theorem state that a distributed system cannot simultaneously guarantee?`,
      options: [
        "Consistency, Availability, and Partition Tolerance",
        "Concurrency, Atomicity, and Performance",
        "Caching, Availability, and Persistence",
        "Consistency, Atomicity, and Partitioning",
      ],
      correct: 0,
    },
    {
      question: `Which Git command is used to integrate changes from one branch into another by replaying commits?`,
      options: ["git merge", "git cherry-pick", "git rebase", "git reset"],
      correct: 2,
    },
    {
      question: `In REST API design, which HTTP method should be idempotent and used to fully replace a resource?`,
      options: ["POST", "PATCH", "DELETE", "PUT"],
      correct: 3,
    },
    {
      question: `What is the time complexity of binary search on a sorted array of n elements?`,
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correct: 1,
    },
  ];

  // ─── Fallback Interview Questions ─────────────────────────────────────────
  const mockInterviewQuestions = (field, ec, mc, hc) => ({
    easy: [
      `What are the core responsibilities of a ${field} professional in a day-to-day role?`,
      `Explain the difference between synchronous and asynchronous operations in ${field}.`,
      `What version control practices do you follow in a ${field} project?`,
      `How do you approach debugging a problem in ${field}?`,
    ].slice(0, ec),
    medium: [
      `Describe a challenging ${field} project you worked on. What was your approach and what trade-offs did you make?`,
      `How would you design a scalable architecture for a ${field} system handling 1 million daily users?`,
      `What strategies do you use for performance optimization in ${field}?`,
      `How do you ensure code quality and maintainability in a ${field} codebase?`,
    ].slice(0, mc),
    hard: [
      `Design a distributed ${field} system that handles high availability and fault tolerance. Walk through your architecture decisions.`,
      `How would you approach migrating a legacy ${field} monolith to microservices without downtime?`,
      `Explain how you would implement observability (logging, metrics, tracing) in a complex ${field} system.`,
      `Describe a situation where you had to make a critical ${field} architectural decision under tight constraints. What was the outcome?`,
    ].slice(0, hc),
  });

  // ─── Start Quiz ───────────────────────────────────────────────────────────
  const startRapidFire = async () => {
    const field = selectedField.trim();
    if (!field) return;

    setIsLoading(true);
    setStep(2);
    setShowTimer(false);
    setShowQuestionCard(false);
    setShowFeedback(false);
    setScore(0);
    setCurrentQ(0);
    setResults([]);

    const prompt = `Generate exactly 8 multiple-choice quiz questions specifically for a "${field}" job interview.

Requirements:
- Questions must be technically accurate and based on real concepts used in "${field}" roles
- Cover these topics specifically relevant to "${field}": core concepts, tools/technologies, best practices, problem-solving scenarios
- Difficulty mix: 2 easy (foundational), 4 medium (applied), 2 hard (advanced/system-level)
- Each question must have exactly 4 options — only ONE is correct
- Wrong options must be plausible (real technologies/terms, not obviously wrong)
- Do NOT repeat the same concept twice
- Questions must be under 40 words each

Return ONLY this exact JSON format (no markdown, no explanation):
[
  {"question": "Question text here?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0},
  {"question": "Question text here?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 2}
]

The "correct" field is the 0-based index of the correct answer.`;

    try {
      const raw = await callClaude(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!Array.isArray(parsed) || parsed.length < 4) throw new Error("Invalid response");
      setQuestions(shuffleArray(parsed));
    } catch (e) {
      console.error("Claude API quiz generation failed:", e);
      setQuestions(mockQuizQuestions(field));
    }

    setIsLoading(false);
    setShowTimer(true);
    setShowQuestionCard(true);
  };

  // ─── Handle Answer ────────────────────────────────────────────────────────
  const handleAnswer = (optionIndex) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(optionIndex);

    const currentQuestion = questions[currentQ];
    const isCorrect = optionIndex === currentQuestion.correct;
    setCorrectOption(currentQuestion.correct);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedbackType("correct");
    } else if (optionIndex === -1) {
      setFeedbackType("timeout");
    } else {
      setFeedbackType("wrong");
    }

    setResults((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        selected: optionIndex === -1 ? "Timeout" : currentQuestion.options[optionIndex],
        correct: currentQuestion.options[currentQuestion.correct],
        isCorrect: isCorrect,
        isTimeout: optionIndex === -1,
      },
    ]);

    setShowFeedback(true);
    setShowTimer(false);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setTimeLeft(TIMER_SECONDS);
      setShowFeedback(false);
      setShowTimer(true);
      setSelectedOption(-1);
      setAnswered(false);
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setShowQuestionCard(false);
    setShowTimer(false);
    setShowFeedback(false);
    setStep(3);
    setShowResults(true);
    generateInterviewQuestions();
  };

  // ─── Generate Interview Questions ─────────────────────────────────────────
  const generateInterviewQuestions = async () => {
    const field = selectedField.trim();
    let ec = 3, mc = 3, hc = 2;
    // Use the score state via a ref trick — score updates asynchronously
    // so we rely on results array length which is synchronous by this point
    const finalScore = score;
    if (finalScore <= 2)      { ec = 5; mc = 2; hc = 1; }
    else if (finalScore <= 4) { ec = 4; mc = 3; hc = 1; }
    else if (finalScore <= 6) { ec = 2; mc = 4; hc = 2; }
    else                      { ec = 1; mc = 3; hc = 4; }

    setShowIQLoader(true);

    const prompt = `You are a senior hiring manager at a top tech company. Generate real, specific interview questions for a "${field}" role.

Generate exactly:
- ${ec} EASY questions: Conceptual/definitional. Suitable for entry-level candidates. Test foundational knowledge specific to "${field}".
- ${mc} MEDIUM questions: Scenario-based and applied. Test practical experience and problem-solving in "${field}". Should require 2-4 minute answers.
- ${hc} HARD questions: System design, architecture, or deep technical expertise in "${field}". Should challenge senior/staff-level candidates.

Rules:
- Every question must be directly relevant to "${field}" — no generic questions
- Questions must reflect what top companies (Google, Meta, Amazon, Microsoft) actually ask for "${field}" roles
- Easy: "What is...", "Explain the difference between...", "How does X work in ${field}?"
- Medium: "How would you...", "Describe a time when...", "Design a system that...", "What approach would you take to..."
- Hard: "Architect a...", "How would you scale...", "Walk me through your decision-making when...", "Compare and contrast... at scale"
- Be specific to "${field}" tools, frameworks, methodologies, and real-world challenges
- Do NOT generate vague or generic questions like "What is your greatest strength?"

Return ONLY this exact JSON (no markdown, no explanation, no extra text):
{"easy":["question1","question2"],"medium":["question1","question2"],"hard":["question1","question2"]}`;

    try {
      const raw = await callClaude(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const data = JSON.parse(clean);

      // Validate structure
      if (!data.easy || !data.medium || !data.hard) throw new Error("Invalid structure");
      if (!Array.isArray(data.easy) || !Array.isArray(data.medium) || !Array.isArray(data.hard))
        throw new Error("Arrays expected");

      setInterviewQsData(data);
    } catch (e) {
      console.error("Claude API interview generation failed:", e);
      setInterviewQsData(mockInterviewQuestions(field, ec, mc, hc));
    }

    setShowIQLoader(false);
    setShowInterviewQs(true);
  };

  // ─── Download PDF ─────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = 210;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const checkPage = (needed = 12) => {
        if (y + needed > 280) { doc.addPage(); y = 20; }
      };

      // Header
      doc.setFillColor(13, 27, 62);
      doc.rect(0, 0, pageWidth, 36, "F");
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("UrBridge.ai - Interview Prep Report", margin, 20);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 180, 255);
      doc.text(`Field: ${selectedField}  |  Score: ${score}/${questions.length}  |  ${new Date().toLocaleDateString()}`, margin, 29);
      y = 48;

      // Score summary
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 62);
      doc.text(`Quiz Results - ${selectedField}`, margin, y); y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const percentage = Math.round((score / questions.length) * 100);
      doc.text(`You scored ${score} out of ${questions.length} questions correctly (${percentage}%).`, margin, y); y += 16;

      // Quiz review table
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 62);
      doc.text("Quiz Review", margin, y); y += 8;

      results.forEach((r, i) => {
        const qLines = doc.splitTextToSize(`${i + 1}. ${r.question}`, contentWidth - 8);
        const rowH = Math.max(24, qLines.length * 6.6 + 14);
        checkPage(rowH + 4);
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 252 : 255);
        doc.rect(margin, y, contentWidth, rowH, "F");
        doc.setDrawColor(226, 232, 244);
        doc.setLineWidth(0.2);
        doc.rect(margin, y, contentWidth, rowH, "S");
        doc.setFontSize(10.8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(13, 27, 62);
        qLines.forEach((line, li) => doc.text(line, margin + 4, y + 7 + li * 6.6));
        const ansY = y + rowH - 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        if (r.isTimeout) { doc.setTextColor(217, 119, 6); doc.text("Timeout", margin + 4, ansY); }
        else if (r.isCorrect) { doc.setTextColor(22, 163, 74); doc.text("Correct", margin + 4, ansY); }
        else { doc.setTextColor(220, 38, 38); doc.text("Wrong", margin + 4, ansY); }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const corrLines = doc.splitTextToSize(`Correct: ${r.correct}`, contentWidth - 52);
        doc.text(corrLines[0], margin + 42, ansY);
        y += rowH + 4;
      });

      // Interview Questions sections
      doc.addPage(); y = 20;
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 62);
      doc.text(`Interview Questions - ${selectedField}`, margin, y); y += 13;

      const sections = [
        { label: "Easy Questions", color: [22, 163, 74], bg: [220, 252, 231], qs: interviewQsData.easy || [] },
        { label: "Medium Questions", color: [217, 119, 6], bg: [254, 243, 199], qs: interviewQsData.medium || [] },
        { label: "Hard Questions", color: [220, 38, 38], bg: [254, 226, 226], qs: interviewQsData.hard || [] },
      ];

      sections.forEach((sec) => {
        if (!sec.qs.length) return;
        checkPage(20);
        doc.setFillColor(...sec.bg);
        doc.rect(margin, y, contentWidth, 12, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...sec.color);
        doc.text(`${sec.label} (${sec.qs.length})`, margin + 4, y + 8);
        y += 16;

        sec.qs.forEach((q, i) => {
          const lines = doc.splitTextToSize(`${i + 1}. ${q}`, contentWidth - 10);
          const h = Math.max(18, lines.length * 6.8 + 10);
          checkPage(h + 4);
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 244);
          doc.setLineWidth(0.2);
          doc.rect(margin, y, contentWidth, h, "FD");
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(13, 27, 62);
          lines.forEach((line, li) => doc.text(line, margin + 5, y + 7 + li * 6.8));
          y += h + 4;
        });
        y += 6;
      });

      // Footer on all pages
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFillColor(13, 27, 62);
        doc.rect(0, 289, pageWidth, 8, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text("Generated by UrBridge.ai - Interview Prep", margin, 294);
        const pageStr = `Page ${p} of ${total}`;
        doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), 294);
      }

      doc.save(`UrBridge_InterviewPrep_${selectedField.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed: " + err.message);
    }
    setPdfLoading(false);
  };

  const restartQuiz = () => {
    setStep(1);
    setSelectedField("");
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(TIMER_SECONDS);
    setShowTimer(false);
    setShowQuestionCard(false);
    setShowFeedback(false);
    setResults([]);
    setShowResults(false);
    setShowInterviewQs(false);
    setInterviewQsData({ easy: [], medium: [], hard: [] });
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const currentStatus = percentage >= 75 ? "Excellent" : percentage >= 50 ? "Good" : "Needs Improvement";
  const diffLabel =
    currentStatus === "Needs Improvement"
      ? "Focus: Fundamentals"
      : currentStatus === "Good"
      ? "Focus: Applied Skills"
      : "Focus: Expert Level";

  return (
    <>
      <header className={styles.topbar}>
        <a href="#" className={styles.topbarLogo}>
          <img src={logo} alt="UrBridgeAI" />
        </a>
        <div className={styles.topbarRight}>
          <span className={styles.topbarPill}>Interview Prep</span>
        </div>
      </header>

      <div className={styles.stepsBar}>
        <div className={styles.stepsInner}>
          {[["Choose Field", 1], ["Rapid Fire Round", 2], ["Interview Questions", 3]].map(([label, n]) => (
            <div
              key={n}
              className={`${styles.stepItem}${step === n ? ` ${styles.active}` : ""}${step > n ? ` ${styles.done}` : ""}`}
            >
              <div className={styles.stepNum}>{step > n ? "✓" : n}</div>
              <div className={styles.stepLbl}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <section className={styles.step1}>
            <div className={styles.pageHeader}>
              <div className={styles.pageLabel}>Interview Prep</div>
              <div className={styles.pageTitle}>Choose Your Field</div>
              <div className={styles.pageSub}>
                Enter your desired job role — we'll generate real interview questions tailored to your field.
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>🔍 Enter Your Desired Job Role</div>
              <div className={styles.searchWrap}>
                <svg viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16a6.47 6.47 0 004.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="e.g. React Developer, Data Scientist, DevOps Engineer…"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && selectedField.trim() && startRapidFire()}
                />
              </div>
              <button
                className={styles.startBtn}
                disabled={!selectedField.trim()}
                onClick={startRapidFire}
              >
                Start Rapid Fire Round →
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <section className={styles.step2}>
            <div className={styles.pageHeader}>
              <div className={styles.pageLabel}>Rapid Fire Round</div>
              <div className={styles.pageTitle}>
                {selectedField} · {questions.length || 8} Questions · {TIMER_SECONDS}s Each
              </div>
            </div>

            {isLoading ? (
              <div className={`${styles.loadingScreen} ${styles.show}`}>
                <div className={styles.spinner}></div>
                <div className={styles.loadingText}>
                  Generating questions for <strong>{selectedField}</strong>
                  <span className={styles.loadingDots}></span>
                </div>
              </div>
            ) : (
              <div className={styles.card}>
                <div className={styles.quizToprow}>
                  <span className={styles.quizProgressLabel}>
                    Question {currentQ + 1} / {questions.length}
                  </span>
                  <span className={styles.scorePill}>
                    Score: {score} / {questions.length}
                  </span>
                </div>
                <div className={styles.progressBarWrap}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>

                <div className={styles.timerWrap}>
                  <svg className={styles.timerSvg} viewBox="0 0 80 80">
                    <circle className={styles.timerBg} cx="40" cy="40" r="36" />
                    <circle
                      className={styles.timerArc}
                      cx="40"
                      cy="40"
                      r="36"
                      style={{
                        strokeDashoffset: 226.2 - (timeLeft / TIMER_SECONDS) * 226.2,
                        stroke:
                          timeLeft <= 5 ? "#dc2626" : timeLeft <= 10 ? "#d97706" : "#1a56db",
                      }}
                    />
                    <text
                      className={styles.timerTextSvg}
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {timeLeft}
                    </text>
                  </svg>
                </div>

                <div className={styles.qBadge}>Q{currentQ + 1}</div>
                <div className={styles.questionText}>{questions[currentQ]?.question}</div>

                <div className={styles.optionsGrid}>
                  {questions[currentQ]?.options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`${styles.optionBtn}${answered && idx === correctOption ? ` ${styles.correct}` : ""}${
                        answered && selectedOption === idx && idx !== correctOption ? ` ${styles.wrong}` : ""
                      }`}
                      onClick={() => handleAnswer(idx)}
                      disabled={answered}
                    >
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                      {option}
                    </button>
                  ))}
                </div>

                {showFeedback && (
                  <div
                    className={`${styles.feedbackBar} ${styles.show} ${
                      feedbackType === "correct"
                        ? styles.correct
                        : feedbackType === "wrong"
                        ? styles.wrong
                        : ""
                    }`}
                  >
                    {feedbackType === "correct" && <span>✅ Correct! Well done.</span>}
                    {feedbackType === "wrong" && (
                      <span>❌ Incorrect. Correct answer: <strong>{questions[currentQ]?.options[correctOption]}</strong></span>
                    )}
                    {feedbackType === "timeout" && (
                      <span>⏱️ Time's up! Correct answer: <strong>{questions[currentQ]?.options[correctOption]}</strong></span>
                    )}
                  </div>
                )}

                {answered && (
                  <button className={`${styles.nextBtn} ${styles.show}`} onClick={nextQuestion}>
                    {currentQ < questions.length - 1 ? "Next Question →" : "View Results →"}
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && showResults && (
          <section className={styles.step3}>
            <div className={styles.pageHeader}>
              <div className={styles.pageLabel}>Interview Prep Results</div>
              <div className={styles.pageTitle}>Your Performance Report</div>
              <div className={styles.pageSub}>
                Here's how you did in the {selectedField} rapid fire round.
              </div>
            </div>

            <div className={styles.resultsGrid}>
              <div className={styles.scoreMainCard}>
                <div className={styles.scoreSectionLabel}>Rapid Fire Score</div>
                <div className={styles.scoreHeading}>Quiz Results</div>
                <div className={styles.scoreDesc}>
                  You answered {score} out of {questions.length} questions correctly.
                </div>

                <div className={styles.donutWrap}>
                  <svg className={styles.donutSvg} viewBox="0 0 100 100">
                    <circle className={styles.donutBg} cx="50" cy="50" r="36" />
                    <circle
                      className={styles.donutArc}
                      cx="50"
                      cy="50"
                      r="36"
                      style={{ strokeDashoffset: 226.2 - (percentage / 100) * 226.2 }}
                    />
                    <text
                      className={styles.donutNum}
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {percentage}%
                    </text>
                  </svg>
                  <div>
                    <div className={styles.donutInfoStatus}>Performance</div>
                    <div className={styles.donutStatusVal}>{currentStatus}</div>
                    <div className={styles.donutGoalLabel}>{diffLabel}</div>
                  </div>
                </div>

                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>Correct</span>
                  <div className={styles.breakdownBarBg}>
                    <div
                      className={styles.breakdownBarFill}
                      style={{ width: `${(score / questions.length) * 100}%`, background: "#16a34a" }}
                    ></div>
                  </div>
                  <span className={styles.breakdownPct}>{score}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>Incorrect</span>
                  <div className={styles.breakdownBarBg}>
                    <div
                      className={styles.breakdownBarFill}
                      style={{
                        width: `${((questions.length - score) / questions.length) * 100}%`,
                        background: "#dc2626",
                      }}
                    ></div>
                  </div>
                  <span className={styles.breakdownPct}>{questions.length - score}</span>
                </div>
              </div>

              <div className={styles.suggestionsCard}>
                <div className={styles.tipHeader}>
                  <span className={styles.tipBadge}>TIPS</span>
                  <div className={styles.tipTitle}>Improvement Suggestions</div>
                </div>
                <div className={styles.tipSub}>Based on your performance, here are personalised tips:</div>
                {percentage < 50 ? (
                  <>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>1</span><span>Review core {selectedField} fundamentals — focus on definitions, key concepts, and basic tools used in the role.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>2</span><span>Build 1–2 beginner projects to apply theory and build hands-on intuition before your interview.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>3</span><span>Practice explaining basic concepts out loud — verbalization reveals gaps in understanding quickly.</span></div>
                  </>
                ) : percentage < 75 ? (
                  <>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>1</span><span>Deepen applied knowledge through real-world {selectedField} scenarios, case studies, and trade-off analysis.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>2</span><span>Work on medium-complexity projects that involve real design and architecture decisions in {selectedField}.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>3</span><span>Study how senior engineers solve problems — read post-mortems, engineering blogs, and conference talks.</span></div>
                  </>
                ) : (
                  <>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>1</span><span>You're strong in {selectedField} — now focus on edge cases, performance bottlenecks, and scalability challenges.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>2</span><span>Prepare deep-dive answers that demonstrate system design thinking and architectural trade-offs at scale.</span></div>
                    <div className={styles.suggestionItem}><span className={styles.sugNum}>3</span><span>Do mock interviews with a peer and get feedback on clarity, depth, structure, and communication style.</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Quiz Review Table */}
            <div className={styles.quizSummaryCard}>
              <div className={styles.qsTitle}>📝 Quiz Review — Your Answers</div>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.qsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: "var(--blue)", width: 28 }}>{idx + 1}</td>
                        <td>{result.question}</td>
                        <td style={{ color: result.isCorrect ? "var(--green)" : "var(--red)" }}>
                          {result.selected}
                        </td>
                        <td style={{ color: "var(--green)", fontWeight: 600 }}>{result.correct}</td>
                        <td>
                          {result.isTimeout ? (
                            <span className={styles.qsResultTimeout}>⏱️ Timeout</span>
                          ) : result.isCorrect ? (
                            <span className={styles.qsResultCorrect}>✅ Correct</span>
                          ) : (
                            <span className={styles.qsResultWrong}>❌ Wrong</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interview Questions */}
            <div className={styles.iqWrap}>
              <div className={styles.iqWrapHeader}>
                <div className={styles.iqWrapTitle}>📋 Interview Questions for {selectedField}</div>
              </div>

              {showIQLoader ? (
                <div className={`${styles.loadingScreen} ${styles.show}`}>
                  <div className={styles.spinner}></div>
                  <div className={styles.loadingText}>
                    Crafting real interview questions for <strong>{selectedField}</strong>
                    <span className={styles.loadingDots}></span>
                  </div>
                </div>
              ) : (
                <div>
                  {interviewQsData.easy?.length > 0 && (
                    <div className={styles.iqGroup}>
                      <div className={styles.iqGroupHeader}>
                        <div className={`${styles.iqGroupDot} ${styles.dotEasy}`}></div>
                        <span className={styles.iqGroupLabel}>Easy Questions</span>
                        <span className={styles.iqCountBadge}>{interviewQsData.easy.length}</span>
                      </div>
                      {interviewQsData.easy.map((q, idx) => (
                        <div key={idx} className={styles.iqCard}>
                          <span className={styles.iqNum}>{idx + 1}</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {interviewQsData.medium?.length > 0 && (
                    <div className={styles.iqGroup}>
                      <div className={styles.iqGroupHeader}>
                        <div className={`${styles.iqGroupDot} ${styles.dotMedium}`}></div>
                        <span className={styles.iqGroupLabel}>Medium Questions</span>
                        <span className={styles.iqCountBadge}>{interviewQsData.medium.length}</span>
                      </div>
                      {interviewQsData.medium.map((q, idx) => (
                        <div key={idx} className={styles.iqCard}>
                          <span className={styles.iqNum}>{idx + 1}</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {interviewQsData.hard?.length > 0 && (
                    <div className={styles.iqGroup}>
                      <div className={styles.iqGroupHeader}>
                        <div className={`${styles.iqGroupDot} ${styles.dotHard}`}></div>
                        <span className={styles.iqGroupLabel}>Hard Questions</span>
                        <span className={styles.iqCountBadge}>{interviewQsData.hard.length}</span>
                      </div>
                      {interviewQsData.hard.map((q, idx) => (
                        <div key={idx} className={styles.iqCard}>
                          <span className={styles.iqNum}>{idx + 1}</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {(showResults || showInterviewQs) && (
        <div className={`${styles.bottomBar} ${styles.show}`}>
          <button className={styles.dlBtn} onClick={downloadPDF} disabled={pdfLoading}>
            {pdfLoading ? "⏳ Generating PDF..." : "⬇ Download PDF Report"}
          </button>
          <button className={styles.restartBtnBar} onClick={restartQuiz}>
            ↩ Start Over
          </button>
        </div>
      )}
    </>
  );
}
