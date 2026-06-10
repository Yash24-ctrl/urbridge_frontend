import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import logo from "../Icon.png";

const productHighlights = [
  "Resume score with clear explanation",
  "ATS keyword and role-match suggestions",
  "Project, skills, education, and experience feedback",
  "Interview preparation and counselling support",
];

const skillTrendPoints = [
  { label: "Jan", value: 42, x: 28, y: 106 },
  { label: "Feb", value: 54, x: 70, y: 88 },
  { label: "Mar", value: 49, x: 112, y: 96 },
  { label: "Apr", value: 68, x: 154, y: 62 },
  { label: "May", value: 58, x: 196, y: 80 },
  { label: "Jun", value: 78, x: 238, y: 44 },
  { label: "Jul", value: 86, x: 284, y: 34 },
];

const skillTrendPath =
  "M28 106 L70 88 L112 96 L154 62 L196 80 L238 44 L284 34";

const skillTrendBenchmarkPath =
  "M28 78 L70 102 L112 84 L154 92 L196 72 L238 58 L284 70";

const skillTrendFocusPath =
  "M28 118 L70 110 L112 104 L154 88 L196 82 L238 60 L284 48";

const platformStats = [
  {
    value: "3-in-1",
    label: "Resume analysis, interview prep, and counselling",
  },
  {
    value: "ATS",
    label: "Keyword guidance for better role matching",
  },
  {
    value: "AI + Expert",
    label: "Clear suggestions with counselling support",
  },
];

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

const reviews = [
  {
    name: "Yash Kansara",
    role: "Data Scientist",
    text: "UrBridgeAI gave me clear resume suggestions and helped me present my data science projects with better impact.",
    rating: "5.0",
  },
  {
    name: "Heli Bhavsar",
    role: "Website Developer",
    text: "The platform made it easy to understand weak areas in my resume and improve my developer profile.",
    rating: "4.9",
  },
  {
    name: "Hetvi Kateliya",
    role: "Designing",
    text: "I liked how the feedback explained what to improve in simple words without making the process confusing.",
    rating: "4.8",
  },
  {
    name: "Devansh Kayasth",
    role: "Full Stack Developer",
    text: "UrBridgeAI helped me organize my technical skills, projects, and role keywords in a more professional way.",
    rating: "5.0",
  },
  {
    name: "Dhruvi Pande",
    role: "Digital Marketing",
    text: "The resume report was practical and helped me highlight marketing skills, tools, and achievements better.",
    rating: "4.9",
  },
];

const benefits = [
  "Simple reports that users can read quickly",
  "Guidance focused on real resume improvement",
  "Helpful for students, freshers, job seekers, and career switchers",
  "One place for resume analysis, interview preparation, and counselling",
];

