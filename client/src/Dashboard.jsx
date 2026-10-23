
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  UserRound,
  PlusCircle,
  MapPin,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getJobs } from "./api/api";
import "./Dashboard.css";
import { API_URL } from "./api/api";

export default function Dashboard({ user, onLogout }) {
  const isEmployer = user?.role === "employer";

  const firstName = user?.full_name
    ? user.full_name.split(" ")[0]
    : user?.fullName
      ? user.fullName.split(" ")[0]
      : "User";

  const [showJobForm, setShowJobForm] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [jobMessage, setJobMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [publishedJobs, setPublishedJobs] = useState([]);
  
const [opportunities, setOpportunities] = useState([]);
const [loadingOpportunities, setLoadingOpportunities] = useState(true);
const [opportunitiesError, setOpportunitiesError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "internship",
    location: "",
    isRemote: false,
    applicationDeadline: "",
    companyName: "",
    companyDescription: "",
    companyWebsite: "",
    companyLocation: "",
  });

  useEffect(() => {
    if (isEmployer) {
      setLoadingOpportunities(false);
      return;
    }

    let cancelled = false;

    async function loadOpportunities() {
      try {
        const jobs = await getJobs();

        if (!cancelled) {
          setOpportunities(jobs);
          setOpportunitiesError("");
        }
      } catch (error) {
        if (!cancelled) {
          setOpportunitiesError(
            error.message || "Unable to load jobs."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOpportunities(false);
        }
      }
    }

    loadOpportunities();

    return () => {
      cancelled = true;
    };
  }, [isEmployer]);

  function handleJobChange(event) {
    const { name, value, type, checked } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleJobSubmit(event) {
    event.preventDefault();
    setSavingJob(true);
    setJobMessage("");
    setMessageType("");

    const token = sessionStorage.getItem("careerbridge_token");

    if (!token) {
      setJobMessage("Your session has expired. Please log in again.");
      setMessageType("error");
      setSavingJob(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not publish the job.");
      }

      setPublishedJobs((previous) => [data.job, ...previous]);
      setJobMessage("Your job has been published successfully!");
      setMessageType("success");

      setJobForm({
        title: "",
        description: "",
        requirements: "",
        jobType: "internship",
        location: "",
        isRemote: false,
        applicationDeadline: "",
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        companyLocation: "",
      });

      setShowJobForm(false);
    } catch (error) {
      setJobMessage(
        error.message || "Unable to connect to the server. Please try again.",
      );
      setMessageType("error");
    } finally {
      setSavingJob(false);
    }
  }

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

          <a
            className="dashboard-nav-link"
            href={isEmployer ? "#my-job-posts" : "#opportunities"}
          >
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

      <main className="dashboard-main" id="dashboard">
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

        {jobMessage && (
          <div
            className={`dashboard-job-message ${messageType}`}
            role="status"
          >
            {messageType === "success" ? (
              <CheckCircle size={19} />
            ) : (
              <AlertCircle size={19} />
            )}
            <span>{jobMessage}</span>
            <button
              type="button"
              onClick={() => setJobMessage("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

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
              <p>{isEmployer ? "Jobs posted this session" : "Available opportunities"}</p>
              <strong>{isEmployer ? publishedJobs.length : "—"}</strong>
              <span>
                {isEmployer
                  ? "Jobs published during this session"
                  : "Job listings will appear here"}
              </span>
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

        {isEmployer ? (
          <section className="dashboard-section" id="my-job-posts">
            <div className="dashboard-section-heading">
              <div>
                <h2>Manage job posts</h2>
                <p>Create opportunities and make them visible to students.</p>
              </div>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => {
                  setShowJobForm((previous) => !previous);
                  setJobMessage("");
                }}
              >
                {showJobForm ? <X size={18} /> : <PlusCircle size={18} />}
                {showJobForm ? "Close form" : "Post a job"}
              </button>
            </div>

            {showJobForm && (
              <form className="dashboard-job-form" onSubmit={handleJobSubmit}>
                <div className="dashboard-form-heading">
                  <div>
                    <h3>Create a job opportunity</h3>
                    <p>Complete the details below to publish your listing.</p>
                  </div>
                </div>

                <div className="dashboard-form-grid">
                  <label className="dashboard-field">
                    Job title *
                    <input
                      name="title"
                      value={jobForm.title}
                      onChange={handleJobChange}
                      placeholder="e.g. Frontend Developer Intern"
                      maxLength={150}
                      required
                    />
                  </label>

                  <label className="dashboard-field">
                    Job type *
                    <select
                      name="jobType"
                      value={jobForm.jobType}
                      onChange={handleJobChange}
                      required
                    >
                      <option value="internship">Internship</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </label>

                  <label className="dashboard-field dashboard-field-full">
                    Job description *
                    <textarea
                      name="description"
                      value={jobForm.description}
                      onChange={handleJobChange}
                      placeholder="Describe the role and responsibilities..."
                      rows={5}
                      maxLength={10000}
                      required
                    />
                  </label>

                  <label className="dashboard-field dashboard-field-full">
                    Requirements *
                    <textarea
                      name="requirements"
                      value={jobForm.requirements}
                      onChange={handleJobChange}
                      placeholder="List the skills, education, and experience required..."
                      rows={4}
                      maxLength={10000}
                      required
                    />
                  </label>

                  <label className="dashboard-field">
                    Work location *
                    <span className="dashboard-input-with-icon">
                      <MapPin size={18} />
                      <input
                        name="location"
                        value={jobForm.location}
                        onChange={handleJobChange}
                        placeholder="e.g. Addis Ababa"
                        maxLength={150}
                        required
                      />
                    </span>
                  </label>

                  <label className="dashboard-field">
                    Application deadline
                    <input
                      name="applicationDeadline"
                      type="date"
                      value={jobForm.applicationDeadline}
                      onChange={handleJobChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </label>

                  <label className="dashboard-checkbox-field">
                    <input
                      name="isRemote"
                      type="checkbox"
                      checked={jobForm.isRemote}
                      onChange={handleJobChange}
                    />
                    This is a remote position
                  </label>

                  <div className="dashboard-form-divider">
                    <h3>Company information</h3>
                    <p>These details help students identify your organization.</p>
                  </div>

                  <label className="dashboard-field">
                    Company name *
                    <input
                      name="companyName"
                      value={jobForm.companyName}
                      onChange={handleJobChange}
                      placeholder="e.g. Example Technologies"
                      maxLength={150}
                      required
                    />
                  </label>

                  <label className="dashboard-field">
                    Company location
                    <input
                      name="companyLocation"
                      value={jobForm.companyLocation}
                      onChange={handleJobChange}
                      placeholder="e.g. Addis Ababa, Ethiopia"
                      maxLength={150}
                    />
                  </label>

                  <label className="dashboard-field dashboard-field-full">
                    Company description
                    <textarea
                      name="companyDescription"
                      value={jobForm.companyDescription}
                      onChange={handleJobChange}
                      placeholder="Tell students about your company..."
                      rows={3}
                      maxLength={5000}
                    />
                  </label>

                  <label className="dashboard-field dashboard-field-full">
                    Company website
                    <input
                      name="companyWebsite"
                      type="url"
                      value={jobForm.companyWebsite}
                      onChange={handleJobChange}
                      placeholder="https://example.com"
                      maxLength={255}
                    />
                  </label>
                </div>

                <div className="dashboard-form-actions">
                  <button
                    type="button"
                    className="dashboard-secondary-button"
                    onClick={() => setShowJobForm(false)}
                    disabled={savingJob}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="dashboard-primary-button"
                    disabled={savingJob}
                  >
                    {savingJob ? (
                      <>
                        <LoaderCircle className="dashboard-spinner" size={18} />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        Publish job
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="dashboard-posted-jobs">
              {publishedJobs.length === 0 ? (
                <div className="dashboard-empty-state">
                  <BriefcaseBusiness size={35} />
                  <h3>No jobs posted in this session yet</h3>
                  <p>
                    Publish your first opportunity. It will be saved to the
                    database and can appear in the public job listings.
                  </p>
                  {!showJobForm && (
                    <button
                      type="button"
                      className="dashboard-secondary-button"
                      onClick={() => setShowJobForm(true)}
                    >
                      Create your first job
                    </button>
                  )}
                </div>
              ) : (
                publishedJobs.map((job) => (
                  <article className="dashboard-posted-job" key={job.id}>
                    <div className="dashboard-posted-job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>
                    <div className="dashboard-posted-job-info">
                      <h3>{job.title}</h3>
                      <p>
                        {job.company} · {job.job_type || job.jobType}
                      </p>
                      <span>
                        <MapPin size={15} />
                        {job.location || "Location not specified"}
                      </span>
                    </div>
                    <span className="dashboard-published-label">
                      Published
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : (
  <>
    <section className="dashboard-section dashboard-next-section">
      <div>
        <h2>Your next step</h2>
        <p>
          Explore internships and entry-level jobs that match your goals.
        </p>
      </div>

      <a
        className="dashboard-primary-button"
        href="#opportunities"
      >
        Explore opportunities <span aria-hidden="true">→</span>
        </a>
    </section>

    <section className="dashboard-section" id="opportunities">
      <div className="dashboard-section-heading">
        <div>
          <h2>Featured Opportunities</h2>
          <p>Discover jobs published by employers on CareerBridge.</p>
        </div>
        <strong>{opportunities.length} opportunities</strong>
      </div>

      {loadingOpportunities ? (
        <p>Loading opportunities...</p>
      ) : opportunitiesError ? (
        <p>{opportunitiesError}</p>
      ) : opportunities.length === 0 ? (
        <p>No opportunities are available right now.</p>
      ) : (
        <div className="dashboard-opportunity-list">
          {opportunities.map((job) => (
            <article
              className="dashboard-opportunity-card"
              key={job.id}
            >
              <div className="dashboard-posted-job-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div className="dashboard-posted-job-info">
                <h3>{job.title}</h3>
                <p>{job.company || "Company"}</p>
                <span>
                  <MapPin size={15} />
                  {job.is_remote
                    ? "Remote"
                    : job.location || "Location not specified"}
                </span>
                <p>{job.description}</p>
                <span>{job.job_type || "Internship"}</span>
                <button
  type="button"
  className="dashboard-primary-button"
  onClick={() => setSelectedJob(job)}
>
  View Details →
</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
    
    {selectedJob && (
      <div className="dashboard-modal-overlay">
        <section
          className="dashboard-job-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-details-title"
        >
          <button
            type="button"
            className="dashboard-modal-close"
            onClick={() => setSelectedJob(null)}
            aria-label="Close job details"
          >
            ×
          </button>

          <span className="dashboard-welcome-tag">
            JOB DETAILS
          </span>

          <h2 id="job-details-title">{selectedJob.title}</h2>
          <h3>{selectedJob.company || "Company"}</h3>

          <p>
            <strong>Location:</strong>{" "}
            {selectedJob.is_remote
              ? "Remote"
              : selectedJob.location || "Not specified"}
          </p>

          <p>
            <strong>Job type:</strong>{" "}
            {selectedJob.job_type || "Not specified"}
          </p>

          <p>
            <strong>Description:</strong>
            <br />
            {selectedJob.description || "No description provided."}
          </p>

          <p>
            <strong>Requirements:</strong>
            <br />
            {selectedJob.requirements || "No requirements provided."}
          </p>

          <p>
            <strong>Application deadline:</strong>{" "}
            {selectedJob.application_deadline
              ? new Date(
                  selectedJob.application_deadline
                ).toLocaleDateString()
              : "Not specified"}
          </p>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() =>
              alert("The application form will be added in the next step.")
            }
          >
            Apply for this job →
          </button>
        </section>
      </div>
    )}

  </>
)}


        <footer className="dashboard-footer">
          CareerBridge · Connecting talent with opportunity
        </footer>
      </main>
    </div>
  );
}
