
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  MapPin,
  Clock,
  GraduationCap,
  Building2,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import "./App.css";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import { getJobs } from "./api/api";
const sampleJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Tech Solutions",
    location: "Remote",
    type: "Internship",
    category: "Development",
    description:
      "Build responsive web interfaces and collaborate with an experienced development team.",
    tags: ["React", "JavaScript", "CSS"],
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    company: "Digital Innovations",
    location: "Addis Ababa",
    type: "Internship",
    category: "Development",
    description:
      "Help develop APIs, work with databases, and build reliable backend services.",
    tags: ["Node.js", "PostgreSQL", "Express"],
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    company: "Creative Studio",
    location: "Hybrid",
    type: "Internship",
    category: "Design",
    description:
      "Create user-friendly interfaces and turn product ideas into thoughtful designs.",
    tags: ["Figma", "Wireframes", "Prototyping"],
  },
  {
    id: 4,
    title: "Junior Data Analyst",
    company: "Insight Analytics",
    location: "Remote",
    type: "Full-time",
    category: "Data",
    description:
      "Explore datasets, prepare reports, and communicate useful business insights.",
    tags: ["SQL", "Excel", "Python"],
  },
  {
    id: 5,
    title: "IT Support Intern",
    company: "Enterprise Systems",
    location: "Addis Ababa",
    type: "Internship",
    category: "IT Support",
    description:
      "Assist users with technical issues, troubleshooting, and computer maintenance.",
    tags: ["Networking", "Windows", "Support"],
  },
  {
    id: 6,
    title: "Junior Software Developer",
    company: "NextGen Software",
    location: "Hybrid",
    type: "Full-time",
    category: "Development",
    description:
      "Contribute to software projects and learn professional engineering practices.",
    tags: ["JavaScript", "Git", "APIs"],
  },
];

const categories = [
  { name: "All opportunities", icon: BriefcaseBusiness },
  { name: "Development", icon: GraduationCap },
  { name: "Design", icon: Building2 },
  { name: "Data", icon: Search },
  { name: "IT Support", icon: BriefcaseBusiness },
];

