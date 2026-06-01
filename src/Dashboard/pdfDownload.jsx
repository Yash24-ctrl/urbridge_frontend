import jsPDF from "jspdf";
import brandLogoUrl from "../Icon.png";

const PAGE = {
  width: 210,
  height: 297,
  margin: 12,
};

const COLORS = {
  ink: [12, 23, 44],
  slate: [81, 96, 125],
  muted: [116, 129, 154],
  border: [221, 227, 236],
  panel: [247, 249, 252],
  lightCard: [248, 250, 253],
  softBlue: [236, 242, 255],
  paleBlue: [242, 246, 255],
  paleRed: [254, 239, 239],
  blue: [29, 78, 216],
  deepBlue: [15, 31, 66],
  navy: [7, 27, 74],
  navySoft: [232, 238, 249],
  navyPanel: [246, 248, 252],
  sidebarBlue: [44, 73, 170],
  sidebarCard: [66, 94, 191],
  sidebarSoft: [93, 116, 201],
  green: [22, 163, 74],
  amber: [217, 119, 6],
  red: [239, 68, 68],
  white: [255, 255, 255],
};

const ACTION_PRIORITIES = [
  "Fix Now",
  "Fix Now",
  "Improve Soon",
  "Improve Soon",
  "Improve Soon",
  "Polish Later",
  "Polish Later",
];

const SKILL_TRENDS = {
  python: { trend: "Rising", color: [22, 163, 74] },
  javascript: { trend: "Rising", color: [22, 163, 74] },
  typescript: { trend: "Rising", color: [22, 163, 74] },
  react: { trend: "High Demand", color: [29, 78, 216] },
  nodejs: { trend: "High Demand", color: [29, 78, 216] },
  "node.js": { trend: "High Demand", color: [29, 78, 216] },
  sql: { trend: "Essential", color: [44, 73, 170] },
  aws: { trend: "High Demand", color: [29, 78, 216] },
  docker: { trend: "Rising", color: [22, 163, 74] },
  kubernetes: { trend: "Rising", color: [22, 163, 74] },
  "machine learning": { trend: "Hot", color: [217, 119, 6] },
  "deep learning": { trend: "Hot", color: [217, 119, 6] },
  tensorflow: { trend: "Hot", color: [217, 119, 6] },
  pytorch: { trend: "Hot", color: [217, 119, 6] },
  "data science": { trend: "High Demand", color: [29, 78, 216] },
  pandas: { trend: "Essential", color: [44, 73, 170] },
  numpy: { trend: "Essential", color: [44, 73, 170] },
  flask: { trend: "Stable", color: [81, 96, 125] },
  django: { trend: "Stable", color: [81, 96, 125] },
  java: { trend: "Stable", color: [81, 96, 125] },
  "c++": { trend: "Stable", color: [81, 96, 125] },
  git: { trend: "Essential", color: [44, 73, 170] },
  excel: { trend: "Essential", color: [44, 73, 170] },
  "power bi": { trend: "Rising", color: [22, 163, 74] },
  tableau: { trend: "Rising", color: [22, 163, 74] },
  figma: { trend: "Rising", color: [22, 163, 74] },
  "artificial neural network": { trend: "Hot", color: [217, 119, 6] },
  "natural language processing": { trend: "Hot", color: [217, 119, 6] },
  nlp: { trend: "Hot", color: [217, 119, 6] },
  "computer vision": { trend: "Hot", color: [217, 119, 6] },
  seaborn: { trend: "Stable", color: [81, 96, 125] },
  matplotlib: { trend: "Stable", color: [81, 96, 125] },
};

