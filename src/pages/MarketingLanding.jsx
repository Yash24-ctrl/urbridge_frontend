import { Link } from "react-router-dom";
import logo from "../assets/urbridge-logo.jpg";

const productHighlights = [
  "Resume score with clear explanation",
  "ATS keyword and role-match suggestions",
  "Project, skills, education, and experience feedback",
  "Interview preparation and counselling support",
];

const skillTrendPoints = [
  { label: "Current", value: 42, x: 28, y: 106 },
  { label: "Focus", value: 58, x: 112, y: 82 },
  { label: "Improve", value: 72, x: 196, y: 58 },
  { label: "Target", value: 86, x: 284, y: 34 },
];

const skillTrendPath =
  "M28 106 C70 96 78 88 112 82 C154 72 158 62 196 58 C236 52 250 38 284 34";

const features = [
  {
    title: "Analyze your resume",
    text: "Upload a resume or enter your details manually to understand how ready your profile is for applications.",
  },
  {
    title: "Get clear suggestions",
    text: "See practical improvements for keywords, projects, achievements, skills, and overall resume structure.",
  },
  {
    title: "Prepare with confidence",
    text: "Use interview preparation and counselling guidance after improving the resume report.",
  },
];

const steps = [
  {
    title: "Register or login",
    text: "Create your account so your resume analysis and counselling activity stays saved.",
  },
  {
    title: "Add resume information",
    text: "Upload your resume PDF or fill the manual form with your skills, projects, education, and target role.",
  },
  {
    title: "Review your report",
    text: "Check your readiness score, strengths, weak areas, and suggestions in simple language.",
  },
  {
    title: "Improve and continue",
    text: "Update your resume, prepare for interviews, or book counselling from the dashboard.",
  },
];

const benefits = [
  "Simple reports that users can read quickly",
  "Guidance focused on real resume improvement",
  "Helpful for students, freshers, job seekers, and career switchers",
  "One place for resume analysis, interview preparation, and counselling",
];

export default function MarketingLanding() {
  return (
    <main className="urbridge-landing">
      <header className="urbridge-nav">
        <Link className="urbridge-brand" to="/" aria-label="UrBridgeAI home">
          <img src={logo} alt="UrBridgeAI logo" />
        </Link>
        <nav className="urbridge-nav-links" aria-label="Landing page navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
          <Link to="/login">Sign in</Link>
          <Link className="urbridge-nav-button" to="/register">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="urbridge-hero">
        <div className="urbridge-hero-copy">
          <span className="urbridge-kicker">AI resume analysis and career guidance</span>
          <h1>Build a stronger resume and move closer to your dream job.</h1>
          <p>
            UrBridgeAI helps users understand resume quality, fix weak areas, improve ATS
            readiness, prepare for interviews, and continue with counselling support when
            needed.
          </p>
          <div className="urbridge-hero-actions">
            <Link className="urbridge-primary-button" to="/register">
              Register Free
            </Link>
            <Link className="urbridge-secondary-button" to="/login">
              Login
            </Link>
          </div>
        </div>

        <aside className="urbridge-hero-panel" aria-label="UrBridgeAI platform summary">
          <div className="urbridge-panel-header">
            <span>Resume Readiness</span>
            <strong>84</strong>
          </div>
          <p>
            Your profile is strong, but can improve with better project impact, keywords,
            and role-focused achievements.
          </p>
          <div className="urbridge-trend-card" aria-label="Skill trend analysis graph">
            <div className="urbridge-trend-header">
              <div>
                <span>Skill trend analysis</span>
                <small>Projected growth after focused improvements</small>
              </div>
              <strong>86%</strong>
            </div>
            <div className="urbridge-trend-graph">
              <svg viewBox="0 0 320 150" role="img" aria-label="Upward skill trend graph">
                <defs>
                  <linearGradient id="skillTrendGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f7cff" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#4f7cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="34" y2="34" />
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="82" y2="82" />
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="130" y2="130" />
                <path className="urbridge-trend-area" d={`${skillTrendPath} L284 130 L28 130 Z`} />
                <path className="urbridge-trend-line" d={skillTrendPath} />
                {skillTrendPoints.map((point) => (
                  <circle
                    className="urbridge-trend-point"
                    cx={point.x}
                    cy={point.y}
                    key={point.label}
                    r="5"
                  />
                ))}
              </svg>
            </div>
            <div className="urbridge-trend-labels">
              {skillTrendPoints.map((point) => (
                <span key={point.label}>
                  {point.label}
                  <strong>{point.value}%</strong>
                </span>
              ))}
            </div>
          </div>
          <ul>
            {productHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="urbridge-section" id="features">
        <div className="urbridge-section-heading">
          <h2>Everything needed to move from resume confusion to a clear action plan.</h2>
          <p>
            The website is designed so users can quickly understand what to improve and
            what to do next.
          </p>
        </div>
        <div className="urbridge-feature-grid">
          {features.map((feature, index) => (
            <article className="urbridge-feature-card" key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="urbridge-section urbridge-process-section" id="how-it-works">
        <div className="urbridge-section-heading">
          <span className="urbridge-kicker">How it works</span>
          <h2>A simple flow that any user can follow.</h2>
        </div>
        <div className="urbridge-step-grid">
          {steps.map((step, index) => (
            <article className="urbridge-step-card" key={step.title}>
              <span>{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="urbridge-info-section" id="about">
        <div>
          <span className="urbridge-kicker">Why UrBridgeAI</span>
          <h2>Built to make career preparation easier to understand.</h2>
          <p>
            Many users know their resume needs improvement, but they do not know what to
            fix first. UrBridgeAI gives structured feedback, explains the score, and
            connects users with the next useful step.
          </p>
        </div>
        <div className="urbridge-benefit-card">
          <h3>Best for</h3>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      </section>

    </main>
  );
}
