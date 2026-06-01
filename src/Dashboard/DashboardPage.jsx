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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap", maxWidth: "100%" }}>
              {user?.username && (
                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", wordBreak: "break-word" }}>
                  {user.username}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                style={{
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
    </div>
  );
}
