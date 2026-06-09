import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UploadCV from "./uploadCV";
import ManualForm from "./ManualForm";
import ScoreCard from "./ScoreCard";
import Suggestions from "./Suggestions";
import PDFUploadModal from "./PDFUploadModal";
import { downloadReport } from "./pdfDownload";
import { AuthContext } from "../context/auth-context";
import logo from "../Icon.png";
import { COUNSELLOR_SELECTION_KEY, COUNSELLORS } from "../data/counsellors";
import API from "../api/axios";

function isRouteNotFound(error) {
  return error?.response?.status === 404
    || /route not found/i.test(error?.response?.data?.message || error?.message || "");
}

async function getCounsellingHistory() {
  const paths = [
    "/user/counseling/history",
    "/user/counselling/history",
    "/counseling/history",
    "/counselling/history",
  ];
  let lastError = null;

  for (const path of paths) {
    try {
      return await API.get(path);
    } catch (error) {
      lastError = error;

      if (!isRouteNotFound(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState(null);
  const [cvText, setCvText] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [strongPoints, setStrongPoints] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [manualFormResetKey, setManualFormResetKey] = useState(0);
  const [isCounsellingMenuOpen, setIsCounsellingMenuOpen] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [showResumeHistoryModal, setShowResumeHistoryModal] = useState(false);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [resumeHistoryLoading, setResumeHistoryLoading] = useState(false);
  const [resumeHistoryError, setResumeHistoryError] = useState("");

  const insights = [
    { label: "Fast resume scan", value: "30 sec" },
    { label: "Keyword coverage", value: "Smart" },
    { label: "ATS-friendly Suggetions", value: "Instant" },
  ];

  // Data is stored in DB on submit, but we intentionally do NOT reload
  // score / suggestions / form data on mount so the user starts fresh
  // after a page refresh.

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCallCounsellor = () => {
    const counsellor = COUNSELLORS[0];
    setIsCounsellingMenuOpen(false);
    window.localStorage.setItem(COUNSELLOR_SELECTION_KEY, JSON.stringify(counsellor));
    navigate("/counselling", { state: { selectedCounsellor: counsellor } });
  };

  const handleYourSessions = async () => {
    setIsCounsellingMenuOpen(false);
    setShowSessionsModal(true);
    setSessionsLoading(true);
    setSessionsError("");

    try {
      const response = await getCounsellingHistory();
      setSessions(response.data?.bookings || []);
    } catch (error) {
      setSessionsError(error.response?.data?.message || error.message || "Unable to load your sessions.");
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const getSessionMeetLink = (session) =>
    session?.meetLink || session?.googleMeetLink || session?.google_meet_link || "";

  const handleResumeHistory = async () => {
    setShowResumeHistoryModal(true);
    setResumeHistoryLoading(true);
    setResumeHistoryError("");

    try {
      const response = await API.get("/resume/analysis/history");
      setResumeHistory(response.data?.analyses || []);
    } catch (error) {
      const isMissingHistoryRoute =
        error.response?.status === 404 &&
        String(error.response?.data?.message || "").toLowerCase().includes("route not found");

      if (isMissingHistoryRoute) {
        try {
          const latestResponse = await API.get("/resume/analysis/latest");
          const latestAnalysis = latestResponse.data?.analysis;
          setResumeHistory(latestAnalysis ? [latestAnalysis] : []);
          return;
        } catch (fallbackError) {
          if (fallbackError.response?.status === 404) {
            setResumeHistory([]);
            return;
          }

          setResumeHistoryError(
            fallbackError.response?.data?.message ||
              fallbackError.message ||
              "Unable to load resume history."
          );
          setResumeHistory([]);
          return;
        }
      }

      setResumeHistoryError(error.response?.data?.message || error.message || "Unable to load resume history.");
      setResumeHistory([]);
    } finally {
      setResumeHistoryLoading(false);
    }
  };

  const formatResumeHistoryDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getResumeHistorySourceLabel = (source) =>
    source === "upload" ? "PDF Upload" : "Manual Input";

  const getResumeHistoryTitle = (historyItem) => {
    const snapshot = historyItem?.profileSnapshot || {};
    return snapshot.desiredJobRoles || snapshot.previousJobTitle || "Resume analysis";
  };

  const handlePDFExtract = (extractedText) => {
    console.log("PDF text extracted:", extractedText);
  };

  const handleAutoFill = (parsedData) => {
    // Pass parsed data to ManualForm for auto-fill
    console.log("Auto-filling form with:", parsedData);
    // Store in window for ManualForm to access
    window.pdfParsedData = parsedData;
  };

  const resetAnalysisState = () => {
    setScore(null);
    setSuggestions([]);
    setFormData(null);
    setCvText(null);
    setProfileType(null);
    setScoreBreakdown(null);
    setStrongPoints([]);
    setDiagnostics(null);
    window.pdfParsedData = null;
    setManualFormResetKey((currentValue) => currentValue + 1);
  };

  const handleUploadNewResume = () => {
    resetAnalysisState();
    setIsPDFModalOpen(true);
  };

  const handleDownloadReport = () => {
    downloadReport({
      score,
      suggestions,
      formData,
      profileType,
      scoreBreakdown,
      strongPoints,
      diagnostics,
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
              <img
                src={logo}
                alt="UrBridgeAI"
                className="dashboard-brand-logo"
              />
            </div>
            <h1>Turn your resume into a stronger first impression.</h1>
            <p>
              Upload your CV or build your profile manually to get a cleaner
              score, sharper suggestions, and a more confident starting point
              for your next application.
            </p>
            <div className="dashboard-insights">
              {insights.map((item) => (
                <div key={item.label} className="dashboard-insight-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-hero-panel">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "12px",
                maxWidth: "100%",
                width: "100%",
              }}
            >
              <div className="dashboard-counselling-menu">
                <button
                  type="button"
                  className="dashboard-counselling-trigger"
                  aria-haspopup="menu"
                  aria-expanded={isCounsellingMenuOpen}
                  onClick={() => setIsCounsellingMenuOpen((isOpen) => !isOpen)}
                >
                  <span>AI Counselling</span>
                  <span className="dashboard-counselling-chevron" aria-hidden="true" />
                </button>
                {isCounsellingMenuOpen && (
                  <div className="dashboard-counselling-dropdown" role="menu">
                    <button
                      type="button"
                      className="dashboard-counselling-option"
                      role="menuitem"
                      onClick={() => setIsCounsellingMenuOpen(false)}
                    >
                      Chat With Counsellor
                    </button>
                    <button
                      type="button"
                      className="dashboard-counselling-option"
                      role="menuitem"
                      onClick={handleCallCounsellor}
                    >
                      Call with Counsellor
                    </button>
                    <button
                      type="button"
                      className="dashboard-counselling-option"
                      role="menuitem"
                      onClick={handleYourSessions}
                    >
                      Your Sessions
                    </button>
                  </div>
                )}
              </div>
              {user?.username && (
                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", textAlign: "center", wordBreak: "break-word" }}>
                  {user.username}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                style={{
                  justifySelf: "end",
                  padding: "10px 16px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.14)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Logout
              </button>
            </div>
            <div className="dashboard-preview-score">
              <span>Profile readiness</span>
              <strong>{score ?? 84}</strong>
              <small>{score !== null ? "Live score from your latest analysis" : "Sample benchmark for a polished resume"}</small>
            </div>
            <button
              type="button"
              className="dashboard-resume-history-button"
              onClick={handleResumeHistory}
            >
              Resume History
            </button>
            <button
              type="button"
              onClick={() => setIsPDFModalOpen(true)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "999px",
                background: "transparent",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                marginTop: "16px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
            >
              📄 Upload Resume PDF
            </button>
            <div className="dashboard-preview-list">
              <div>Clearer experience bullets</div>
              <div>Stronger ATS keyword match</div>
              <div>More credible impact statements</div>
            </div>
          </div>
        </section>
        {/* <div style={{ marginBottom : "25px" }}>
          <UploadCV setScore={setScore} setSuggestions={setSuggestions} />
        </div> */}
        <div style={{ marginBottom : "25px" }}>
          <ManualForm
            key={manualFormResetKey}
            setScore={setScore}
            setSuggestions={setSuggestions}
            setFormData={setFormData}
            setProfileType={setProfileType}
            setScoreBreakdown={setScoreBreakdown}
            setStrongPoints={setStrongPoints}
            setDiagnostics={setDiagnostics}
          />
        </div>

        <section className="dashboard-results">
          {score !== null ? (
            <>
              <div className="dashboard-report-cta">
                <div>
                  <span className="dashboard-section-label">PDF REPORT</span>
                  <h2>Download your full ATS report</h2>
                  <p>
                    Save the complete analysis, score breakdown, skills review,
                    missing skills, and smart suggestions as a PDF.
                  </p>
                </div>
                <button
                  type="button"
                  className="dashboard-button dashboard-download-button"
                  onClick={handleDownloadReport}
                >
                  Download Full PDF Report
                </button>
              </div>
              <ScoreCard score={score} formData={formData} profileType={profileType} scoreBreakdown={scoreBreakdown} strongPoints={strongPoints} />
              <Suggestions suggestions={suggestions} />
              <button
                type="button"
                className="dashboard-secondary-button"
                onClick={handleUploadNewResume}
              >
                Upload New Resume
              </button>
            </>
          ) : (
            <div className="dashboard-empty-state">
              <h2>No analysis yet</h2>
              <p>
                Start by uploading a resume or filling in your details to unlock
                your score and tailored suggestions.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* PDF Upload Modal */}
      <PDFUploadModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        onExtract={handlePDFExtract}
        onAutoFill={handleAutoFill}
      />

      {showResumeHistoryModal && (
        <div
          className="dashboard-counsellor-modal-backdrop"
          onClick={() => setShowResumeHistoryModal(false)}
        >
          <section
            className="dashboard-counsellor-section dashboard-counsellor-modal-card dashboard-resume-history-modal-card"
            aria-label="Your resume history"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="dashboard-counsellor-modal-x"
              aria-label="Close resume history"
              onClick={() => setShowResumeHistoryModal(false)}
            >
              ×
            </button>
            <div className="dashboard-counsellor-heading">
              <div>
                <span className="dashboard-section-label">RESUME HISTORY</span>
                <h2>Your resume history</h2>
                <p>Review resumes analyzed from PDF uploads and manual inputs.</p>
              </div>
            </div>

            {resumeHistoryLoading ? (
              <div className="dashboard-sessions-empty">Loading resume history...</div>
            ) : resumeHistoryError ? (
              <div className="dashboard-sessions-error">{resumeHistoryError}</div>
            ) : resumeHistory.length === 0 ? (
              <div className="dashboard-sessions-empty">No resume history found.</div>
            ) : (
              <div className="dashboard-resume-history-list">
                {resumeHistory.map((historyItem) => {
                  const snapshot = historyItem.profileSnapshot || {};
                  const skills = Array.isArray(snapshot.skills) ? snapshot.skills.filter(Boolean) : [];
                  const suggestionsList = Array.isArray(historyItem.suggestions)
                    ? historyItem.suggestions.filter(Boolean)
                    : [];

                  return (
                    <article className="dashboard-resume-history-card" key={historyItem._id || historyItem.id}>
                      <div className="dashboard-resume-history-main">
                        <span className={`dashboard-session-status ${historyItem.source === "upload" ? "is-remaining" : "is-completed"}`}>
                          {getResumeHistorySourceLabel(historyItem.source)}
                        </span>
                        <h3>{getResumeHistoryTitle(historyItem)}</h3>
                        <p>{formatResumeHistoryDate(historyItem.createdAt)}</p>
                      </div>
                      <div className="dashboard-resume-history-score">
                        <span>Score</span>
                        <strong>{typeof historyItem.score === "number" ? historyItem.score : "—"}</strong>
                        <em>/100</em>
                      </div>
                      <div className="dashboard-resume-history-details">
                        <div>
                          <span>Experience</span>
                          <strong>{snapshot.experience || 0} Years</strong>
                        </div>
                        <div>
                          <span>Top Skills</span>
                          <strong>{skills.length > 0 ? skills.slice(0, 4).join(", ") : "Not available"}</strong>
                        </div>
                      </div>
                      <p className="dashboard-resume-history-suggestion">
                        {suggestionsList[0] || "No suggestion stored for this analysis."}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {showSessionsModal && (
        <div
          className="dashboard-counsellor-modal-backdrop"
          onClick={() => setShowSessionsModal(false)}
        >
          <section
            className="dashboard-counsellor-section dashboard-counsellor-modal-card dashboard-sessions-modal-card"
            aria-label="Your counselling sessions"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="dashboard-counsellor-modal-x"
              aria-label="Close your sessions"
              onClick={() => setShowSessionsModal(false)}
            >
              ×
            </button>
            <div className="dashboard-counsellor-heading">
              <div>
                <span className="dashboard-section-label">YOUR SESSIONS</span>
                <h2>Your counselling sessions</h2>
                <p>View your completed and remaining counselling sessions in one place.</p>
              </div>
            </div>

            {sessionsLoading ? (
              <div className="dashboard-sessions-empty">Loading your sessions...</div>
            ) : sessionsError ? (
              <div className="dashboard-sessions-error">{sessionsError}</div>
            ) : sessions.length === 0 ? (
              <div className="dashboard-sessions-empty">No counselling sessions found.</div>
            ) : (
              <div className="dashboard-sessions-list">
                {sessions.map((session) => {
                  const isCompleted = session.status === "completed";
                  const meetLink = getSessionMeetLink(session);

                  return (
                    <article className="dashboard-session-card" key={session.bookingId || session.id}>
                      <div className="dashboard-session-main">
                        <span className={`dashboard-session-status ${isCompleted ? "is-completed" : "is-remaining"}`}>
                          {isCompleted ? "Completed" : "Remaining"}
                        </span>
                        <h3>{session.counsellorName || "AI Career Counsellor"}</h3>
                        <p>{session.counsellorTitle || "AI Career Counsellor"}</p>
                      </div>
                      <div className="dashboard-session-details">
                        <div>
                          <span>Date & Time</span>
                          <strong>{session.readableDate || session.date || "Date unavailable"} at {session.timeSlot || "Time unavailable"}</strong>
                        </div>
                        <div>
                          <span>Booking ID</span>
                          <strong>{session.bookingId || session.id || "Not available"}</strong>
                        </div>
                      </div>
                      <div className="dashboard-session-actions">
                        {isCompleted ? (
                          <button type="button" disabled>Session Ended</button>
                        ) : meetLink ? (
                          <a href={meetLink} target="_blank" rel="noreferrer">Join Meeting</a>
                        ) : (
                          <button type="button" disabled>Meeting Unavailable</button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
