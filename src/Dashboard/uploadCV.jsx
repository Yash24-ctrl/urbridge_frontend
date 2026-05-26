import { useState, useContext } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import API from "../api/axios";
import { AuthContext } from "../context/auth-context";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function UploadCV({ setScore, setSuggestions }) {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (selectedFile) => {
    if (!selectedFile) return "Upload a PDF";

    const fileName = selectedFile.name || "";
    const isPdfType =
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "application/x-pdf";
    const hasPdfExtension = fileName.toLowerCase().endsWith(".pdf");

    if (!isPdfType || !hasPdfExtension) {
      return "Only PDF files are allowed";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "PDF size must be 10MB or less";
    }

    return "";
  };
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + " ";
    }
    return text.toLowerCase().replace(/\s+/g, " ");
    };

  const validatePDFContent = async (file) => {
  const text = await extractTextFromPDF(file);

  // basic safety check
  if (!text || text.length < 50) {
    return ["resume content too short or unreadable"];
  }

  const sections = {
    skills: ["skills", "technical skills", "core skills"],
    experience: ["experience", "work experience", "professional experience"],
    education: ["education", "academic", "qualification"]
  };

  const missing = [];

  for (const key in sections) {
    const found = sections[key].some(k => text.includes(k));
    if (!found) missing.push(key);
  }

  return missing;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    const validationMessage = validateFile(selectedFile);

    if (validationMessage) {
      setFile(null);
      setError(validationMessage);
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  // const handleUpload = () => {
  //   const validationMessage = validateFile(file);
  //   if (validationMessage) {
  //     setScore(null);
  //     setSuggestions([]);
  //     setError(validationMessage);
  //     return;
  //   }

  //   setError("");

  //   // MOCK LOGIC
  //   setScore(72);
  //   setSuggestions([
  //     "Add more measurable achievements",
  //     "Improve summary section",
  //     "Include more relevant keywords"
  //   ]);
  // };

  const handleUpload = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const validationMessage = validateFile(file);

      if (validationMessage) {
        setScore(null);
        setSuggestions([]);
        setError(validationMessage);
        return;
      }

      const missingSections = await validatePDFContent(file);

      if (missingSections.length > 0) {
        setError(`Missing sections: ${missingSections.join(", ")}`);
        setScore(null);
        setSuggestions([]);
        return;
      }

      // Extract text for potential backend storage
      let extractedText = "";
      try {
        extractedText = await extractTextFromPDF(file);
      } catch (e) {
        console.warn("Could not extract text for storage:", e);
      }

      const score = 72;
      const suggestions = [
        "Add more measurable achievements",
        "Improve summary section",
        "Include more relevant keywords"
      ];

      // Save to backend if user is logged in
      if (user?.token) {
        try {
          // Upload the PDF file
          const formData = new FormData();
          formData.append("cv", file);

          const uploadRes = await API.post("/resume/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // Save analysis linked to upload
          await API.post(`/resume/upload/${uploadRes.data.upload._id}/analysis`, {
            score,
            suggestions,
            extractedText: extractedText.substring(0, 50000), // limit text size
          });
        } catch (err) {
          console.error("Backend save error:", err);
          setApiError("Analysis completed but failed to save to account.");
        }
      }

      setError("");
      setScore(score);
      setSuggestions(suggestions);

    } catch (err) {
      console.error(err);
      setError("Failed to read PDF (make sure it's not scanned)");
      setScore(null);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-panel dashboard-panel-accent">
      <div className="dashboard-panel-header">
        <span className="dashboard-panel-icon">PDF</span>
        <div>
          <h2>Upload Your CV</h2>
          <p>Drop in a PDF resume and get an instant quality check.</p>
        </div>
      </div>

      <label className="dashboard-file-drop">
        <input
          className="dashboard-file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <strong>{file ? file.name : "Choose a PDF resume"}</strong>
        <span>
          {file
            ? "Ready to analyze your uploaded document."
            : "Upload a clean PDF for the best result."}
        </span>
      </label>
      {error && <small style={{ color: "#b42318", fontWeight: 600 }}>{error}</small>}
      {apiError && (
        <small style={{ color: "#b42318", fontWeight: 600, display: "block", marginTop: "4px" }}>
          {apiError}
        </small>
      )}

      <button onClick={handleUpload} className="dashboard-button" disabled={isLoading}>
        {isLoading && <span className="loading-spinner"></span>}
        {isLoading ? "Analyzing..." : "Analyze PDF"}
      </button>
    </div>
  );
}