const INDIA_ROLE_LIBRARY = {
  "software engineer": {
    label: "Software Engineer",
    industry: "Technology",
    coreSkills: ["Data Structures", "Algorithms", "Design Patterns", "Git", "SQL", "OOP", "Testing", "API Development", "System Design", "Debugging"],
    certifications: ["DSA portfolio", "AWS Cloud Practitioner", "GitHub project portfolio"],
    educationFocus: "CS fundamentals, OOP, DBMS, operating systems, and data structures",
    projectFocus: "features, APIs, tests, deployment, performance, and user impact",
  },
  "frontend developer": {
    label: "Frontend Developer",
    industry: "Technology",
    coreSkills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Responsive Design", "Accessibility", "State Management", "Testing", "Performance Optimization"],
    certifications: ["Meta Front-End Developer", "Google UX Design", "JavaScript certification"],
    educationFocus: "web development, UI engineering, accessibility, and browser fundamentals",
    projectFocus: "responsive UI, reusable components, API integration, accessibility, and Lighthouse scores",
  },
  "backend developer": {
    label: "Backend Developer",
    industry: "Technology",
    coreSkills: ["Node.js", "Express", "REST APIs", "SQL", "MongoDB", "Authentication", "Docker", "Redis", "System Design", "Testing"],
    certifications: ["AWS Cloud Practitioner", "MongoDB Developer", "Postman API certification"],
    educationFocus: "DBMS, networking, operating systems, APIs, and distributed systems",
    projectFocus: "secure APIs, database design, authentication, caching, tests, and deployment",
  },
  "full stack developer": {
    label: "Full Stack Developer",
    industry: "Technology",
    coreSkills: ["React", "Node.js", "Express", "SQL", "MongoDB", "REST APIs", "Authentication", "Git", "Docker", "Deployment"],
    certifications: ["MERN stack certification", "AWS Cloud Practitioner", "GitHub project portfolio"],
    educationFocus: "full-stack web development, DBMS, APIs, and deployment basics",
    projectFocus: "end-to-end apps with frontend, backend, database, auth, deployment, and measurable users",
  },
  "data analyst": {
    label: "Data Analyst",
    industry: "Analytics",
    coreSkills: ["SQL", "Excel", "Power BI", "Tableau", "Python", "Statistics", "Dashboards", "Data Cleaning", "Reporting", "Business Insights"],
    certifications: ["Google Data Analytics", "Microsoft Power BI PL-300", "Excel Advanced"],
    educationFocus: "statistics, business analytics, Excel, SQL, and visualization coursework",
    projectFocus: "business dashboards, KPI tracking, data cleaning, insights, and decision impact",
  },
  "data scientist": {
    label: "Data Scientist",
    industry: "AI and Analytics",
    coreSkills: ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Data Visualization", "Model Evaluation", "Feature Engineering"],
    certifications: ["IBM Data Science", "Google Advanced Data Analytics", "Kaggle portfolio"],
    educationFocus: "statistics, machine learning, linear algebra, Python, and data mining",
    projectFocus: "model accuracy, feature engineering, dataset size, validation method, and business result",
  },
  "machine learning engineer": {
    label: "Machine Learning Engineer",
    industry: "AI and Analytics",
    coreSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "MLOps", "Docker", "Model Deployment", "APIs", "AWS"],
    certifications: ["TensorFlow Developer", "AWS Machine Learning", "MLOps specialization"],
    educationFocus: "ML algorithms, model deployment, cloud basics, statistics, and software engineering",
    projectFocus: "training pipeline, model serving, monitoring, latency, accuracy, and retraining workflow",
  },
  "devops engineer": {
    label: "DevOps Engineer",
    industry: "Cloud and Infrastructure",
    coreSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Monitoring", "Shell Scripting", "GitHub Actions", "Networking"],
    certifications: ["AWS Solutions Architect", "CKA or CKAD", "HashiCorp Terraform Associate"],
    educationFocus: "Linux, networking, cloud computing, automation, and infrastructure security",
    projectFocus: "CI/CD pipelines, uptime, deployment frequency, rollback, monitoring, and cost savings",
  },
  "cloud engineer": {
    label: "Cloud Engineer",
    industry: "Cloud and Infrastructure",
    coreSkills: ["AWS", "Azure", "GCP", "Linux", "Networking", "Docker", "Kubernetes", "Terraform", "Security", "Monitoring"],
    certifications: ["AWS Solutions Architect", "Microsoft Azure AZ-104", "Google Associate Cloud Engineer"],
    educationFocus: "cloud architecture, networking, Linux, security, and automation",
    projectFocus: "cloud migration, architecture diagrams, cost optimization, uptime, and security controls",
  },
  "cybersecurity analyst": {
    label: "Cybersecurity Analyst",
    industry: "Cybersecurity",
    coreSkills: ["Network Security", "SIEM", "Vulnerability Assessment", "Incident Response", "Linux", "OWASP", "Risk Assessment", "Firewalls", "Python", "Compliance"],
    certifications: ["Security+", "CEH", "Google Cybersecurity"],
    educationFocus: "networking, operating systems, security fundamentals, and compliance",
    projectFocus: "vulnerability reports, incident timelines, controls applied, risk reduction, and tool evidence",
  },
  "qa engineer": {
    label: "QA Engineer",
    industry: "Technology",
    coreSkills: ["Manual Testing", "Automation Testing", "Selenium", "API Testing", "Postman", "Test Cases", "Bug Reporting", "Regression Testing", "SQL", "Agile"],
    certifications: ["ISTQB Foundation", "Selenium automation", "Postman API certification"],
    educationFocus: "software testing, SDLC, SQL basics, automation, and quality processes",
    projectFocus: "test coverage, defect leakage, automation scripts, API testing, and release quality",
  },
  "business analyst": {
    label: "Business Analyst",
    industry: "Business and Consulting",
    coreSkills: ["Requirement Gathering", "SQL", "Excel", "Power BI", "Process Mapping", "Stakeholder Management", "BRD", "User Stories", "UAT", "Agile"],
    certifications: ["IIBA ECBA", "Power BI PL-300", "Agile or Scrum certification"],
    educationFocus: "business analytics, process management, statistics, and domain coursework",
    projectFocus: "requirements, process improvements, dashboards, UAT results, and business impact",
  },
  "product manager": {
    label: "Product Manager",
    industry: "Product and Business",
    coreSkills: ["Product Strategy", "Roadmapping", "User Research", "Analytics", "Prioritization", "A/B Testing", "Agile", "Stakeholder Management", "SQL", "Go-to-Market"],
    certifications: ["Product management certification", "Scrum Product Owner", "Google Analytics"],
    educationFocus: "product strategy, analytics, user research, business, and technology fundamentals",
    projectFocus: "problem discovery, roadmap choices, adoption, retention, revenue, and customer outcomes",
  },
  "digital marketing specialist": {
    label: "Digital Marketing Specialist",
    industry: "Marketing",
    coreSkills: ["SEO", "Google Ads", "Meta Ads", "Google Analytics", "Content Marketing", "Email Marketing", "Social Media", "Keyword Research", "Conversion Rate Optimization", "Reporting"],
    certifications: ["Google Ads", "Google Analytics", "HubSpot Content Marketing"],
    educationFocus: "marketing analytics, consumer behavior, campaign management, and channel strategy",
    projectFocus: "campaign spend, leads, CAC, CTR, conversion rate, revenue, and channel performance",
  },
  "sales manager": {
    label: "Sales Manager",
    industry: "Sales",
    coreSkills: ["Lead Generation", "CRM", "Negotiation", "Pipeline Management", "B2B Sales", "Client Relationship", "Sales Forecasting", "Market Research", "Presentation", "Revenue Growth"],
    certifications: ["HubSpot Sales", "Salesforce CRM", "Negotiation training"],
    educationFocus: "sales, marketing, CRM, negotiation, and market research",
    projectFocus: "pipeline value, conversion rate, revenue, repeat business, and territory growth",
  },
  "hr manager": {
    label: "HR Manager",
    industry: "Human Resources",
    coreSkills: ["Recruitment", "HR Operations", "Employee Engagement", "Payroll", "Performance Management", "HRMS", "Onboarding", "Compliance", "Training", "People Analytics"],
    certifications: ["SHRM basics", "HR Analytics", "Payroll and compliance certification"],
    educationFocus: "HRM, labor law, organizational behavior, payroll, and people analytics",
    projectFocus: "time-to-hire, retention, engagement score, onboarding speed, and compliance outcomes",
  },
  "accountant": {
    label: "Accountant",
    industry: "Finance and Accounting",
    coreSkills: ["Tally", "GST", "TDS", "Excel", "Accounts Payable", "Accounts Receivable", "Bank Reconciliation", "Financial Reporting", "Tax Filing", "Audit Support"],
    certifications: ["Tally Prime", "GST certification", "Advanced Excel"],
    educationFocus: "accounting, taxation, audit, financial reporting, and commerce fundamentals",
    projectFocus: "month-end closing, reconciliation accuracy, tax filing, audit support, and process improvement",
  },
  "financial analyst": {
    label: "Financial Analyst",
    industry: "Finance",
    coreSkills: ["Excel", "Financial Modeling", "Valuation", "Forecasting", "Power BI", "SQL", "Budgeting", "Variance Analysis", "Accounting", "Reporting"],
    certifications: ["CFA Level 1", "Financial Modeling", "Advanced Excel"],
    educationFocus: "finance, accounting, statistics, economics, and valuation",
    projectFocus: "forecast accuracy, variance analysis, dashboards, valuation model, and decision impact",
  },
  "project manager": {
    label: "Project Manager",
    industry: "Operations and Delivery",
    coreSkills: ["Project Planning", "Agile", "Scrum", "Risk Management", "Budgeting", "Stakeholder Management", "Jira", "MS Project", "Reporting", "Team Leadership"],
    certifications: ["PMP", "CAPM", "Scrum Master"],
    educationFocus: "project management, operations, risk, budgeting, and delivery governance",
    projectFocus: "delivery timeline, budget control, risk mitigation, team size, and stakeholder outcomes",
  },
  "operations manager": {
    label: "Operations Manager",
    industry: "Operations",
    coreSkills: ["Process Improvement", "Vendor Management", "Inventory Management", "Excel", "KPI Reporting", "SOPs", "Quality Control", "Team Management", "Cost Optimization", "Logistics"],
    certifications: ["Lean Six Sigma", "Supply Chain certification", "Advanced Excel"],
    educationFocus: "operations, supply chain, quality, analytics, and process management",
    projectFocus: "cost savings, turnaround time, SLA, inventory accuracy, and quality improvements",
  },
  "civil engineer": {
    label: "Civil Engineer",
    industry: "Construction and Infrastructure",
    coreSkills: ["AutoCAD", "Site Supervision", "Estimation", "BOQ", "Project Planning", "STAAD Pro", "Quantity Surveying", "Quality Control", "Safety", "MS Project"],
    certifications: ["AutoCAD Civil", "STAAD Pro", "Construction safety"],
    educationFocus: "structural engineering, surveying, estimation, safety, and construction management",
    projectFocus: "site area, budget, materials, safety compliance, drawings, and completion timeline",
  },
  "mechanical engineer": {
    label: "Mechanical Engineer",
    industry: "Manufacturing and Engineering",
    coreSkills: ["AutoCAD", "SolidWorks", "Manufacturing", "Quality Control", "Thermodynamics", "Maintenance", "Lean Manufacturing", "Production Planning", "CNC", "Root Cause Analysis"],
    certifications: ["SolidWorks", "AutoCAD Mechanical", "Lean Six Sigma"],
    educationFocus: "design, manufacturing, thermodynamics, maintenance, and quality systems",
    projectFocus: "design change, production efficiency, downtime reduction, quality metrics, and cost savings",
  },
  "electrical engineer": {
    label: "Electrical Engineer",
    industry: "Engineering and Energy",
    coreSkills: ["Circuit Design", "PLC", "SCADA", "Power Systems", "AutoCAD Electrical", "Maintenance", "Troubleshooting", "Control Systems", "Safety", "MATLAB"],
    certifications: ["PLC and SCADA", "AutoCAD Electrical", "Electrical safety"],
    educationFocus: "power systems, control systems, machines, electronics, and safety standards",
    projectFocus: "load calculations, panels, automation, downtime reduction, safety, and commissioning results",
  },
  "nurse": {
    label: "Nurse",
    industry: "Healthcare",
    coreSkills: ["Patient Care", "Medication Administration", "Vital Signs", "Infection Control", "Emergency Care", "Clinical Documentation", "Patient Education", "Ward Management", "Care Plan Execution", "BLS"],
    certifications: ["BLS", "ACLS", "Infection control"],
    educationFocus: "nursing qualification, clinical rotations, patient care, and license details",
    projectFocus: "patient load, ward type, procedures supported, safety practices, and care outcomes",
  },
  "doctor": {
    label: "Doctor",
    industry: "Healthcare",
    coreSkills: ["Diagnosis", "Patient Care", "Clinical Documentation", "Emergency Medicine", "Treatment Planning", "Medical Ethics", "Clinical Decision Making", "Case Management", "Procedures", "Research"],
    certifications: ["Medical registration", "BLS or ACLS", "specialty training"],
    educationFocus: "medical degree, registration, internship, residency, and specialization",
    projectFocus: "case volume, procedures, patient outcomes, research, audits, and specialty exposure",
  },
  "pharmacist": {
    label: "Pharmacist",
    industry: "Healthcare",
    coreSkills: ["Pharmacology", "Prescription Review", "Drug Dispensing", "Inventory Management", "Patient Counseling", "Regulatory Compliance", "Billing", "Clinical Knowledge", "Documentation", "Quality Control"],
    certifications: ["Pharmacy registration", "Pharmacovigilance", "Clinical pharmacy"],
    educationFocus: "pharmacy degree, registration, pharmacology, dispensing, and compliance",
    projectFocus: "dispensing accuracy, inventory control, patient counseling, compliance, and audit results",
  },
  "teacher": {
    label: "Teacher",
    industry: "Education",
    coreSkills: ["Lesson Planning", "Classroom Management", "Subject Knowledge", "Assessment", "Learning Outcomes", "EdTech", "Curriculum Development", "Student Engagement", "Parent Engagement", "Special Education"],
    certifications: ["B.Ed", "CTET or state TET", "EdTech certification"],
    educationFocus: "teaching qualification, subject specialization, pedagogy, and certifications",
    projectFocus: "student outcomes, lesson plans, assessment improvement, classroom size, and EdTech use",
  },
  "graphic designer": {
    label: "Graphic Designer",
    industry: "Creative",
    coreSkills: ["Adobe Photoshop", "Illustrator", "Figma", "Branding", "Typography", "Layout Design", "Social Media Design", "UI Design", "Color Theory", "Portfolio"],
    certifications: ["Adobe certification", "Figma course", "UI design portfolio"],
    educationFocus: "design fundamentals, typography, branding, UI basics, and visual systems",
    projectFocus: "before-after designs, brand assets, engagement metrics, portfolio links, and client outcomes",
  },
  "content writer": {
    label: "Content Writer",
    industry: "Media and Marketing",
    coreSkills: ["SEO Writing", "Copywriting", "Research", "Editing", "Content Strategy", "WordPress", "Keyword Research", "Grammar", "Social Media", "Analytics"],
    certifications: ["HubSpot Content Marketing", "SEO certification", "Google Analytics"],
    educationFocus: "journalism, marketing, research, SEO writing, and editorial planning",
    projectFocus: "traffic growth, ranking keywords, engagement, published links, and conversion impact",
  },
  "customer service executive": {
    label: "Customer Service Executive",
    industry: "Customer Support",
    coreSkills: ["Customer Support", "CRM", "Call Quality", "Root Cause Resolution", "Ticketing Tools", "Escalation Handling", "SLA Management", "Email Support", "Call Handling", "Product Knowledge"],
    certifications: ["CRM workflow training", "Customer service certification", "Zendesk support workflow"],
    educationFocus: "CRM workflows, service quality, ticketing systems, and support operations",
    projectFocus: "CSAT, first response time, resolution time, ticket volume, and escalation reduction",
  },
  generic: {
    label: "Professional",
    industry: "General",
    coreSkills: [],
    certifications: [],
    educationFocus: "coursework and credentials directly requested in the target job role",
    projectFocus: "field tools, resume evidence, and target-job proof",
  },
};

