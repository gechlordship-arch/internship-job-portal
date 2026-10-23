
import { BriefcaseBusiness, ClipboardList, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard({ user, onLogout }) {
  const isEmployer = user?.role === "employer";

  const firstName = user?.full_name
    ? user.full_name.split(" ")[0]
    : user?.fullName
      ? user.fullName.split(" ")[0]
      : "User";

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="#dashboard">
          <span className="dashboard-brand-icon">
            <BriefcaseBusiness size={23} />
          </span>
          <span>CareerBridge</span>
        </a>

        <p className="dashboard-nav-label">WORKSPACE</p>

        <nav className="dashboard-nav">
          <a className="dashboard-nav-link active" href="#dashboard">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </a>

          <a className="dashboard-nav-link" href="#opportunities">
            <BriefcaseBusiness size={19} />
            <span>{isEmployer ? "My Job Posts" : "Find Opportunities"}</span>
          </a>

          <a className="dashboard-nav-link" href="#applications">
            <ClipboardList size={19} />
            <span>{isEmployer ? "Applicants" : "My Applications"}</span>
          </a>

          <a className="dashboard-nav-link" href="#profile">
            <UserRound size={19} />
            <span>My Profile</span>
          </a>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-user-info">
            <strong>{firstName}</strong>
            <span>{user?.role || "student"}</span>
          </div>

          <button
            className="dashboard-logout"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">CAREERBRIDGE WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>

          <div className="dashboard-topbar-user">
            <span>Welcome back, {firstName}!</span>
            <div className="dashboard-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-welcome-tag">
              {isEmployer ? "EMPLOYER WORKSPACE" : "STUDENT WORKSPACE"}
            </span>
            <h2>
              {isEmployer
                ? `Welcome, ${firstName}!`
                : `Build your future, ${firstName}.`}
            </h2>
            <p>
              {isEmployer
                ? "Manage your opportunities and connect with promising candidates."
                : "Discover opportunities, grow your skills, and take the next step in your career."}
            </p>
          </div>

          <div className="dashboard-welcome-art">
            <BriefcaseBusiness size={76} strokeWidth={1.2} />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Your workspace</h2>
              <p>Quick access to your career activities.</p>
            </div>
          </div>

          <div className="dashboard-card-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple">
                <BriefcaseBusiness size={23} />
              </div>
              <p>{isEmployer ? "Job posts" : "Available opportunities"}</p>
              <strong>—</strong>
              <span>Job listings will appear here</span>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">
                <ClipboardList size={23} />
              </div>
              <p>{isEmployer ? "Applicants" : "Applications submitted"}</p>
              <strong>—</strong>
              <span>Application data will appear here</span>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon orange">
                <UserRound size={23} />
              </div>
              <p>Account type</p>
              <strong className="dashboard-role-value">
                {isEmployer ? "Employer" : "Student"}
              </strong>
              <span>Your account is ready</span>
            </article>
          </div>
        </section>

        <section className="dashboard-section dashboard-next-section">
          <div>
            <h2>{isEmployer ? "Get started with hiring" : "Your next step"}</h2>
            <p>
              {isEmployer
                ? "Create and publish job opportunities to find suitable candidates."
                : "Explore internships and entry-level jobs that match your goals."}
            </p>
          </div>

          <a
            className="dashboard-primary-button"
            href="#opportunities"
          >
            {isEmployer ? "Prepare a job post" : "Explore opportunities"}
            <span aria-hidden="true">→</span>
          </a>
        </section>

        <footer className="dashboard-footer">
          CareerBridge · Connecting talent with opportunity
        </footer>
      </main>
    </div>
  );
}
