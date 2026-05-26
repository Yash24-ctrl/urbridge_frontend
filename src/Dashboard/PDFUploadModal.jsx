import { useRef, useState } from "react";
import "./PDFUploadModal.css";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_TEXT_LENGTH = 50;

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function buildPageText(items = []) {
  const sortedItems = [...items]
    .filter((item) => item?.str && item.str.trim())
    .sort((a, b) => {
      const yA = a.transform?.[5] || 0;
      const yB = b.transform?.[5] || 0;
      if (Math.abs(yB - yA) > 2) {
        return yB - yA;
      }
      return (a.transform?.[4] || 0) - (b.transform?.[4] || 0);
    });

  const lines = [];
  let currentLine = [];
  let lastY = null;
  let lastX = null;

  for (const item of sortedItems) {
    const text = item.str.trim();
    const x = item.transform?.[4] || 0;
    const y = item.transform?.[5] || 0;

    if (lastY !== null && Math.abs(y - lastY) > 3) {
      if (currentLine.length > 0) {
        lines.push(currentLine.join("").replace(/\s+/g, " ").trim());
      }
      currentLine = [];
      lastX = null;
    }

    if (lastX !== null && x - lastX > 12) {
      currentLine.push(" ");
    }

    currentLine.push(text);
    lastY = y;
    lastX = x + (item.width || text.length);
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join("").replace(/\s+/g, " ").trim());
  }

  return lines.filter(Boolean).join("\n");
}