const ROLE_ALIASES = {
  sde: "software engineer",
  "software developer": "software engineer",
  "java developer": "backend developer",
  "python developer": "backend developer",
  "mern developer": "full stack developer",
  "react developer": "frontend developer",
  "web developer": "frontend developer",
  "ui developer": "frontend developer",
  "ml engineer": "machine learning engineer",
  "ai engineer": "machine learning engineer",
  "cloud engineer": "cloud engineer",
  "security analyst": "cybersecurity analyst",
  "cyber security": "cybersecurity analyst",
  "quality analyst": "qa engineer",
  "test engineer": "qa engineer",
  "automation tester": "qa engineer",
  "marketing manager": "digital marketing specialist",
  "seo executive": "digital marketing specialist",
  "business development": "sales manager",
  bdm: "sales manager",
  "human resources": "hr manager",
  "talent acquisition": "hr manager",
  recruiter: "hr manager",
  "finance analyst": "financial analyst",
  "accounts executive": "accountant",
  "chartered accountant": "accountant",
  ca: "accountant",
  "site engineer": "civil engineer",
  "medical technician": "nurse",
  educator: "teacher",
  "video editor": "graphic designer",
  "support executive": "customer service executive",
  "customer support": "customer service executive",
};

const DISALLOWED_GENERIC_SKILLS = new Set([
  "communication",
  "problem solving",
  "team collaboration",
]);

function getSkillTrend(skill) {
  const key = String(skill || "").toLowerCase().trim();
  return SKILL_TRENDS[key] || { trend: "Relevant", color: [81, 96, 125] };
}

