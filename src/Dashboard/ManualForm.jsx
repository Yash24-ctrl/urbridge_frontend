import { useState, useContext, useRef, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/auth-context";

const ALL_SKILLS = [
  // Data Science
  "python", "sql", "machine learning", "statistics", "pandas", "numpy",
  "scikit-learn", "data visualization", "feature engineering", "model evaluation",
  "deep learning", "tableau", "data analysis", "data cleaning", "power bi",
  "matplotlib", "seaborn", "jupyter", "r programming", "spark",
  // ML Engineering
  "tensorflow", "pytorch", "mlops", "model deployment", "docker", "aws",
  "azure", "gcp", "kubernetes", "airflow", "mlflow", "hugging face",
  // Backend
  "node.js", "express", "api development", "mongodb", "postgresql", "redis",
  "authentication", "rest api", "graphql", "microservices", "system design",
  "django", "flask", "fastapi", "spring boot", "java", "php", "mysql",
  // Frontend
  "html", "css", "javascript", "react", "responsive design", "typescript",
  "state management", "accessibility", "ui optimization", "vite", "redux",
  "vue.js", "angular", "next.js", "tailwind css", "bootstrap", "sass",
  // DevOps
  "ci/cd", "linux", "terraform", "monitoring", "shell scripting",
  "github actions", "networking", "jenkins", "ansible", "nginx",
  // General
  "git", "testing", "debugging", "object oriented programming", "problem solving",
  "data structures", "algorithms", "communication", "team collaboration",
  "documentation", "agile", "scrum", "jira", "figma", "photoshop",
];

export default function ManualForm({ setScore, setSuggestions, setFormData, setProfileType, setScoreBreakdown, setStrongPoints }) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [activeSkillIndex, setActiveSkillIndex] = useState(null);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    skills: [""],
    experience: "",
    education: "",
    customEducation: "",
    certifications: [""],
    completedProjects: "",
    desiredJobRoles: "",
    currentCity: "",
    previousJobTitle: "",
  });

  const [errors, setErrors] = useState({
    experience: "",
    education: "",
    customEducation: "",
    skills: [""],
    certifications: [""],
    completedProjects: "",
    desiredJobRoles: "",
    currentCity: "",
    previousJobTitle: "",
  });

  const [parsedBadges, setParsedBadges] = useState({});

  // Auto-fill from PDF parsed data
  useEffect(() => {
    // Check for PDF data on mount and set up interval to detect it
    const checkForPDFData = () => {
      if (window.pdfParsedData) {
        const data = window.pdfParsedData;
        
        setForm({
          skills: data.skills?.length > 0 ? data.skills : [""],
          experience: data.yearsOfExperience || "",
          education: data.educationLevel || "",
          customEducation: data.customEducation || "",
          certifications: data.certifications?.length > 0 ? data.certifications : [""],
          completedProjects: data.completedProjects || "",
          desiredJobRoles: data.desiredJobRole || "",
          currentCity: data.currentCity || "",
          previousJobTitle: data.previousJobTitle || "",
        });

        // Track which fields were parsed
        setParsedBadges({
          experience: true,
          education: true,
          completedProjects: true,
          desiredJobRoles: true,
          currentCity: true,
          previousJobTitle: true,
          skills: data.skills?.length > 0,
          certifications: data.certifications?.length > 0,
        });

        // Clear after using
        window.pdfParsedData = null;
        
        // Stop checking once data is processed
        return true;
      }
      return false;
    };

    // Check immediately on mount
    if (!checkForPDFData()) {
      // Set up polling to detect PDF data when modal closes
      const interval = setInterval(() => {
        if (checkForPDFData()) {
          clearInterval(interval);
        }
      }, 500);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "experience" ? value.replace(/[^0-9]/g, "") : value;
    setForm({ ...form, [name]: nextValue });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Skills
  const handleSkillChange = (index, value) => {
    const updated = [...form.skills];
    updated[index] = value;
    setForm((prev) => ({ ...prev, skills: updated }));
    setErrors((prev) => {
      const nextSkillErrors = [...prev.skills];
      nextSkillErrors[index] = value.includes(",")
        ? "Cannot add multiple skills. Add them one at a time."
        : "";
      return { ...prev, skills: nextSkillErrors };
    });
    if (value.trim().length > 0) {
      const alreadyAdded = form.skills.map(s => s.toLowerCase().trim());
      const filtered = ALL_SKILLS.filter(
        (s) => s.toLowerCase().includes(value.toLowerCase()) && !alreadyAdded.includes(s.toLowerCase())
      ).slice(0, 6);
      setSkillSuggestions(filtered);
      setActiveSkillIndex(index);
    } else {
      setSkillSuggestions([]);
      setActiveSkillIndex(null);
    }
  };

  const handleSuggestionClick = (index, suggestion) => {
    const updated = [...form.skills];
    updated[index] = suggestion;
    setForm((prev) => ({ ...prev, skills: updated }));
    setSkillSuggestions([]);
    setActiveSkillIndex(null);
    if (index === form.skills.length - 1) {
      setTimeout(() => setForm((prev) => ({ ...prev, skills: [...prev.skills, ""] })), 100);
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSkillSuggestions([]);
      if (form.skills[form.skills.length - 1].trim()) {
        addSkillField();
        setTimeout(() => document.getElementById(`skill-${form.skills.length}`)?.focus(), 0);
      }
    }
    if (e.key === "Escape") { setSkillSuggestions([]); setActiveSkillIndex(null); }
  };

  const addSkillField = () => setForm((prev) => ({ ...prev, skills: [...prev.skills, ""] }));

  const removeSkillField = (index) => {
    const updated = [...form.skills];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, skills: updated }));
    setSkillSuggestions([]);
    setActiveSkillIndex(null);
  };

  // Certifications
  const handleCertificationChange = (index, value) => {
    const updated = [...form.certifications];
    updated[index] = value;
    setForm({ ...form, certifications: updated });
    setErrors((prev) => {
      const nextCertErrors = [...prev.certifications];
      nextCertErrors[index] = value.includes(",")
        ? "Cannot add multiple certifications. Add them one at a time."
        : "";
      return { ...prev, certifications: nextCertErrors };
    });
  };

  const addCertificationField = () => {
    if (!form.certifications[form.certifications.length - 1].trim()) return;
    setForm({ ...form, certifications: [...form.certifications, ""] });
    setErrors((prev) => ({ ...prev, certifications: [...prev.certifications, ""] }));
  };

  const removeCertificationField = (indexToRemove) => {
    if (form.certifications.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== indexToRemove),
    }));
    setErrors((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleCertificationKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (form.certifications[form.certifications.length - 1].trim()) {
        addCertificationField();
        setTimeout(() => document.getElementById(`certification-${form.certifications.length}`)?.focus(), 0);
      }
    }
  };

  // Analyze
  const analyzeForm = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const nextErrors = {
        experience: "",
        education: "",
        customEducation: "",
        skills: form.skills.map(() => ""),
        certifications: form.certifications.map(() => ""),
        completedProjects: "",
        desiredJobRoles: "",
        currentCity: "",
        previousJobTitle: "",
      };

      const experienceValue = Number(form.experience);

      if (!form.experience || Number.isNaN(experienceValue)) nextErrors.experience = "Years of Experience must be numeric";
      if (experienceValue > 60) nextErrors.experience = "Years of Experience cannot be more than 60";

      // Skills — ignore blank fields, only check if at least one filled
      const filledSkills = form.skills.filter(s => s.trim());
      if (!filledSkills.length) {
        nextErrors.skills = ["At least one skill is required"];
      } else {
        nextErrors.skills = form.skills.map((s) =>
          s.includes(",") ? "Cannot add multiple skills. Add them one at a time." : ""
        );
      }

      if (!form.education) nextErrors.education = "Education Level is required";
      if (form.education === "Other" && !form.customEducation.trim()) nextErrors.customEducation = "Please specify your education level";

      // Certifications — ignore blank fields, only check if at least one filled
      const filledCerts = form.certifications.filter(c => c.trim());
      if (!filledCerts.length) {
        nextErrors.certifications = ["At least one certification is required"];
      } else {
        nextErrors.certifications = form.certifications.map((c) =>
          c.includes(",") ? "Cannot add multiple certifications. Add them one at a time." : ""
        );
      }

      if (!form.completedProjects.trim()) nextErrors.completedProjects = "Completed Projects is required";
      if (!form.desiredJobRoles.trim()) nextErrors.desiredJobRoles = "Desired Job Roles is required";
      if (!form.currentCity.trim()) nextErrors.currentCity = "Current City is required";
      if (!form.previousJobTitle.trim()) nextErrors.previousJobTitle = "Previous Job Title is required";

      const hasErrors =
        !!nextErrors.experience || !!nextErrors.education || !!nextErrors.customEducation ||
        nextErrors.skills.some(Boolean) || nextErrors.certifications.some(Boolean) ||
        !!nextErrors.completedProjects || !!nextErrors.desiredJobRoles ||
        !!nextErrors.currentCity || !!nextErrors.previousJobTitle;

      setErrors(nextErrors);
      if (hasErrors) { setScore(null); setSuggestions([]); return; }

      const payload = {
        name: user?.username || "",
        skills: form.skills.map((item) => item.trim()).filter(Boolean),
        experience: experienceValue,
        education: form.education,
        customEducation: form.customEducation,
        certifications: form.certifications.map((item) => item.trim()).filter(Boolean),
        completedProjects: form.completedProjects,
        desiredJobRoles: form.desiredJobRoles,
        currentCity: form.currentCity,
        previousJobTitle: form.previousJobTitle,
      };

      const { data } = await API.post("/resume/analyze", payload);
      setScore(data.score);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setFormData(payload);
      setProfileType(data.profileType || null);
      setScoreBreakdown(data.scoreBreakdown || null);
      setStrongPoints(data.strongPoints || []);
      setApiError("");
    } catch (err) {
      console.error("Resume analysis error:", err);
      setScore(null);
      setSuggestions([]);
      setApiError(err?.response?.data?.message || "We could not analyze your resume details right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = (() => {
    const experienceValue = Number(form.experience);
    const baseValid =
      form.experience.trim() !== "" && !Number.isNaN(experienceValue) && experienceValue <= 60 &&
      form.education.trim() !== "" &&
      (form.education !== "Other" || form.customEducation.trim() !== "") &&
      form.skills.some((s) => s.trim() !== "") &&
      form.certifications.some((c) => c.trim() !== "") &&
      form.completedProjects.trim() !== "" &&
      form.desiredJobRoles.trim() !== "" &&
      form.currentCity.trim() !== "" &&
      form.previousJobTitle.trim() !== "";
    return baseValid;
  })();

  // Parsed from PDF badge component
  const ParsedBadge = ({ field }) => {
    if (!parsedBadges[field]) return null;
    return (
      <span
        style={{
          fontSize: "10px",
          color: "#16a34a",
          background: "#dcfce7",
          border: "1px solid #86efac",
          borderRadius: "4px",
          padding: "2px 6px",
          marginLeft: "8px",
          fontWeight: 600,
        }}
      >
        📄 Parsed from PDF
      </span>
    );
  };

  return (
    <div className="dashboard-panel dashboard-panel-accent">
      <div className="dashboard-panel-header">
        <span className="dashboard-panel-icon">AI</span>
        <div>
          <h2>Build Resume Details Manually</h2>
          <p>Add the essentials and get feedback without uploading a file.</p>
        </div>
      </div>

      {apiError && (
        <div style={{ color: "#b42318", fontWeight: 600, marginBottom: "12px", padding: "8px 12px", background: "#fef2f2", borderRadius: "6px" }}>
          {apiError}
        </div>
      )}

      <div className="dashboard-form-grid">

        {/* Experience */}
        <div className="dashboard-field">
          <label htmlFor="experience" style={{ display: "flex", alignItems: "center" }}>
            Years of Experience
            <ParsedBadge field="experience" />
          </label>
          <input id="experience" name="experience" type="text" inputMode="numeric" pattern="[0-9]*"
            placeholder="e.g. 2" className="dashboard-input" value={form.experience} maxLength={2} onChange={handleChange} />
          {errors.experience && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.experience}</small>}
        </div>

        {/* Education */}
        <div className="dashboard-field">
          <label htmlFor="education" style={{ display: "flex", alignItems: "center" }}>
            Education Level
            <ParsedBadge field="education" />
          </label>
          <select id="education" name="education" className="dashboard-input" onChange={handleChange} value={form.education}>
            <option value="" disabled>Select education level</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's">Bachelor&apos;s</option>
            <option value="Master's">Master&apos;s</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>
          {errors.education && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.education}</small>}
        </div>

        {form.education === "Other" && (
          <div className="dashboard-field">
            <label htmlFor="customEducation">Please Specify Education</label>
            <input id="customEducation" name="customEducation" type="text" placeholder="Enter your education level"
              className="dashboard-input" value={form.customEducation} maxLength={100} onChange={handleChange} />
            {errors.customEducation && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.customEducation}</small>}
          </div>
        )}

        {/* Desired Role */}
        <div className="dashboard-field">
          <label htmlFor="desiredJobRoles" style={{ display: "flex", alignItems: "center" }}>
            Desired Job Roles
            <ParsedBadge field="desiredJobRoles" />
          </label>
          <input id="desiredJobRoles" name="desiredJobRoles" type="text" placeholder="e.g. Data Scientist"
            className="dashboard-input" value={form.desiredJobRoles} maxLength={120} onChange={handleChange} />
          {errors.desiredJobRoles && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.desiredJobRoles}</small>}
        </div>

        {/* Projects */}
        <div className="dashboard-field dashboard-field-full">
          <label htmlFor="completedProjects" style={{ display: "flex", alignItems: "center" }}>
            Completed Projects
            <ParsedBadge field="completedProjects" />
          </label>
          <input id="completedProjects" name="completedProjects" type="text" placeholder="Describe your Project"
            className="dashboard-input" value={form.completedProjects} maxLength={300} onChange={handleChange} />
          {errors.completedProjects && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.completedProjects}</small>}
        </div>

        {/* Skills with Autocomplete */}
        <div className="dashboard-field dashboard-field-full">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
            <label htmlFor="skill-0">Skills</label>
            <button type="button" onClick={addSkillField}
              disabled={form.skills.length > 0 && !form.skills[form.skills.length - 1].trim()}
              style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(15, 23, 42, 0.25)",
                background: "#ffffff", color: "#0f52ba", fontSize: "18px", fontWeight: "700",
                cursor: form.skills.length > 0 && !form.skills[form.skills.length - 1].trim() ? "not-allowed" : "pointer",
                lineHeight: 1, opacity: form.skills.length > 0 && !form.skills[form.skills.length - 1].trim() ? 0.5 : 1 }}
              aria-label="Add skill field">+
            </button>
          </div>

          {form.skills.map((skill, index) => (
            <div key={index} style={{ marginBottom: "8px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input id={`skill-${index}`} name={`skill-${index}`} type="text"
                  placeholder={`e.g. Skill ${index + 1}`} className="dashboard-input" style={{ flex: 1 }}
                  value={skill} maxLength={100}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => setTimeout(() => { setSkillSuggestions([]); setActiveSkillIndex(null); }, 150)}
                  autoComplete="off" />
                {form.skills.length > 1 && (
                  <button type="button" onClick={() => removeSkillField(index)}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(15, 23, 42, 0.25)",
                      background: "#ffffff", color: "#b42318", fontSize: "20px", fontWeight: "700",
                      cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    aria-label="Remove skill field">-
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {activeSkillIndex === index && skillSuggestions.length > 0 && (
                <div ref={dropdownRef} style={{
                  position: "absolute", top: "100%", left: 0, right: "44px",
                  background: "#ffffff", border: "1px solid #d1d5db", borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden"
                }}>
                  {skillSuggestions.map((suggestion, i) => (
                    <div key={i} onMouseDown={() => handleSuggestionClick(index, suggestion)}
                      style={{ padding: "10px 14px", cursor: "pointer", fontSize: "14px",
                        borderBottom: i < skillSuggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                        textTransform: "capitalize", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {errors.skills?.[index] && (
                <small style={{ color: "#b42318", fontWeight: 600, display: "block", marginTop: "4px" }}>
                  {errors.skills[index]}
                </small>
              )}
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="dashboard-field dashboard-field-full">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
            <label htmlFor="certification-0">Full Name of the Certifications You Have</label>
            <button type="button" onClick={addCertificationField}
              disabled={!form.certifications[form.certifications.length - 1].trim()}
              style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(15, 23, 42, 0.25)",
                background: "#ffffff", color: "#0f52ba", fontSize: "18px", fontWeight: "700",
                cursor: !form.certifications[form.certifications.length - 1].trim() ? "not-allowed" : "pointer",
                lineHeight: 1, opacity: !form.certifications[form.certifications.length - 1].trim() ? 0.5 : 1 }}
              aria-label="Add certification field">+
            </button>
          </div>

          {form.certifications.map((certification, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input id={`certification-${index}`} name={`certification-${index}`} type="text"
                  placeholder={`e.g. Certification ${index + 1} or type N/A if none`} className="dashboard-input" style={{ flex: 1 }}
                  value={certification} maxLength={120}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  onKeyDown={handleCertificationKeyDown} />
                {form.certifications.length > 1 && (
                  <button type="button" onClick={() => removeCertificationField(index)}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(15, 23, 42, 0.25)",
                      background: "#ffffff", color: "#b42318", fontSize: "20px", fontWeight: "700",
                      cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    aria-label="Remove certification field">-
                  </button>
                )}
              </div>
              {errors.certifications?.[index] && (
                <small style={{ color: "#b42318", fontWeight: 600, display: "block", marginTop: "4px" }}>
                  {errors.certifications[index]}
                </small>
              )}
            </div>
          ))}
          
          <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic" }}>
           Don't have certifications yet? Type "N/A" in the box above
          </p>
        </div>

        {/* Current City */}
        <div className="dashboard-field">
          <label htmlFor="currentCity" style={{ display: "flex", alignItems: "center" }}>
            Current City
            <ParsedBadge field="currentCity" />
          </label>
          <input id="currentCity" name="currentCity" type="text" placeholder="e.g. Vadodara"
            className="dashboard-input" value={form.currentCity} maxLength={80} onChange={handleChange} />
          {errors.currentCity && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.currentCity}</small>}
        </div>

        {/* Previous Job Title */}
        <div className="dashboard-field">
          <label htmlFor="previousJobTitle" style={{ display: "flex", alignItems: "center" }}>
            Previous Job Title
            <ParsedBadge field="previousJobTitle" />
          </label>
          <input id="previousJobTitle" name="previousJobTitle" type="text" placeholder="e.g. Backend Developer or type N/A if fresher"
            className="dashboard-input" value={form.previousJobTitle} maxLength={120} onChange={handleChange} />
          {errors.previousJobTitle && <small style={{ color: "#b42318", fontWeight: 600 }}>{errors.previousJobTitle}</small>}
          <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic" }}>
            Don't have previous job experience? Type "N/A" in the box above
          </p>
        </div>

      </div>

      <button onClick={analyzeForm} className="dashboard-button" disabled={isLoading}>
        {isLoading && <span className="loading-spinner"></span>}
        {isLoading ? "Analyzing..." : "Analyze Details"}
      </button>
    </div>
  );
}
