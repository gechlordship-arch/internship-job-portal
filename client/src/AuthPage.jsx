
import { useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser } from "./api/api";
import "./AuthPage.css";

export default function AuthPage({ mode, onSwitch, onClose, onSuccess }) {
  const isRegister = mode === "register";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isRegister
        ? await registerUser({ fullName, email, password, role })
        : await loginUser({ email, password });

      // Keep the token for this browser tab only.
      sessionStorage.setItem("careerbridge_token", result.token);
      onSuccess(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onClose} type="button">
        <ArrowLeft size={18} /> Back to opportunities
      </button>

      <section className="auth-card">
        <a className="auth-brand" href="#home" onClick={onClose}>
          <span className="auth-brand-icon"><BriefcaseBusiness size={24} /></span>
          <span>Career<span>Bridge</span></span>
        </a>

        <div className="auth-heading">
          <p className="auth-kicker">
            {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
          </p>
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p>
            {isRegister
              ? "Join CareerBridge and take the next step in your career."
              : "Log in to continue your career journey."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                minLength={2}
                maxLength={120}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={255}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <span className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                minLength={isRegister ? 8 : undefined}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </span>
          </label>

          {isRegister && (
            <label>
              I am joining as
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student — find opportunities</option>
                <option value="employer">Employer — hire talent</option>
              </select>
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={() => onSwitch(isRegister ? "login" : "register")}>
            {isRegister ? "Log in" : "Register"}
          </button>
        </p>

        <p className="auth-note">
          Your password is securely hashed by the server before being stored.
        </p>
      </section>
    </main>
  );
}
