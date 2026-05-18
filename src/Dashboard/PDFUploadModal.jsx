import { useState, useRef } from "react";
import "./PDFUploadModal.css";

// Load PDF.js
import * as pdfjsLib from "pdfjs-dist";

// Use the worker from the installed package (matches library version)
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFUploadModal({ isOpen, onClose, onExtract, onAutoFill }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      throw new Error("PDF files only");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large. Max 5MB");
    }
    return true;
  };

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      
      // Clean up text: remove extra whitespace, normalize
      fullText = fullText
        .replace(/\s+/g, " ")
        .replace(/([.!?])\s+/g, "$1\n")
        .trim();
      
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF. File may be corrupted or image-based.");
    }
  };

  const handleFileSelect = async (file) => {
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  // ✅ Calls your own backend — no CORS issues, no API key exposed
  const parseResumeWithClaude = async (pdfText) => {
    const response = await fetch("/api/resume/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server Error: ${errorData.error || response.status}`);
    }

    const parsed = await response.json();
    return parsed;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      validateFile(selectedFile);

      setUploadStatus("📄 Reading your resume...");
      setProgress(25);

      const pdfText = await extractTextFromPDF(selectedFile);

      if (!pdfText || pdfText.trim().length < 50) {
        throw new Error(
          "⚠️ This PDF is image-based or empty. Please upload a text-based PDF or fill the form manually."
        );
      }

      setProgress(50);
      setUploadStatus("🤖 AI is analyzing your resume...");

      const parsedData = await parseResumeWithClaude(pdfText);

      // Validate parsed data
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error("AI parsing failed. Please try again or fill manually.");
      }

      setProgress(75);
      setUploadStatus("✅ Filling your details...");

      // Ensure all required fields exist
      const safeData = {
        yearsOfExperience: parsedData.yearsOfExperience || "0",
        educationLevel: parsedData.educationLevel || "Bachelor's",
        desiredJobRole: parsedData.desiredJobRole || "",
        completedProjects: parsedData.completedProjects || "0",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.filter(s => s && s.trim()) : [""],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications.filter(c => c && c.trim()) : [""],
        currentCity: parsedData.currentCity || "",
        previousJobTitle: parsedData.previousJobTitle || "",
      };

      if (safeData.skills.length === 0) safeData.skills = [""];
      if (safeData.certifications.length === 0) safeData.certifications = [""];

      if (onAutoFill) {
        onAutoFill(safeData);
      }

      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(100);
      setUploadStatus("✅ Resume parsed successfully!");

      setTimeout(() => {
        handleClose();
        if (onExtract) {
          onExtract(pdfText);
        }
      }, 1500);
    } catch (err) {
      console.error("PDF Upload Error:", err);
      
      if (err.message.includes("JSON")) {
        setError(
          "⚠️ Could not parse resume properly. Please try another PDF or fill manually."
        );
      } else if (err.message.includes("Failed to fetch") || err.message.includes("Network")) {
        setError(
          "⚠️ Network error. Check your connection and try again."
        );
      } else {
        setError(err.message);
      }
      
      setProgress(0);
      setUploadStatus("");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadStatus("");
    setProgress(0);
    setError("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
        className="pdf-upload-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#6b7280",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 700, color: "#0d1b3e" }}>
            📄 Upload Your Resume
          </h2>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.5 }}>
            Our smart AI will extract your details automatically
          </p>
        </div>

        {/* Upload Area */}
        {!uploadStatus && !error && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
            style={{
              border: `2px dashed ${isDragging ? "#1a56db" : selectedFile ? "#16a34a" : "#e5e7eb"}`,
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: isDragging ? "#eff4ff" : selectedFile ? "#dcfce7" : "#f9fafb",
              marginBottom: "16px",
            }}
          >
            {selectedFile ? (
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#16a34a", marginBottom: "4px" }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Drag & drop your PDF
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "16px" }}>
                  or click to browse
                </div>
                <button
                  type="button"
                  style={{
                    padding: "10px 24px",
                    background: "#0d1b3e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Choose PDF File
                </button>
              </div>
            )}
          </div>
        )}

        {/* File Input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />

        {/* File Info */}
        {!uploadStatus && !error && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "center", marginBottom: "24px" }}>
            PDF only — Max 5MB
          </p>
        )}

        {/* Progress Bar */}
        {uploadStatus && (
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#0d1b3e",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              {uploadStatus}
            </p>
            <div
              style={{
                height: "8px",
                background: "#e5e7eb",
                borderRadius: "99px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100 ? "#16a34a" : "#1a56db",
                  borderRadius: "99px",
                  transition: "width 0.4s ease, background 0.4s",
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "16px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "#b91c1c", fontWeight: 600 }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={handleClose}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Fill Manually
              </button>
              <button
                onClick={() => {
                  setError("");
                  setSelectedFile(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#0d1b3e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!error && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={handleClose}
              disabled={!!uploadStatus}
              style={{
                padding: "12px 24px",
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: uploadStatus ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: uploadStatus ? "#9ca3af" : "#374151",
                opacity: uploadStatus ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !!uploadStatus}
              style={{
                padding: "12px 24px",
                background: !selectedFile || uploadStatus ? "#9ca3af" : "#0d1b3e",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: !selectedFile || uploadStatus ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
            >
              {uploadStatus ? "Processing..." : "Upload & Analyze →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}