export default function MarketingLanding() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const reviewTrackRef = useRef(null);
  const [isCounsellingMenuOpen, setIsCounsellingMenuOpen] = useState(false);

  useEffect(() => {
    const track = reviewTrackRef.current;

    if (!track) {
      return undefined;
    }

    let animationFrameId;
    let loopDistance = 0;
    let offset = 0;
    let lastTimestamp = 0;
    const pixelsPerSecond = 34;

    const moveTrack = () => {
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    };

    const measureLoop = () => {
      const duplicateStartIndex = Math.floor(track.children.length / 2);
      const duplicateStart = track.children[duplicateStartIndex];

      loopDistance = duplicateStart?.offsetLeft || track.scrollWidth / 2;
      offset = loopDistance > 0 ? offset % loopDistance : 0;
      moveTrack();
    };

    const animateReviews = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const elapsed = Math.min(timestamp - lastTimestamp, 80);
      lastTimestamp = timestamp;

      if (loopDistance > 0) {
        offset = (offset + (elapsed / 1000) * pixelsPerSecond) % loopDistance;
        moveTrack();
      }

      animationFrameId = window.requestAnimationFrame(animateReviews);
    };

    const resetAnimationClock = () => {
      lastTimestamp = 0;
    };

    measureLoop();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureLoop)
        : null;

    if (resizeObserver) {
      resizeObserver.observe(track);
    }

    document.fonts?.ready?.then(measureLoop).catch(() => {});
    window.addEventListener("resize", measureLoop);
    document.addEventListener("visibilitychange", resetAnimationClock);
    animationFrameId = window.requestAnimationFrame(animateReviews);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measureLoop);
      document.removeEventListener("visibilitychange", resetAnimationClock);
    };
  }, []);

  const handleCounsellingTrigger = () => {
    setIsCounsellingMenuOpen((isOpen) => !isOpen);
  };

  const handleCallCounsellor = () => {
    if (!user) {
      sessionStorage.setItem("postAuthRedirect", "/counselling");
      navigate("/login", { state: { redirectTo: "/counselling" } });
      return;
    }

    setIsCounsellingMenuOpen(false);
    navigate("/counselling");
  };

  const handleYourSessions = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsCounsellingMenuOpen(false);
    navigate("/dashboard", { state: { openSessions: true } });
  };

  return (
    <main className="urbridge-landing">
      <header className="urbridge-nav">
        <Link className="urbridge-brand" to="/" aria-label="UrBridgeAI home">
          <img src={logo} alt="UrBridgeAI logo" />
        </Link>
        <nav className="urbridge-nav-links" aria-label="Landing page navigation">
          <a href="#features">Features</a>
          <div className="urbridge-counselling-menu">
            <button
              type="button"
              className="urbridge-counselling-trigger"
              aria-haspopup="menu"
              aria-expanded={isCounsellingMenuOpen}
              onClick={handleCounsellingTrigger}
            >
              <span>AI Counselling</span>
              <span className="urbridge-counselling-chevron" aria-hidden="true" />
            </button>
            {isCounsellingMenuOpen && (
              <div className="urbridge-counselling-dropdown" role="menu">
                <button
                  type="button"
                  className="urbridge-counselling-option"
                  role="menuitem"
                  onClick={handleCallCounsellor}
                >
                  Call with Counsellor
                </button>
                <button
                  type="button"
                  className="urbridge-counselling-option"
                  role="menuitem"
                  onClick={handleYourSessions}
                >
                  Your Sessions
                </button>
              </div>
            )}
          </div>
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
          <div className="urbridge-hero-stats" aria-label="UrBridgeAI platform highlights">
            {platformStats.map((stat) => (
              <div className="urbridge-hero-stat" key={stat.value}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
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
                  <linearGradient id="skillTrendLineGradient" x1="28" x2="284" y1="106" y2="34">
                    <stop offset="0%" stopColor="#0b3d91" />
                    <stop offset="58%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f7cff" />
                  </linearGradient>
                </defs>
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="38" y2="38" />
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="76" y2="76" />
                <line className="urbridge-trend-grid" x1="24" x2="296" y1="114" y2="114" />
                <line className="urbridge-trend-axis" x1="24" x2="296" y1="132" y2="132" />
                <path className="urbridge-trend-area" d={`${skillTrendPath} L284 132 L28 132 Z`} />
                <path className="urbridge-trend-benchmark" d={skillTrendBenchmarkPath} />
                <path className="urbridge-trend-focus" d={skillTrendFocusPath} />
                <path className="urbridge-trend-line" d={skillTrendPath} />
                {skillTrendPoints.map((point) => (
                  <g key={point.label}>
                    <circle
                      className="urbridge-trend-point"
                      cx={point.x}
                      cy={point.y}
                      r="4"
                    />
                    <text className="urbridge-trend-month" x={point.x} y="146">
                      {point.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="urbridge-trend-labels">
              <span>
                <i className="urbridge-trend-legend urbridge-trend-legend-main" />
                Skill growth
              </span>
              <span>
                <i className="urbridge-trend-legend urbridge-trend-legend-benchmark" />
                Benchmark
              </span>
              <span>
                <i className="urbridge-trend-legend urbridge-trend-legend-focus" />
                Target path
              </span>
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

      <section className="urbridge-section urbridge-reviews-section" aria-label="User reviews">
        <div className="urbridge-section-heading">
          <span className="urbridge-kicker">User reviews</span>
          <h2>What users say about UrBridgeAI.</h2>
          <p>
            Example feedback from students and job seekers who use the platform to
            improve resumes, prepare better, and move with more clarity.
          </p>
        </div>
        <div className="urbridge-review-loop">
          <div className="urbridge-review-track" ref={reviewTrackRef}>
            {reviews.map((review) => (
              <article className="urbridge-review-card" key={review.name}>
                <div className="urbridge-review-top">
                  <span>{review.name.split(" ").map((word) => word[0]).join("")}</span>
                  <strong>{review.rating}</strong>
                </div>
                <p>{review.text}</p>
                <div>
                  <h3>{review.name}</h3>
                  <small>{review.role}</small>
                </div>
              </article>
            ))}
            {reviews.map((review) => (
              <article
                aria-hidden="true"
                className="urbridge-review-card"
                key={`${review.name}-duplicate`}
              >
                <div className="urbridge-review-top">
                  <span>{review.name.split(" ").map((word) => word[0]).join("")}</span>
                  <strong>{review.rating}</strong>
                </div>
                <p>{review.text}</p>
                <div>
                  <h3>{review.name}</h3>
                  <small>{review.role}</small>
                </div>
              </article>
            ))}
          </div>
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

      <footer className="urbridge-footer">
        <p>
          Copyright &copy; 2026{" "}
          <a href="https://neuronet.in/" target="_blank" rel="noreferrer">
            NeuronetSystems
          </a>{" "}
          Pvt Ltd All Rights Reserved.
        </p>
        <p>
          Contact us{" "}
          <a href="mailto:info@neuronet.in">
            info@neuronet.in
          </a>
        </p>
      </footer>
    </main>
  );
}