export default function PDFUploadModal({ isOpen, onClose, onExtract, onAutoFill }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const validateFile = (file) => {
    if (file.type !== "application/pdf") {
      throw new Error("PDF files only");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Max 10MB");
    }

    return true;
  };

  const extractTextFromPDF = async (file, arrayBuffer) => {
    try {
      console.log("Starting PDF extraction for:", file.name, "Size:", file.size);
      console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: true,
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      console.log("PDF loaded, pages:", pdf.numPages);

      let fullText = "";
      let totalPagesProcessed = 0;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        try {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = buildPageText(content.items);

          console.log(`Page ${pageNumber}: Found ${content.items.length} text items`);
          console.log(`Page ${pageNumber}: Extracted ${pageText.length} characters`);

          if (pageText) {
            fullText += `${pageText}\n\n`;
          }
          totalPagesProcessed += 1;
        } catch (pageError) {
          console.error(`Failed to extract text from page ${pageNumber}:`, pageError);
        }
      }

      console.log(`Processed ${totalPagesProcessed}/${pdf.numPages} pages`);

      fullText = fullText
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      console.log(`Total extracted: ${fullText.length} characters`);

      if (fullText && fullText.length >= MIN_TEXT_LENGTH) {
        return fullText;
      }

      console.log("PDF.js extracted minimal text, trying OCR-aware backend extraction...");

      const aiResponse = await fetch("/api/resume/extract-pdf-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("user")
              ? JSON.parse(localStorage.getItem("user")).token
              : ""
          }`,
        },
        body: JSON.stringify({
          pdfBase64: arrayBufferToBase64(arrayBuffer),
          fileName: file.name,
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        throw new Error(
          errorData?.error ||
          errorData?.message ||
          "Could not extract text from PDF. Please make sure your PDF is not scanned or image-based."
        );
      }

      const aiData = await aiResponse.json();
      if (aiData?.text && aiData.text.trim().length >= MIN_TEXT_LENGTH) {
        return aiData.text.trim();
      }

      throw new Error(
        "Could not extract text from PDF. Please make sure your PDF is not scanned or image-based."
      );
    } catch (extractionError) {
      console.error("PDF extraction error:", extractionError);

      if (extractionError.name === "PasswordException") {
        throw new Error("This PDF is password-protected. Please upload an unlocked PDF.");
      }

      if (extractionError.message.includes("worker")) {
        throw new Error("PDF processing failed. Please try a different PDF or fill the form manually.");
      }

      throw extractionError;
    }
  };

  const handleFileSelect = (file) => {
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
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
    if (file) {
      handleFileSelect(file);
    }
  };

  const parseResumeWithAI = async ({ pdfText, pdfBase64, fileName }) => {
    let retries = 2;

    while (retries > 0) {
      try {
        const response = await fetch("/api/resume/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfText, pdfBase64, fileName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Server Error: ${errorData.error || response.status}`);
        }

        const parsed = await response.json();
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid response format");
        }

        console.log("Parsed resume data:", parsed);
        return parsed;
      } catch (parseError) {
        retries -= 1;
        console.warn(`Parse attempt failed, ${retries} retries left:`, parseError.message);

        if (retries === 0) {
          throw parseError;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Resume analysis failed.");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      validateFile(selectedFile);

      setUploadStatus("Reading your resume...");
      setProgress(20);

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfBase64 = arrayBufferToBase64(arrayBuffer);

      let pdfText = "";
      try {
        pdfText = await extractTextFromPDF(selectedFile, arrayBuffer);
      } catch (textError) {
        console.warn(
          "Local text extraction was incomplete. Continuing with PDF-aware AI parsing.",
          textError
        );
      }

      setProgress(50);
      setUploadStatus("AI is analyzing your resume...");

      const parsedData = await parseResumeWithAI({
        pdfText,
        pdfBase64: pdfText.trim().length >= MIN_TEXT_LENGTH ? "" : pdfBase64,
        fileName: selectedFile.name,
      });

      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Resume analysis failed. Please try again or fill manually.");
      }

      setProgress(75);
      setUploadStatus("Filling your details...");

      const safeData = {
        yearsOfExperience: parsedData.yearsOfExperience || "0",
        educationLevel: parsedData.educationLevel || "Other",
        customEducation: parsedData.customEducation || "",
        desiredJobRole: parsedData.desiredJobRole || "Professional",
        completedProjects: parsedData.completedProjects || "N/A",
        skills: Array.isArray(parsedData.skills)
          ? parsedData.skills.filter((skill) => skill && skill.trim())
          : ["Not specified"],
        certifications: Array.isArray(parsedData.certifications)
          ? parsedData.certifications.filter((certification) => certification && certification.trim())
          : ["N/A"],
        currentCity: parsedData.currentCity || "Not specified",
        previousJobTitle: parsedData.previousJobTitle || "N/A",
      };

      if (safeData.educationLevel === "Other" && !safeData.customEducation.trim()) {
        safeData.customEducation = "Not specified";
      }

      if (safeData.skills.length === 0) {
        safeData.skills = ["Not specified"];
      }

      if (safeData.certifications.length === 0) {
        safeData.certifications = ["N/A"];
      }

      onAutoFill?.(safeData);

      setProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(100);
      setUploadStatus("Resume parsed successfully!");

      setTimeout(() => {
        handleClose();
        onExtract?.(pdfText || "");
      }, 1500);
    } catch (uploadError) {
      console.error("PDF Upload Error:", uploadError);

      if (uploadError.message.includes("Failed to fetch") || uploadError.message.includes("Network")) {
        setError("Network error. Check your connection and try again.");
      } else {
        setError(uploadError.message || "Failed to analyze resume. Please try again.");
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 700, color: "#0d1b3e" }}>
            Upload Your Resume
          </h2>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.5 }}>
            Our smart AI will extract your details automatically
          </p>
        </div>

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
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✓</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#16a34a", marginBottom: "4px" }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "42px", marginBottom: "12px", fontWeight: 700, color: "#0d1b3e" }}>
                  PDF
                </div>
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

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />

        {!uploadStatus && !error && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "center", marginBottom: "24px" }}>
            PDF only - Max 10MB
          </p>
        )}

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

        {!error && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={handleClose}
              disabled={Boolean(uploadStatus)}
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
              disabled={!selectedFile || Boolean(uploadStatus)}
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
              {uploadStatus ? "Processing..." : "Upload & Analyze ->"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