function App() {
  const [jobs, setJobs] = useState(sampleJobs);
  const [jobsLoading, setJobsLoading] = useState(true);
const [jobsError, setJobsError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All opportunities");
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking connection...");
  const [savedJobs, setSavedJobs] = useState([]);
  const [authView, setAuthView] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  useEffect(() => {
    const apiUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/+$/, "");

    fetch(`${apiUrl}/api/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((data) => {
        setApiStatus(
          data.status === "ok" ? "Backend connected" : "Backend unavailable"
        );
      })
      .catch(() => setApiStatus("Demo mode"));
  }, []);

useEffect(() => {
  let cancelled = false;

  async function loadJobs() {
    try {
      const data = await getJobs();

      if (!cancelled) {
        setJobs(
  data.map((job) => ({
    ...job,
    company: job.company || "Company",
    type: job.job_type || "Internship",
    category: "Development",
    tags: [],
    description: job.description || "",
    location: job.is_remote ? "Remote" : job.location,
  }))
);
        setJobsError("");
      }
    } catch (error) {
      if (!cancelled) {
        setJobsError(error.message || "Failed to load jobs.");
      }
    } finally {
      if (!cancelled) {
        setJobsLoading(false);
      }
    }
  }

  loadJobs();

  return () => {
    cancelled = true;
  };
}, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      category === "All opportunities" || job.category === category;

    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.type,
      job.description,
      ...job.tags,
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && searchableText.includes(search.toLowerCase());
  });

  function toggleSaved(id) {
    setSavedJobs((current) =>
      current.includes(id)
        ? current.filter((jobId) => jobId !== id)
        : [...current, id]
    );
  }
if (authView) {
  return (
    <AuthPage
      mode={authView}
      onSwitch={setAuthView}
      onClose={() => setAuthView(null)}
      
onSuccess={(user) => {
  setCurrentUser(user);
  setAuthView(null);
  setShowDashboard(true);
}}

    />
  );
}

if (showDashboard && currentUser) {
  return (
    <Dashboard
      user={currentUser}
      onLogout={() => {
        sessionStorage.removeItem("careerbridge_token");
        setCurrentUser(null);
        setShowDashboard(false);
      }}
    />
  );
}
   
  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">
            <BriefcaseBusiness size={23} />
          </span>
          <span>Career<span className="brand-accent">Bridge</span></span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#opportunities" onClick={() => setMenuOpen(false)}>Find jobs</a>
          <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </nav>

        <div className="nav-auth-actions">
  {currentUser ? (
    <>
      <span className="nav-user">
        Hi, {currentUser.fullName.split(" ")[0]}
      </span>
      <button
        className="nav-button"
        onClick={() => {
          sessionStorage.removeItem("careerbridge_token");
          setCurrentUser(null);
        }}
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <button className="nav-login" onClick={() => setAuthView("login")}>
        Log in
      </button>
      <button className="nav-button" onClick={() => setAuthView("register")}>
        Get started
      </button>
    </>
  )}
</div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              YOUR NEXT OPPORTUNITY STARTS HERE
            </div>

            <h1>
              Discover opportunities.
              <span> Build your future.</span>
            </h1>

            <p className="hero-description">
              Find internships and jobs that match your skills, grow your
              experience, and take the next step in your career.
            </p>

            <form
              className="search-box"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById("opportunities")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Search size={21} />
              <input
                aria-label="Search opportunities"
                placeholder="Job title, company, or skill..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Search jobs</button>
            </form>

            <div className="hero-note">
              <span><GraduationCap size={18} /> Made for students and graduates</span>
              <span><BriefcaseBusiness size={17} /> Internships and jobs</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Career opportunities illustration">
            <div className="visual-circle circle-one" />
            <div className="visual-circle circle-two" />
            <div className="floating-card floating-top">
              <span className="floating-icon purple"><GraduationCap /></span>
              <span><strong>Start learning</strong><small>Build real experience</small></span>
            </div>
            <div className="visual-main">
              <div className="visual-badge"><BriefcaseBusiness size={27} /></div>
              <div className="visual-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="visual-progress"><span /></div>
              <div className="visual-people">
                <div>G</div><div>C</div><div>A</div><span>+120 opportunities</span>
              </div>
            </div>
            <div className="floating-card floating-bottom">
              <span className="floating-icon green"><ArrowRight /></span>
              <span><strong>Your future awaits</strong><small>Take the first step today</small></span>
            </div>
          </div>
        </section>

        <section className="stats">
          <div><strong>6+</strong><span>Sample opportunities</span></div>
          <div><strong>4</strong><span>Career categories</span></div>
          <div><strong>100%</strong><span>Free to explore</span></div>
          <div><strong>24/7</strong><span>Explore anytime</span></div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <span className="section-kicker">EXPLORE YOUR PATH</span>
              <h2>Find your field</h2>
              <p>Discover opportunities in the areas you care about.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`category-card ${category === name ? "active" : ""}`}
                onClick={() => {
                  setCategory(name);
                  document.getElementById("opportunities")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <span className="category-icon"><Icon size={23} /></span>
                <span className="category-name">{name}</span>
                <ArrowRight className="category-arrow" size={19} />
              </button>
            ))}
          </div>
        </section>

        <section className="opportunities section" id="opportunities">
          <div className="section-heading jobs-heading">
            <div>
              <span className="section-kicker">YOUR NEXT CHAPTER</span>
              <h2>Featured opportunities</h2>
              <p>Explore roles to help you gain experience and grow.</p>
            </div>
            <span className="results-count">{filteredJobs.length} opportunities</span>
          </div>

          <div className="filter-row">
            <span>Showing opportunities for you</span>
            <button
              className="clear-filter"
              onClick={() => {
                setCategory("All opportunities");
                setSearch("");
              }}
            >
              Clear filters
            </button>
          </div>

          {jobsLoading ? (
  <div className="empty-state">
    <h3>Loading opportunities...</h3>
    <p>Retrieving jobs from CareerBridge.</p>
  </div>
) : jobsError ? (
  <div className="empty-state">
    <h3>Unable to load opportunities</h3>
    <p>{jobsError}</p>
    <button
      className="nav-button"
      onClick={async () => {
        setJobsLoading(true);
        setJobsError("");

        try {
          const data = await getJobs();

setJobs(
  data.map((job) => ({
    ...job,
    company: job.company || "Company",
    type: job.job_type || "Internship",
    category: "Development",
    tags: [],
    description: job.description || "",
    location: job.is_remote ? "Remote" : job.location,
  }))
);
        } catch (error) {
          setJobsError(error.message || "Failed to load jobs.");
        } finally {
          setJobsLoading(false);
        }
      }}
    >
      Try again
    </button>
  </div>
) : filteredJobs.length > 0 ? (
            <div className="job-grid">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <div className="company-logo">{job.company.charAt(0)}</div>
                    <button
                      className={`save-button ${savedJobs.includes(job.id) ? "saved" : ""}`}
                      onClick={() => toggleSaved(job.id)}
                      aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                      title={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                    >
                      {savedJobs.includes(job.id) ? "♥" : "♡"}
                    </button>
                  </div>

                  <span className="job-type">{job.type}</span>
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                  <p className="job-description">{job.description}</p>

                  <div className="job-tags">
                    {job.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>

                  <div className="job-meta">
                    <span><MapPin size={15} /> {job.location}</span>
                    <span><Clock size={15} /> {job.type}</span>
                  </div>

                  <button
                    className="apply-button"
                    onClick={() =>
                      alert(`Application for "${job.title}" will be available when we build the application feature.`)
                    }
                  >
                    View opportunity <ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={35} />
              <h3>No matching opportunities</h3>
              <p>Try a different keyword or clear your filters.</p>
              <button
                className="nav-button"
                onClick={() => {
                  setCategory("All opportunities");
                  setSearch("");
                }}
              >
                Show all opportunities
              </button>
            </div>
          )}
        </section>

        <section className="cta" id="about">
          <div className="cta-icon"><GraduationCap size={34} /></div>
          <div>
            <span className="section-kicker">YOUR FUTURE STARTS NOW</span>
            <h2>Every expert started somewhere.</h2>
            <p>Explore new possibilities and take your next step with confidence.</p>
          </div>
          <a href="#opportunities" className="cta-button">
            Find your opportunity <ArrowRight size={18} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon"><BriefcaseBusiness size={20} /></span>
          <span>Career<span className="brand-accent">Bridge</span></span>
        </a>
        <p>Connecting ambition with opportunity.</p>
        <span>© {new Date().getFullYear()} CareerBridge. Internship and Job Portal.</span>
        <span className="api-status">
          <span className={`status-dot ${apiStatus === "Backend connected" ? "" : "status-muted"}`} />
          {apiStatus}
        </span>
      </footer>
    </div>
  );
}

export default App;