function safeArray(values) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeComparable(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bnode\s*\.?\s*js\b/g, "node.js")
    .replace(/\breact\s*\.?\s*js\b/g, "react")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactComparable(value = "") {
  return normalizeComparable(value).replace(/[^a-z0-9+#]/g, "");
}

function uniqueByComparable(values = []) {
  const seen = new Set();
  return safeArray(values).filter((value) => {
    const key = compactComparable(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isFieldSpecificSkill(value = "") {
  return !DISALLOWED_GENERIC_SKILLS.has(normalizeComparable(value));
}

function fieldSpecificSkills(values = []) {
  return uniqueByComparable(values).filter(isFieldSpecificSkill);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatReportDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatFullReportDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function normalizedRoleIncludes(normalizedRole, term) {
  const normalizedTerm = normalizeComparable(term);
  if (!normalizedRole || !normalizedTerm) return false;

  if (normalizedTerm.length <= 3) {
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedTerm)}(\\s|$)`).test(normalizedRole);
  }

  return normalizedRole.includes(normalizedTerm);
}

function skillMatches(candidateSkill, requiredSkill) {
  const candidate = normalizeComparable(candidateSkill);
  const required = normalizeComparable(requiredSkill);
  if (!candidate || !required) return false;

  const compactCandidate = compactComparable(candidate);
  const compactRequired = compactComparable(required);
  if (compactCandidate === compactRequired) return true;

  return (
    (required.length >= 4 && candidate.includes(required)) ||
    (candidate.length >= 4 && required.includes(candidate))
  );
}

function resolveRoleProfile(targetRole = "") {
  const normalizedRole = normalizeComparable(targetRole);
  const sortedAliases = Object.entries(ROLE_ALIASES).sort((a, b) => b[0].length - a[0].length);
  const aliasMatch = sortedAliases.find(([alias]) => normalizedRoleIncludes(normalizedRole, alias));
  const directMatch = Object.keys(INDIA_ROLE_LIBRARY)
    .filter((role) => role !== "generic")
    .sort((a, b) => b.length - a.length)
    .find((role) => normalizedRoleIncludes(normalizedRole, role));

  const key = aliasMatch?.[1] || directMatch || "generic";
  const profile = INDIA_ROLE_LIBRARY[key] || INDIA_ROLE_LIBRARY.generic;
  return {
    key,
    ...profile,
    label: key === "generic" && targetRole ? titleCase(targetRole) : profile.label,
  };
}

function getProfileMissingSkills(resumeSkills = [], roleProfile = INDIA_ROLE_LIBRARY.generic) {
  return fieldSpecificSkills(roleProfile.coreSkills).filter(
    (requiredSkill) => !safeArray(resumeSkills).some((skill) => skillMatches(skill, requiredSkill))
  );
}

function getProfileMatchedSkills(resumeSkills = [], roleProfile = INDIA_ROLE_LIBRARY.generic) {
  return fieldSpecificSkills(roleProfile.coreSkills).filter(
    (requiredSkill) => safeArray(resumeSkills).some((skill) => skillMatches(skill, requiredSkill))
  );
}

function formatCompactList(values = [], limit = 4, fallback = "role keywords") {
  const list = fieldSpecificSkills(values).slice(0, limit);
  return list.length > 0 ? list.join(", ") : fallback;
}

function getEducationLabel(formData = {}) {
  if (formData.education === "Other") {
    return String(formData.customEducation || "Other").trim() || "Other";
  }
  return String(formData.education || "Bachelor's").trim() || "Bachelor's";
}

function getRoleLabel(formData = {}, diagnostics = {}) {
  return String(
    diagnostics.role || formData.desiredJobRoles || formData.desiredJobRole || "Professional"
  ).trim() || "Professional";
}

function getScoreTone(score) {
  if (score >= 80) {
    return {
      label: "RECRUITER-READY",
      accent: COLORS.green,
      chipFill: [220, 252, 231],
    };
  }
  if (score >= 65) {
    return {
      label: "PROMISING",
      accent: COLORS.blue,
      chipFill: [219, 234, 254],
    };
  }
  if (score >= 45) {
    return {
      label: "IMPROVE SOON",
      accent: COLORS.amber,
      chipFill: [254, 243, 199],
    };
  }
  return {
    label: "NEEDS WORK",
    accent: COLORS.red,
    chipFill: [254, 226, 226],
  };
}

function analyzeProjectText(projectText = "", resumeSkills = []) {
  const normalized = String(projectText || "").trim();
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;
  const hasMetrics = /\b\d+(\.\d+)?%?\b/.test(normalized);
  const hasResultLanguage = /\b(reduced|increased|improved|optimized|automated|grew|cut)\b/i.test(normalized);
  return { wordCount, hasMetrics, hasResultLanguage };
}

function buildFallbackBreakdown(formData = {}, diagnostics = {}) {
  const resumeSkills = safeArray(formData.skills);
  const certifications = safeArray(formData.certifications).filter(
    (value) => !/^n\/?a$/i.test(value)
  );
  const experience = Math.max(0, Number(formData.experience) || 0);
  const projectAnalysis = analyzeProjectText(formData.completedProjects, resumeSkills);
  const missingSkills = safeArray(diagnostics.missingSkills);
  const educationLabel = getEducationLabel(formData);

  const skillsScore = clamp(resumeSkills.length * 4, 0, 30);
  const experienceScore = experience === 0 ? 8 : clamp(8 + experience * 3, 0, 20);
  const projectScore = clamp(
    (projectAnalysis.wordCount > 10 ? 8 : 3) +
      (projectAnalysis.hasMetrics ? 7 : 0) +
      (projectAnalysis.hasResultLanguage ? 5 : 0),
    0, 20
  );

  let educationScore = 12;
  if (/phd/i.test(educationLabel)) educationScore = 15;
  else if (/master/i.test(educationLabel)) educationScore = 14;
  else if (/diploma/i.test(educationLabel)) educationScore = 8;
  else if (/high school/i.test(educationLabel)) educationScore = 5;

  const certificationsScore = certifications.length === 0 ? 0 : certifications.length === 1 ? 10 : 15;
  const atsScore = clamp(6 + Math.max(0, 10 - missingSkills.length * 2) + (resumeSkills.length >= 5 ? 4 : 0), 0, 20);

  return { skills: skillsScore, experience: experienceScore, projects: projectScore, education: educationScore, certifications: certificationsScore, ats: atsScore };
}

function pickMissingSkills(formData = {}, diagnostics = {}, roleProfile = null) {
  return fieldSpecificSkills(diagnostics.missingSkills).slice(0, 8);
}

function truncateText(value = "", maxLength = 76) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function getProjectReference(report) {
  const projectText = String(report.projectText || report.formData?.completedProjects || "").replace(/\s+/g, " ").trim();
  if (!projectText) return "Projects section is empty";

  const firstProject = projectText
    .split(/\s*\|\s*|\s*;\s*|\.\s+/)
    .map((item) => item.trim())
    .find(Boolean) || projectText;

  return `Projects section "${truncateText(firstProject)}"`;
}

function getRoleCoreSkills(roleProfile = INDIA_ROLE_LIBRARY.generic) {
  return fieldSpecificSkills(roleProfile.coreSkills);
}

function getMatchedSkillText(report, roleProfile, limit = 3) {
  const matchedSkills = fieldSpecificSkills(report.matchedSkills);
  if (matchedSkills.length > 0) return matchedSkills.slice(0, limit).join(", ");

  const resumeSkills = fieldSpecificSkills(report.resumeSkills);
  return resumeSkills.length > 0 ? resumeSkills.slice(0, limit).join(", ") : "no field-specific skills listed yet";
}

function getListedSkillText(report, limit = 4) {
  const resumeSkills = fieldSpecificSkills(report.resumeSkills);
  return resumeSkills.length > 0 ? resumeSkills.slice(0, limit).join(", ") : "";
}

function getMissingSkillText(report, roleProfile, limit = 3) {
  const missingSkills = fieldSpecificSkills(report.missingSkills);
  return missingSkills.length > 0 ? missingSkills.slice(0, limit).join(", ") : "";
}

function getPrimaryFieldSkill(report, roleProfile) {
  return (
    fieldSpecificSkills(report.missingSkills)[0] ||
    fieldSpecificSkills(report.matchedSkills)[0] ||
    fieldSpecificSkills(report.resumeSkills)[0] ||
    ""
  );
}

function getRoleMetricExamples(roleProfile = INDIA_ROLE_LIBRARY.generic) {
  const key = roleProfile.key || "";
  const industry = normalizeComparable(roleProfile.industry || "");

  if (/data|machine learning/.test(key) || industry.includes("analytics")) return "accuracy, F1 score, dataset size";
  if (/frontend/.test(key)) return "Lighthouse score, load time, responsive pages";
  if (/backend|full stack|software/.test(key)) return "API latency, test coverage, request volume";
  if (/devops|cloud/.test(key)) return "deployment time, uptime, cloud cost";
  if (/cybersecurity/.test(key)) return "vulnerability count, risk severity, incident response time";
  if (/qa/.test(key)) return "test coverage, bug count, automation cases";
  if (/marketing/.test(key)) return "CTR, conversion rate, leads, CAC";
  if (/sales/.test(key)) return "pipeline value, conversion rate, revenue";
  if (/hr/.test(key)) return "time-to-hire, retention, onboarding time";
  if (/accountant|financial/.test(key)) return "closing time, variance, reconciliation accuracy";
  if (/project manager|operations/.test(key)) return "delivery time, SLA, cost savings";
  if (/civil|mechanical|electrical/.test(key)) return "budget, site size, downtime, safety results";
  if (/nurse|doctor|pharmacist/.test(key)) return "patient load, procedure count, care outcome";
  if (/teacher/.test(key)) return "class size, assessment scores, lesson outcomes";
  if (/graphic|content/.test(key)) return "reach, engagement, portfolio link";
  if (/customer service/.test(key)) return "CSAT, AHT, FCR, ticket volume";

  return "field metric from the target job role";
}

function buildSkillSuggestionBody(report, roleProfile) {
  const missingSkills = fieldSpecificSkills(report.missingSkills).slice(0, 5);
  const matchedText = getMatchedSkillText(report, roleProfile);
  const missingText = getMissingSkillText(report, roleProfile);
  const primarySkill = getPrimaryFieldSkill(report, roleProfile);
  const projectReference = getProjectReference(report);

  if (missingSkills.length > 0) {
    return `In Skills, keep ${matchedText}. Add missing ${missingText} only with evidence, e.g. "${missingSkills[0]} - used in ${projectReference}".`;
  }

  if (!primarySkill) {
    return `Skills section has no field-specific skill detected. Add only real tools from Projects or Experience for ${roleProfile.label}; do not add random skills.`;
  }

  return `No missing skills were detected. Do not add random skills; show where ${primarySkill || matchedText} was used in ${projectReference}.`;
}

function buildProjectSuggestionBody(report, roleProfile) {
  const projectReference = getProjectReference(report);
  const primarySkill = getPrimaryFieldSkill(report, roleProfile);
  const metricExamples = getRoleMetricExamples(roleProfile);
  const listedSkills = getListedSkillText(report, 3);

  if (!report.projectText) {
    return `Projects section is empty. Add one real ${roleProfile.label} project and list only tools you actually used${listedSkills ? ` from Skills: ${listedSkills}` : ""}.`;
  }
  if (report.projectSignals.wordCount < 25) {
    return `${projectReference} is too short. Add problem, your exact task, ${primarySkill || "one listed skill"}, and the real result for ${roleProfile.label}.`;
  }
  if (!report.projectSignals.hasMetrics) {
    return `In ${projectReference}, add one true result number such as ${metricExamples}; keep it tied to ${primarySkill || "the skill used"}.`;
  }
  if (!report.projectSignals.hasResultLanguage) {
    return `In ${projectReference}, connect the result to ${primarySkill || "the listed tool"}; example: "Used ${primarySkill || "this tool"} to deliver [real result]".`;
  }

  return `In ${projectReference}, keep the proof and add your exact contribution with ${primarySkill || "the main skill used"} for ${roleProfile.label}.`;
}

function buildEducationSuggestionBody(report, roleProfile) {
  const educationLabel = report.educationLabel || "Education";
  const missingText = getMissingSkillText(report, roleProfile, 2);
  const primarySkill = getPrimaryFieldSkill(report, roleProfile);
  const educationProof = missingText || primarySkill || roleProfile.label;

  if (/high school|diploma|other/i.test(educationLabel)) {
    return `Education shows ${educationLabel}. Add real coursework/project proof for ${educationProof}; do not add unrelated courses.`;
  }

  return `Education shows ${educationLabel}. Add institute, year, and coursework only if it proves ${educationProof} for ${roleProfile.label}.`;
}

function buildRoleSuggestionBody(report, roleProfile) {
  const matchedText = fieldSpecificSkills(report.matchedSkills).slice(0, 3).join(", ");
  const listedText = getListedSkillText(report, 3);
  const headlineProof = matchedText || listedText || "your strongest proven field skill";
  const missingText = getMissingSkillText(report, roleProfile, 2);
  const missingClause = missingText ? `; add ${missingText} only after you can prove it` : "; do not add unproven skills";
  return `Target role is "${report.targetRole}". Change Summary to "${roleProfile.label} | ${headlineProof}"${missingClause}.`;
}

function buildExperienceSuggestionBody(report, roleProfile) {
  const primarySkill = getPrimaryFieldSkill(report, roleProfile);
  const metricExamples = getRoleMetricExamples(roleProfile);

  if (report.experience === 0 || /student|fresher|n\/?a/i.test(report.previousJobTitle)) {
    return `Previous Job Title is "${report.previousJobTitle}". Add a real internship, academic, or freelance title using ${primarySkill || "your listed skill"} if true.`;
  }

  return `Previous Job Title is "${report.previousJobTitle}". Add one bullet: "Used ${primarySkill || "listed skill"} to improve [real ${metricExamples}]".`;
}

function buildSkillCleanupSuggestionBody(report, roleProfile) {
  const missingText = getMissingSkillText(report, roleProfile, 3);
  const projectReference = getProjectReference(report);
  const listedSkills = getListedSkillText(report, 4);

  if (missingText) {
    return `Do not paste ${missingText} into Skills unless ${projectReference} or Experience proves it. Add proof first, then add the skill.`;
  }

  return `Keep Skills limited to what the resume proves: ${listedSkills || "your real tools"}. Remove any skill not shown in Projects or Experience.`;
}

function buildCertificationSuggestionBody(report, roleProfile) {
  const certifications = fieldSpecificSkills(report.certifications);
  const missingText = getMissingSkillText(report, roleProfile, 2);
  const primarySkill = getPrimaryFieldSkill(report, roleProfile);

  if (certifications.length > 0) {
    return `Certifications show ${certifications.slice(0, 2).join(", ")}. Add issuer/year and connect it to ${missingText || primarySkill || roleProfile.label}.`;
  }

  return `Certifications are empty. Do not add fake certificates; add this section only after completing one tied to ${missingText || primarySkill || roleProfile.label}.`;
}

function buildActionItems(report) {
  const roleProfile = report.roleProfile || resolveRoleProfile(report.targetRole);
  const templates = [
    {
      title: "Close target skill gaps",
      body: buildSkillSuggestionBody(report, roleProfile),
    },
    {
      title: "Prove your listed project",
      body: buildProjectSuggestionBody(report, roleProfile),
    },
    {
      title: "Remove unproven skills",
      body: buildSkillCleanupSuggestionBody(report, roleProfile),
    },
    {
      title: "Tie education to role",
      body: buildEducationSuggestionBody(report, roleProfile),
    },
    {
      title: "Keep certifications honest",
      body: buildCertificationSuggestionBody(report, roleProfile),
    },
    {
      title: "Set role-specific headline",
      body: buildRoleSuggestionBody(report, roleProfile),
    },
    {
      title: "Connect experience to role",
      body: buildExperienceSuggestionBody(report, roleProfile),
    },
  ];

  return templates.map((template, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: template.title,
    body: template.body.trim(),
    priority: ACTION_PRIORITIES[index],
  }));
}

function buildReportModel({ score, suggestions, formData, profileType, scoreBreakdown, strongPoints, diagnostics }) {
  const scoreValue = clamp(Number(score) || 0, 0, 100);
  const form = formData || {};
  const resumeSkills = safeArray(form.skills);
  const certifications = safeArray(form.certifications).filter((value) => !/^n\/?a$/i.test(value));
  const breakdown = { ...buildFallbackBreakdown(form, diagnostics || {}), ...(scoreBreakdown || {}) };
  const scoreTone = getScoreTone(scoreValue);
  const targetRole = getRoleLabel(form, diagnostics || {});
  const roleProfile = resolveRoleProfile(targetRole);
  const missingSkills = pickMissingSkills(form, diagnostics || {}, roleProfile);
  const matchedSkills = fieldSpecificSkills(diagnostics?.matchedSkills);
  const educationLabel = getEducationLabel(form);
  const projectSignals = analyzeProjectText(form.completedProjects, resumeSkills);

  const report = {
    score: scoreValue,
    suggestions: safeArray(suggestions),
    formData: form,
    candidateName: String(form.name || diagnostics?.candidateName || "Candidate").trim() || "Candidate",
    profileType: profileType || diagnostics?.profileType || "fresher",
    breakdown,
    strongPoints: safeArray(strongPoints),
    diagnostics: diagnostics || {},
    targetRole,
    roleProfile,
    educationLabel,
    resumeSkills,
    certifications,
    missingSkills,
    matchedSkills,
    scoreTone,
    projectSignals,
    previousJobTitle: String(form.previousJobTitle || "N/A").trim() || "N/A",
    experience: Math.max(0, Number(form.experience) || 0),
    currentCity: String(form.currentCity || "").trim(),
    projectText: String(form.completedProjects || "").trim(),
    reportDate: formatReportDate(),
    fullReportDate: formatFullReportDate(),
  };

  report.actionItems = buildActionItems(report);
  report.scoreGoal = clamp(report.score + 20, 0, 100);

  return report;
}

function setTextColor(doc, color) { doc.setTextColor(...color); }
function setFillColor(doc, color) { doc.setFillColor(...color); }
function setDrawColor(doc, color) { doc.setDrawColor(...color); }

function drawRoundedPanel(doc, x, y, width, height, fillColor, borderColor = null, radius = 4) {
  if (fillColor) setFillColor(doc, fillColor);
  if (borderColor) setDrawColor(doc, borderColor);
  const mode = fillColor && borderColor ? "FD" : fillColor ? "F" : "S";
  doc.roundedRect(x, y, width, height, radius, radius, mode);
}

function writeWrappedText(doc, text, x, y, maxWidth, { size = 10, color = COLORS.slate, style = "normal", lineHeight = 4.7 } = {}) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  setTextColor(doc, color);
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawPill(doc, x, y, text, fillColor, textColor, width = null, fontSize = 8) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  const computedWidth = width || doc.getTextWidth(text) + 8;
  setFillColor(doc, fillColor);
  doc.roundedRect(x, y, computedWidth, 7, 3.5, 3.5, "F");
  setTextColor(doc, textColor);
  doc.text(text, x + computedWidth / 2, y + 4.6, { align: "center" });
  return computedWidth;
}

function degreesToRadians(value) { return (value * Math.PI) / 180; }

function drawArcSegments(doc, centerX, centerY, radius, startDeg, endDeg, color, width) {
  const segments = 36;
  const step = (endDeg - startDeg) / segments;
  doc.setLineWidth(width);
  setDrawColor(doc, color);
  let previousPoint = null;
  for (let index = 0; index <= segments; index += 1) {
    const angle = degreesToRadians(startDeg + step * index);
    const currentPoint = { x: centerX + radius * Math.cos(angle), y: centerY - radius * Math.sin(angle) };
    if (previousPoint) doc.line(previousPoint.x, previousPoint.y, currentPoint.x, currentPoint.y);
    previousPoint = currentPoint;
  }
}

function drawGauge(doc, x, y, width, score, accentColor) {
  const centerX = x + width / 2;
  const centerY = y + 24;
  const radius = 14;
  const normalizedScore = clamp(score, 0, 100);
  const scoreAngle = 180 - normalizedScore * 1.8;

  drawArcSegments(doc, centerX, centerY, radius, 180, 0, COLORS.sidebarSoft, 3.4);
  drawArcSegments(doc, centerX, centerY, radius, 180, scoreAngle, accentColor, 3.4);

  const needleLength = radius - 3;
  const needleAngle = degreesToRadians(scoreAngle);
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY - needleLength * Math.sin(needleAngle);

  doc.setLineWidth(1.2);
  setDrawColor(doc, COLORS.white);
  doc.line(centerX, centerY, needleX, needleY);
  setFillColor(doc, COLORS.white);
  doc.circle(centerX, centerY, 1.4, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  setTextColor(doc, [184, 198, 237]);
  doc.text("0", centerX - radius - 1, centerY + 3.5);
  doc.text("100", centerX + radius - 4, centerY + 3.5);
}

function drawSidebarInfoCard(doc, x, y, width, label, value) {
  drawRoundedPanel(doc, x, y, width, 19, COLORS.sidebarCard, null, 3.6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  setTextColor(doc, [184, 198, 237]);
  doc.text(label, x + 4, y + 6.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.4);
  setTextColor(doc, COLORS.white);
  const lines = doc.splitTextToSize(String(value || ""), width - 8);
  doc.text(lines.slice(0, 2), x + 4, y + 12.6);
}

function getTrackLabel(report) {
  const fullLabel = `${report.targetRole} Track`;
  return fullLabel.length <= 28 ? fullLabel : report.targetRole;
}

function buildInsightTitle(report) {
  if (report.score >= 80) return "Your resume is strong - now polish the final details.";
  if (report.score >= 65) return "Your resume is close - a few upgrades can lift it fast.";
  if (report.score >= 45) return "Your resume shows promise - but recruiters still need clearer proof.";
  return "Your resume needs focused work - but the fix is fast.";
}

function buildInsightBody(report) {
  const strengthSource = report.resumeSkills.slice(0, 3).join(", ");
  const missingSource = report.missingSkills.length > 0
    ? report.missingSkills.slice(0, 3).join(", ")
    : "clear metrics, stronger role language, and sharper project outcomes";

  if (report.missingSkills.length === 0) {
    return `You already show useful alignment for ${report.targetRole}. The next lift comes from stronger evidence, cleaner structure, and tighter wording recruiters can scan quickly.`;
  }

  const opening = strengthSource
    ? `You have a solid base in ${strengthSource}`
    : `You have a usable foundation for ${report.targetRole}`;

  const closing = report.score < 65
    ? "Three targeted fixes can move you out of the weak zone quickly."
    : "A few targeted fixes can move you into a stronger range quickly.";

  return `${opening}, but the resume is missing ${missingSource} signals recruiters and ATS systems scan for in a ${report.targetRole} role. ${closing}`;
}

function drawSectionMarker(doc, number, x, y) {
  drawRoundedPanel(doc, x, y, 9, 9, COLORS.sidebarBlue, null, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setTextColor(doc, COLORS.white);
  doc.text(String(number), x + 4.5, y + 5.8, { align: "center" });
}

function getPriorityStyles(priority) {
  const normalized = String(priority || "").toUpperCase();
  if (normalized.includes("FIX") || normalized.includes("HIGH")) return { fill: [255, 235, 232], text: COLORS.red };
  if (normalized.includes("IMPROVE") || normalized.includes("MEDIUM")) return { fill: [255, 243, 227], text: COLORS.amber };
  if (normalized.includes("POLISH") || normalized.includes("LOW")) return { fill: [220, 252, 231], text: COLORS.green };
  return { fill: [232, 238, 251], text: [111, 131, 190] };
}

function drawSkillsSection(doc, report, contentX, contentWidth, startY) {
  const skills = report.resumeSkills;
  if (skills.length === 0) return startY;

  // Section header
  drawSectionMarker(doc, 1, contentX, startY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.ink);
  doc.text("Your Skills", contentX + 13, startY + 6.8);

  const sectionY = startY + 14;
  const panelHeight = Math.min(70, Math.ceil(skills.length / 3) * 14 + 10);
  drawRoundedPanel(doc, contentX, sectionY, contentWidth, panelHeight, COLORS.lightCard, null, 4);

  let cursorX = contentX + 6;
  let cursorY = sectionY + 8;
  const chipHeight = 8;
  const maxX = contentX + contentWidth - 6;

  skills.forEach((skill) => {
    const trendInfo = getSkillTrend(skill);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const chipWidth = Math.min(contentWidth - 12, doc.getTextWidth(skill) + 10);

    if (cursorX + chipWidth > maxX) {
      cursorX = contentX + 6;
      cursorY += chipHeight + 4;
    }

    if (cursorY + chipHeight > sectionY + panelHeight - 4) return;

    setFillColor(doc, COLORS.white);
    setDrawColor(doc, trendInfo.color);
    doc.setLineWidth(0.6);
    doc.roundedRect(cursorX, cursorY, chipWidth, chipHeight, 4, 4, "FD");
    setTextColor(doc, trendInfo.color);
    doc.text(skill, cursorX + chipWidth / 2, cursorY + 5.2, { align: "center" });
    cursorX += chipWidth + 3;
  });

  return sectionY + panelHeight + 6;
}

function drawSkillTrendAnalysis(doc, report, contentX, contentWidth, startY) {
  const skills = report.resumeSkills;
  if (skills.length === 0) return startY;

  // Count trends
  const trendCounts = {};
  skills.forEach((skill) => {
    const t = getSkillTrend(skill).trend;
    trendCounts[t] = (trendCounts[t] || 0) + 1;
  });

  const trendColors = {
    "Hot": COLORS.amber,
    "Rising": COLORS.green,
    "High Demand": COLORS.blue,
    "Essential": COLORS.sidebarBlue,
    "Stable": COLORS.slate,
    "Relevant": COLORS.muted,
  };

  const trendOrder = ["Hot", "Rising", "High Demand", "Essential", "Stable", "Relevant"];
  const activeTrends = trendOrder.filter((t) => trendCounts[t]);

  // Section header
  drawSectionMarker(doc, 2, contentX, startY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.ink);
  doc.text("Skill Trend Analysis", contentX + 13, startY + 6.8);

  const sectionY = startY + 14;
  const panelHeight = 52;
  drawRoundedPanel(doc, contentX, sectionY, contentWidth, panelHeight, COLORS.paleBlue, null, 4);

  // Intro text
  const hotCount = trendCounts["Hot"] || 0;
  const risingCount = (trendCounts["Rising"] || 0) + (trendCounts["High Demand"] || 0);
  let trendSummary = "";
  if (hotCount > 0) {
    trendSummary = `You have ${hotCount} hot skill${hotCount > 1 ? "s" : ""} in high demand for 2025-2026. `;
  }
  if (risingCount > 0) {
    trendSummary += `${risingCount} of your skills are actively rising in the job market.`;
  }
  if (!trendSummary) {
    trendSummary = "Your skills show solid foundational coverage for your target role.";
  }

  writeWrappedText(doc, trendSummary, contentX + 8, sectionY + 9, contentWidth - 16, {
    size: 8,
    color: COLORS.ink,
    lineHeight: 4,
  });

  // Trend bars
  const barY = sectionY + 20;
  const totalSkills = skills.length || 1;
  const barAreaWidth = contentWidth - 16;
  const barHeight = 5;
  const barSpacing = 7.5;

  activeTrends.slice(0, 4).forEach((trend, index) => {
    const count = trendCounts[trend];
    const barWidth = clamp((count / totalSkills) * barAreaWidth, 6, barAreaWidth);
    const y = barY + index * barSpacing;
    const color = trendColors[trend] || COLORS.slate;

    // Background bar
    setFillColor(doc, [220, 228, 245]);
    doc.roundedRect(contentX + 8, y, barAreaWidth, barHeight, 2.5, 2.5, "F");

    // Filled bar
    setFillColor(doc, color);
    doc.roundedRect(contentX + 8, y, barWidth, barHeight, 2.5, 2.5, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setTextColor(doc, color);
    doc.text(trend, contentX + 8 + barWidth + 3, y + 3.8);

    // Count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setTextColor(doc, COLORS.muted);
    doc.text(`${count} skill${count > 1 ? "s" : ""}`, contentX + contentWidth - 6, y + 3.8, { align: "right" });
  });

  return sectionY + panelHeight + 6;
}

function drawSidebar(doc, report) {
  const sidebar = { x: 12, y: 18, width: 56, height: 250 };

  drawRoundedPanel(doc, sidebar.x, sidebar.y, sidebar.width, sidebar.height, COLORS.sidebarBlue, null, 5);

  drawRoundedPanel(doc, sidebar.x + 6, sidebar.y + 8, 8, 8, COLORS.sidebarSoft, null, 2.6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  setTextColor(doc, COLORS.white);
  doc.text("U", sidebar.x + 10, sidebar.y + 13.1, { align: "center" });
  doc.text("URBRIDGE.AI", sidebar.x + 17, sidebar.y + 13.1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15.5);
  doc.text("Your Resume", sidebar.x + 6, sidebar.y + 30);
  doc.text("Report", sidebar.x + 6, sidebar.y + 38.5);

  writeWrappedText(doc, "A breakdown of where you stand, what's missing, and the fastest path forward.", sidebar.x + 6, sidebar.y + 47, sidebar.width - 12, { size: 7, color: [194, 207, 239], lineHeight: 3.8 });

  drawRoundedPanel(doc, sidebar.x + 6, sidebar.y + 65, sidebar.width - 12, 58, COLORS.sidebarCard, null, 3.8);
  drawGauge(doc, sidebar.x + 10, sidebar.y + 73, sidebar.width - 20, report.score, report.scoreTone.accent);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  setTextColor(doc, COLORS.white);
  doc.text(String(report.score), sidebar.x + sidebar.width / 2, sidebar.y + 109, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, [203, 214, 244]);
  doc.text("/100", sidebar.x + sidebar.width / 2 + 7.6, sidebar.y + 109);

  const pillWidth = clamp(Math.max(25, String(report.scoreTone.label).length * 2.15), 25, sidebar.width - 18);
  drawPill(doc, sidebar.x + (sidebar.width - pillWidth) / 2, sidebar.y + 113, report.scoreTone.label, report.scoreTone.accent, COLORS.white, pillWidth, 6.7);

  const facts = [
    { label: "TARGET ROLE", value: report.targetRole },
    { label: "EXPERIENCE", value: `${pluralize(report.experience, "year")} - ${report.educationLabel}` },
    { label: "LOCATION", value: report.currentCity || "Not provided" },
    { label: "REPORT DATE", value: report.reportDate },
  ];

  let cardY = sidebar.y + 131;
  facts.forEach((item) => {
    drawSidebarInfoCard(doc, sidebar.x + 6, cardY, sidebar.width - 12, item.label, item.value);
    cardY += 22.5;
  });
}

function drawPageOne(doc, report) {
  drawSidebar(doc, report);
  const contentX = 76;
  const contentWidth = 122;
  const trackLabel = getTrackLabel(report);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  setTextColor(doc, COLORS.ink);
  doc.text("Resume Analysis", contentX, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  const trackWidth = Math.min(contentWidth - 55, doc.getTextWidth(trackLabel) + 12);
  drawPill(doc, contentX + contentWidth - trackWidth, 20, trackLabel, COLORS.softBlue, COLORS.blue, trackWidth, 7.1);

  setDrawColor(doc, COLORS.border);
  doc.setLineWidth(0.45);
  doc.line(contentX, 36, contentX + contentWidth, 36);

  // Insight panel
  drawRoundedPanel(doc, contentX, 42, contentWidth, 38, COLORS.paleBlue, null, 4.5);
  setFillColor(doc, COLORS.blue);
  doc.roundedRect(contentX, 42, 1.7, 38, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  setTextColor(doc, COLORS.blue);
  doc.text(buildInsightTitle(report), contentX + 8, 53);

  writeWrappedText(doc, buildInsightBody(report), contentX + 8, 61, contentWidth - 14, {
    size: 8,
    color: COLORS.ink,
    lineHeight: 4.1,
  });

  // Skills section
  let currentY = 86;
  currentY = drawSkillsSection(doc, report, contentX, contentWidth, currentY);

  // Skill trend analysis
  currentY = drawSkillTrendAnalysis(doc, report, contentX, contentWidth, currentY);
}

function drawActionCard(doc, item, x, y, width) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  const bodyLines = doc.splitTextToSize(item.body, width - 50).slice(0, 2);
  const height = bodyLines.length > 1 ? 24 : 22;
  const priorityStyles = getPriorityStyles(item.priority);

  drawRoundedPanel(doc, x, y, width, height, COLORS.lightCard, null, 4.5);
  drawRoundedPanel(doc, x + 5, y + 6, 10, 10, COLORS.softBlue, null, 2.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor(doc, COLORS.sidebarBlue);
  doc.text(item.number, x + 10, y + 12.2, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.2);
  setTextColor(doc, COLORS.ink);
  doc.text(item.title, x + 19, y + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  const priorityWidth = doc.getTextWidth(item.priority) + 8;
  drawPill(doc, x + width - priorityWidth - 5, y + 4.2, item.priority, priorityStyles.fill, priorityStyles.text, priorityWidth, 5.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  setTextColor(doc, COLORS.slate);
  doc.text(bodyLines, x + 19, y + 14.4);

  return y + height + 4.5;
}

function drawPageTwo(doc, report) {
  doc.addPage();
  const contentX = 12;
  const contentWidth = 186;
  const trackLabel = getTrackLabel(report);

  drawRoundedPanel(doc, contentX, 14, 8, 8, COLORS.sidebarBlue, null, 2.6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  setTextColor(doc, COLORS.white);
  doc.text("U", contentX + 4, 19.2, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setTextColor(doc, COLORS.ink);
  doc.text("Action Plan & Examples", contentX + 12, 19.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  const trackWidth = Math.min(50, doc.getTextWidth(trackLabel) + 12);
  drawPill(doc, contentX + contentWidth - trackWidth, 15.2, trackLabel, COLORS.softBlue, COLORS.blue, trackWidth, 7.1);

  setDrawColor(doc, COLORS.border);
  doc.setLineWidth(0.45);
  doc.line(contentX, 26.5, contentX + contentWidth, 26.5);

  drawSectionMarker(doc, 1, contentX, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.ink);
  doc.text("Do these, in this order", contentX + 13, 38.8);

  let actionY = 44;
  report.actionItems.forEach((item) => {
    actionY = drawActionCard(doc, item, contentX, actionY, contentWidth);
  });

  const ctaY = actionY + 8;
  drawRoundedPanel(doc, contentX, ctaY, contentWidth, 34, COLORS.sidebarBlue, null, 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  setTextColor(doc, COLORS.white);
  doc.text(`Apply the top 3 fixes, jump to ${report.scoreGoal} / 100.`, contentX + 8, ctaY + 12);

  const closingText = report.missingSkills.length > 0
    ? `${report.resumeSkills.length > 0 ? "Skills" : "Role alignment"} + project depth + one concrete experience line moves this report from "${report.scoreTone.label}" toward a stronger hiring signal.`
    : "You do not need to redo everything. Stronger proof, outcomes, and cleaner wording will create the fastest lift.";

  writeWrappedText(doc, closingText, contentX + 8, ctaY + 19, 104, { size: 7.8, color: [226, 234, 248], lineHeight: 3.8 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  setTextColor(doc, [164, 184, 242]);
  doc.text(String(report.score), contentX + 134, ctaY + 21);
  doc.setFontSize(14);
  setTextColor(doc, [137, 163, 240]);
  doc.text("->", contentX + 151.5, ctaY + 20.5);
  doc.setFontSize(23);
  setTextColor(doc, [255, 204, 61]);
  doc.text(String(report.scoreGoal), contentX + 165, ctaY + 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.7);
  setTextColor(doc, [209, 222, 252]);
  doc.text("TODAY", contentX + 135.5, ctaY + 27);
  doc.text("AFTER FIXES", contentX + 161.5, ctaY + 27);
}

function normalizeBreakdownPercent(value, maxValue = 100) {
  const numeric = Number(value) || 0;
  if (numeric > maxValue) return clamp(numeric, 0, 100);
  return clamp((numeric / maxValue) * 100, 0, 100);
}

function drawReferenceSectionHeader(doc, label, x, y, width) {
  setDrawColor(doc, COLORS.navy);
  doc.setLineWidth(0.65);
  doc.line(x, y, x + width, y);
  setDrawColor(doc, COLORS.blue);
  doc.setLineWidth(1.5);
  doc.line(x, y, x + 14, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  setTextColor(doc, COLORS.navy);
  doc.text(String(label || "").toUpperCase(), x, y + 7.2);
}

function drawReferenceGauge(doc, x, y, score) {
  const centerX = x + 20;
  const centerY = y + 32;
  const radius = 15;
  const normalizedScore = clamp(score, 0, 100);
  const scoreAngle = 180 - normalizedScore * 1.8;

  drawArcSegments(doc, centerX, centerY, radius, 180, 0, [218, 226, 239], 5.2);
  drawArcSegments(doc, centerX, centerY, radius, 180, scoreAngle, COLORS.navy, 5.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16.2);
  setTextColor(doc, COLORS.ink);
  doc.text(String(score), centerX, centerY + 1, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  setTextColor(doc, COLORS.muted);
  doc.text("out of 100", centerX, centerY + 7.4, { align: "center" });
}

function drawReferenceBars(doc, report, x, y, width) {
  const breakdown = report.breakdown || {};
  const rows = [
    { label: "Keyword Match", value: normalizeBreakdownPercent(breakdown.ats ?? report.score, 20) },
    { label: "Formatting", value: clamp(58 + report.score * 0.32, 0, 100) },
    { label: "Skills Alignment", value: normalizeBreakdownPercent(breakdown.skills ?? report.score, 30) },
    { label: "Project Language", value: normalizeBreakdownPercent(breakdown.projects ?? report.score, 20) },
    { label: "Experience Fit", value: normalizeBreakdownPercent(breakdown.experience ?? report.score, 20) },
  ];
  const labelWidth = 48;
  const barWidth = width - labelWidth - 14;

  rows.forEach((row, index) => {
    const rowY = y + index * 8.6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    setTextColor(doc, COLORS.slate);
    doc.text(row.label, x, rowY + 3.3);

    setFillColor(doc, [228, 233, 242]);
    doc.roundedRect(x + labelWidth, rowY, barWidth, 4, 2, 2, "F");
    setFillColor(doc, index % 2 === 0 ? COLORS.navy : COLORS.blue);
    doc.roundedRect(x + labelWidth, rowY, (barWidth * row.value) / 100, 4, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    setTextColor(doc, COLORS.ink);
    doc.text(String(Math.round(row.value)), x + labelWidth + barWidth + 5, rowY + 3.3);
  });
}

function drawReferenceScoreBreakdown(doc, report, x, y, width) {
  drawRoundedPanel(doc, x, y, width, 92, COLORS.navyPanel, [226, 232, 240], 0);
  drawReferenceGauge(doc, x + 5, y + 5, report.score);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, COLORS.muted);
  doc.text("Overall grade", x + 50, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setTextColor(doc, COLORS.navy);
  doc.text(report.score >= 80 ? "Excellent" : report.score >= 65 ? "Good" : report.score >= 45 ? "Needs Focus" : "Needs Work", x + 50, y + 18);

  writeWrappedText(doc, buildInsightTitle(report), x + 50, y + 28, width - 60, {
    size: 9,
    color: COLORS.slate,
    lineHeight: 4.8,
  });

  drawReferenceBars(doc, report, x + 8, y + 51, width - 18);
}

function drawKeywordListColumn(doc, title, items, x, y, width, titleFill) {
  setFillColor(doc, titleFill);
  doc.rect(x, y, width, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, COLORS.navy);
  doc.text(title, x + 3.5, y + 6.6);

  const visibleItems = items.length > 21 ? [...items.slice(0, 20), `${items.length - 20} more`] : items;
  const columnCount = Math.min(3, Math.max(1, Math.ceil(visibleItems.length / 7)));
  const cellWidth = width / columnCount;
  const rowHeight = 10.5;
  visibleItems.forEach((item, index) => {
    const columnIndex = index % columnCount;
    const rowIndex = Math.floor(index / columnCount);
    const cellX = x + columnIndex * cellWidth;
    const rowY = y + 10 + rowIndex * rowHeight;
    setDrawColor(doc, [232, 236, 244]);
    doc.setLineWidth(0.25);
    doc.rect(cellX, rowY, cellWidth, rowHeight, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    setTextColor(doc, COLORS.ink);
    setFillColor(doc, COLORS.navy);
    doc.circle(cellX + 4.5, rowY + 5.2, 1.15, "F");
    doc.text(fitTextToWidth(doc, item, cellWidth - 11), cellX + 7.5, rowY + 6.8);
  });

  return y + 10 + Math.ceil(visibleItems.length / columnCount) * rowHeight;
}

function drawReferenceKeywordAnalysis(doc, report, x, y, width) {
  const found = report.resumeSkills;

  return drawKeywordListColumn(doc, "Skills you have", found.length ? found : ["Skills not provided"], x, y, width, COLORS.navySoft);
}

function drawReferencePieSlice(doc, centerX, centerY, radius, startDeg, endDeg, color) {
  setFillColor(doc, color);
  const points = [];
  for (let angle = startDeg; angle <= endDeg; angle += 3) {
    const radians = degreesToRadians(angle);
    points.push({
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    });
  }
  const endRadians = degreesToRadians(endDeg);
  points.push({
    x: centerX + radius * Math.cos(endRadians),
    y: centerY + radius * Math.sin(endRadians),
  });

  let currentX = centerX;
  let currentY = centerY;
  const vectors = points.map((point) => {
    const vector = [point.x - currentX, point.y - currentY];
    currentX = point.x;
    currentY = point.y;
    return vector;
  });
  doc.lines(vectors, centerX, centerY, [1, 1], "F", true);
}

function drawReferenceTrendChart(doc, report, x, y, width, height) {
  drawRoundedPanel(doc, x, y, width, height, COLORS.white, [226, 232, 240], 0);
  const matchedCount = Math.max(report.matchedSkills.length, 0);
  const missingCount = Math.max(report.missingSkills.length, 0);
  const supportingCount = report.certifications.length + (report.projectText ? 1 : 0);
  const rows = [
    { label: "Matched", value: matchedCount, color: COLORS.blue, textColor: COLORS.white },
    { label: "Missing", value: missingCount, color: COLORS.red, textColor: COLORS.white },
    { label: "Proof", value: supportingCount, color: [234, 179, 8], textColor: COLORS.ink },
  ];
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const centerX = x + 45;
  const centerY = y + height / 2 + 1;
  const radius = Math.min(26, height / 2 - 10);
  let startAngle = -90;
  const sliceLabels = [];
  const sliceBorders = [startAngle];

  rows.forEach((row) => {
    if (row.value <= 0) return;
    const endAngle = startAngle + (row.value / total) * 360;
    drawReferencePieSlice(doc, centerX, centerY, radius, startAngle, endAngle, row.color);
    const middleAngle = degreesToRadians(startAngle + (endAngle - startAngle) / 2);
    sliceLabels.push({
      row,
      x: centerX + radius * 0.58 * Math.cos(middleAngle),
      y: centerY + radius * 0.58 * Math.sin(middleAngle) + 1.2,
    });
    sliceBorders.push(endAngle);
    startAngle = endAngle;
  });

  setDrawColor(doc, COLORS.navy);
  doc.setLineWidth(0.35);
  doc.circle(centerX, centerY, radius, "S");
  doc.setLineWidth(0.25);
  sliceBorders.forEach((angle) => {
    const radians = degreesToRadians(angle);
    doc.line(centerX, centerY, centerX + radius * Math.cos(radians), centerY + radius * Math.sin(radians));
  });

  sliceLabels.forEach(({ row, x: labelX, y: labelY }) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.2);
    setTextColor(doc, row.textColor);
    doc.text(String(row.value), labelX, labelY, { align: "center" });
  });

  const matchPercent = Math.round((matchedCount / (matchedCount + missingCount || 1)) * 100);
  setFillColor(doc, COLORS.navySoft);
  doc.roundedRect(x + width - 48, y + 5, 38, 9, 4.5, 4.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor(doc, COLORS.navy);
  doc.text(`${matchPercent}% match`, x + width - 29, y + 10.9, { align: "center" });

  const legendX = x + 88;
  const legendY = y + 24;
  rows.forEach((row, index) => {
    const itemY = legendY + index * 11.5;
    setFillColor(doc, row.color);
    doc.rect(legendX, itemY - 4.2, 5.2, 5.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.8);
    setTextColor(doc, COLORS.ink);
    doc.text(row.label, legendX + 8.5, itemY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, COLORS.slate);
    doc.text(`${row.value} items`, legendX + 58, itemY, { align: "right" });
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  setTextColor(doc, COLORS.muted);
  doc.text("Resume signal distribution", legendX, y + height - 7);
}

function drawReferenceSuggestions(doc, report, x, y, width) {
  const items = getReferenceSuggestionItems(report);
  const rowHeight = 31;
  drawRoundedPanel(doc, x, y, width, items.length * rowHeight, COLORS.white, [226, 232, 240], 0);
  items.forEach((item, index) => {
    const rowY = y + index * rowHeight;
    const accent = getPriorityStyles(item.priority).text;
    const bodyLines = doc.splitTextToSize(item.body, width - 74).slice(0, 3);

    setDrawColor(doc, accent);
    doc.setLineWidth(0.7);
    doc.line(x, rowY, x + width, rowY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setTextColor(doc, accent);
    doc.text(item.number, x + 7, rowY + 13.4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColor(doc, COLORS.ink);
    doc.text(item.title, x + 24, rowY + 8.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    setTextColor(doc, COLORS.slate);
    doc.text(bodyLines, x + 24, rowY + 15.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.4);
    setTextColor(doc, accent);
    doc.text(item.priority, x + width - 7, rowY + 11, { align: "right" });
  });
}

function getReferenceSuggestionItems(report) {
  return report.actionItems.slice(0, 7).map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, "0"),
  }));
}

function drawReferenceFooter(doc, report, pageNumber) {
  const x = 18;
  const width = 174;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  setTextColor(doc, COLORS.muted);
  doc.text(`Generated ${report.fullReportDate}`, x, 293);
  doc.text("Confidential | UrBridge.ai", PAGE.width / 2, 293, { align: "center" });
  doc.text(`Page ${pageNumber}`, x + width, 293, { align: "right" });
}

function drawReferenceBrandHeader(doc, logoDataUrl, x, y, subtitle = "") {
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", x, y, 68, 8.5, undefined, "FAST");
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17.5);
    setTextColor(doc, COLORS.ink);
    doc.text("UrBridgeAI", x, y + 7);
  }

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setTextColor(doc, COLORS.slate);
    doc.text(subtitle, x, y + 15);
  }
}

function fitTextToWidth(doc, text, maxWidth) {
  const value = String(text || "");
  if (doc.getTextWidth(value) <= maxWidth) return value;

  let fitted = value;
  while (fitted.length > 3 && doc.getTextWidth(`${fitted}...`) > maxWidth) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted.trim()}...`;
}

function drawReferenceMetaRow(doc, report, x, y, width) {
  const dateWidth = 34;
  const details = ` | ${report.targetRole} | ${pluralize(report.experience, "year")} | ${report.currentCity || report.educationLabel}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  setTextColor(doc, COLORS.ink);
  const name = fitTextToWidth(doc, report.candidateName, 46);
  doc.text(name, x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.4);
  setTextColor(doc, COLORS.ink);
  const detailsX = x + doc.getTextWidth(name) + 1.5;
  const detailsWidth = x + width - dateWidth - detailsX;
  doc.text(fitTextToWidth(doc, details, detailsWidth), detailsX, y);

  setTextColor(doc, COLORS.slate);
  doc.text(report.fullReportDate, x + width, y, { align: "right" });
}

function drawReferenceReportPage(doc, report, logoDataUrl) {
  const x = 18;
  const width = 174;

  setFillColor(doc, COLORS.navy);
  doc.rect(0, 0, PAGE.width, 2.2, "F");

  drawReferenceBrandHeader(doc, logoDataUrl, x, 9, "AI-powered resume & ATS analysis report");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.4);
  setTextColor(doc, COLORS.ink);
  doc.text(fitTextToWidth(doc, report.candidateName, 58), x + width, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  setTextColor(doc, COLORS.slate);
  doc.text(fitTextToWidth(doc, report.targetRole, 58), x + width, 21, { align: "right" });
  drawPill(doc, x + width - 36, 24, `ATS ${report.score}/100`, COLORS.navy, COLORS.white, 36, 7.8);

  setDrawColor(doc, [222, 228, 236]);
  doc.setLineWidth(0.35);
  doc.line(x, 39, x + width, 39);

  drawReferenceMetaRow(doc, report, x, 57, width);

  drawReferenceSectionHeader(doc, "ATS Score & Category Breakdown", x, 68, width);
  drawReferenceScoreBreakdown(doc, report, x, 77, width);

  drawReferenceSectionHeader(doc, "Keyword Analysis", x, 185, width);
  drawReferenceKeywordAnalysis(doc, report, x, 195, width);

  drawReferenceFooter(doc, report, 1);
}

function drawReferenceTrendPage(doc, report, logoDataUrl) {
  doc.addPage();
  const x = 18;
  const width = 174;

  setFillColor(doc, COLORS.navy);
  doc.rect(0, 0, PAGE.width, 2.2, "F");

  drawReferenceBrandHeader(doc, logoDataUrl, x, 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17.5);
  setTextColor(doc, COLORS.ink);
  doc.text("Skill Trend Analysis", x, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, COLORS.slate);
  doc.text("A clearer view of matched, missing, and supporting resume signals.", x, 37);

  setDrawColor(doc, [222, 228, 236]);
  doc.setLineWidth(0.35);
  doc.line(x, 47, x + width, 47);

  drawReferenceSectionHeader(doc, "Skill Trend Analysis 2023-2026", x, 58, width);
  drawReferenceTrendChart(doc, report, x, 70, width, 92);

  drawReferenceFooter(doc, report, 2);
}

function drawReferenceSuggestionsPage(doc, report, logoDataUrl) {
  doc.addPage();
  const x = 18;
  const width = 174;

  setFillColor(doc, COLORS.navy);
  doc.rect(0, 0, PAGE.width, 2.2, "F");

  drawReferenceBrandHeader(doc, logoDataUrl, x, 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17.5);
  setTextColor(doc, COLORS.ink);
  doc.text("Improvement Suggestions", x, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, COLORS.slate);
  doc.text("Prioritized actions to improve ATS parsing, recruiter scan speed, and role alignment.", x, 37);

  setDrawColor(doc, [222, 228, 236]);
  doc.setLineWidth(0.35);
  doc.line(x, 47, x + width, 47);

  drawReferenceSectionHeader(doc, "Improvement Suggestions", x, 57, width);
  drawReferenceSuggestions(doc, report, x, 69, width);

  drawReferenceFooter(doc, report, 3);
}

let cachedBrandLogoDataUrl;

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadBrandLogoDataUrl() {
  if (cachedBrandLogoDataUrl !== undefined) return cachedBrandLogoDataUrl;

  try {
    if (String(brandLogoUrl).startsWith("data:")) {
      cachedBrandLogoDataUrl = brandLogoUrl;
      return cachedBrandLogoDataUrl;
    }

    const response = await fetch(brandLogoUrl);
    if (!response.ok) throw new Error("Logo asset could not be loaded");
    cachedBrandLogoDataUrl = await blobToDataUrl(await response.blob());
  } catch {
    cachedBrandLogoDataUrl = null;
  }

  return cachedBrandLogoDataUrl;
}

export const downloadReport = async ({ score, suggestions, formData, profileType, scoreBreakdown, strongPoints, diagnostics }) => {
  const report = buildReportModel({ score, suggestions, formData, profileType, scoreBreakdown, strongPoints, diagnostics });
  const logoDataUrl = await loadBrandLogoDataUrl();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawReferenceReportPage(doc, report, logoDataUrl);
  drawReferenceTrendPage(doc, report, logoDataUrl);
  drawReferenceSuggestionsPage(doc, report, logoDataUrl);

  doc.save("UrBridge_Resume_Report.pdf");
};
