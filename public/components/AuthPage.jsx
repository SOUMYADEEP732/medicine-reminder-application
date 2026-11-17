import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Pill,
  UserRound,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value, { requireGmail = false } = {}) {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address.";
  if (requireGmail && !/@gmail\.com$/i.test(trimmed)) {
    return "Please use a Gmail address (e.g. name@gmail.com).";
  }
  return "";
}

function validateUsername(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Username is required.";
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  if (trimmed.length > 20) return "Username must be 20 characters or fewer.";
  if (!/^[a-zA-Z0-9_. ]+$/.test(trimmed)) {
    return "Use only letters, numbers, underscores, or periods.";
  }
  return "";
}

function validatePassword(value, { requireStrength = false } = {}) {
  if (!value) return "Password is required.";
  if (requireStrength) {
    if (value.length < 8) return "Use at least 8 characters.";
    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
      return "Include at least one letter and one number.";
    }
  }
  return "";
}

function validateConfirmPassword(password, confirm) {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

function getPasswordStrength(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

const STRENGTH_META = [
  { label: "Too weak", className: "weak" },
  { label: "Weak", className: "weak" },
  { label: "Fair", className: "fair" },
  { label: "Good", className: "good" },
  { label: "Strong", className: "strong" },
];

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <div className="field-error" id={id} role="alert">
      <AlertCircle size={12} />
      <span>{error}</span>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [signupTouched, setSignupTouched] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
  };

  // ---------- Login ----------

  const validateLoginField = (field, value) => {
    if (field === "email") return validateEmail(value);
    if (field === "password") return validatePassword(value, { requireStrength: true });
    return "";
  };

  const handleLoginChange = (field, value) => {
    setLoginData((current) => ({ ...current, [field]: value }));
    if (loginTouched[field]) {
      setLoginErrors((current) => ({ ...current, [field]: validateLoginField(field, value) }));
    }
  };

  const handleLoginBlur = (field) => {
    setLoginTouched((current) => ({ ...current, [field]: true }));
    setLoginErrors((current) => ({ ...current, [field]: validateLoginField(field, loginData[field]) }));
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    const nextErrors = {
      email: validateLoginField("email", loginData.email),
      password: validateLoginField("password", loginData.password),
    };
    setLoginErrors(nextErrors);
    setLoginTouched({ email: true, password: true });

    if (Object.values(nextErrors).some(Boolean)) {
      setMessage("Please fix the highlighted fields before continuing.");
      return;
    }

    setMessage("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin(data.user.email, data.user.username);
    } catch (err) {
      setMessage("Couldn't reach the server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Signup ----------

  const validateSignupField = (field, value, data) => {
    if (field === "email") return validateEmail(value, { requireGmail: true });
    if (field === "username") return validateUsername(value);
    if (field === "password") return validatePassword(value, { requireStrength: true });
    if (field === "confirmPassword") return validateConfirmPassword(data.password, value);
    return "";
  };

  const handleSignupChange = (field, value) => {
    const nextData = { ...signupData, [field]: value };
    setSignupData(nextData);

    if (signupTouched[field]) {
      setSignupErrors((current) => ({
        ...current,
        [field]: validateSignupField(field, value, nextData),
      }));
    }

    // Keep the confirm-password check live if the password field changes after it's been touched.
    if (field === "password" && signupTouched.confirmPassword) {
      setSignupErrors((current) => ({
        ...current,
        confirmPassword: validateConfirmPassword(value, signupData.confirmPassword),
      }));
    }
  };

  const handleSignupBlur = (field) => {
    setSignupTouched((current) => ({ ...current, [field]: true }));
    setSignupErrors((current) => ({
      ...current,
      [field]: validateSignupField(field, signupData[field], signupData),
    }));
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    const nextErrors = {
      email: validateSignupField("email", signupData.email, signupData),
      username: validateSignupField("username", signupData.username, signupData),
      password: validateSignupField("password", signupData.password, signupData),
      confirmPassword: validateSignupField("confirmPassword", signupData.confirmPassword, signupData),
    };
    setSignupErrors(nextErrors);
    setSignupTouched({ email: true, username: true, password: true, confirmPassword: true });

    if (Object.values(nextErrors).some(Boolean)) {
      setMessage("Please fix the highlighted fields before continuing.");
      return;
    }

    setMessage("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          username: signupData.username,
          password: signupData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Couldn't create your account.");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin(data.user.email, data.user.username);
    } catch (err) {
      setMessage("Couldn't reach the server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(signupData.password);
  const strengthMeta = STRENGTH_META[passwordStrength];
  const confirmMatches =
    signupTouched.confirmPassword &&
    !signupErrors.confirmPassword &&
    signupData.confirmPassword.length > 0;

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><Pill size={22} /></div>
          <div>
            <strong>Medicine Reminder</strong>
            <span>Simple medication management</span>
          </div>
        </div>

        <div className="auth-heading">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {mode === "login"
              ? "Log in to manage your medicines and reminders."
              : "Sign up to start managing your medicines."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={submitLogin} noValidate>
            <label htmlFor="login-email">
              Gmail
              <div className={loginErrors.email ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@gmail.com"
                  value={loginData.email}
                  onChange={(e) => handleLoginChange("email", e.target.value)}
                  onBlur={() => handleLoginBlur("email")}
                  autoComplete="email"
                  aria-invalid={Boolean(loginErrors.email)}
                  aria-describedby={loginErrors.email ? "login-email-error" : undefined}
                />
              </div>
              <FieldError id="login-email-error" error={loginErrors.email} />
            </label>

            <label htmlFor="login-password">
              Password
              <div className={loginErrors.password ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => handleLoginChange("password", e.target.value)}
                  onBlur={() => handleLoginBlur("password")}
                  autoComplete="current-password"
                  aria-invalid={Boolean(loginErrors.password)}
                  aria-describedby={loginErrors.password ? "login-password-error" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <FieldError id="login-password-error" error={loginErrors.password} />
            </label>

            <div className="auth-extra">
              <label className="remember-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-btn">Forgot password?</button>
            </div>

            {message && <div className="auth-message">{message}</div>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>

            <p className="auth-switch">
              Don't have an account?
              <button type="button" onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitSignup} noValidate>
            <label htmlFor="signup-email">
              Gmail
              <div className={signupErrors.email ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <Mail size={18} />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@gmail.com"
                  value={signupData.email}
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                  onBlur={() => handleSignupBlur("email")}
                  autoComplete="email"
                  aria-invalid={Boolean(signupErrors.email)}
                  aria-describedby={signupErrors.email ? "signup-email-error" : undefined}
                />
              </div>
              <FieldError id="signup-email-error" error={signupErrors.email} />
            </label>

            <label htmlFor="signup-username">
              Username
              <div className={signupErrors.username ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <UserRound size={18} />
                <input
                  id="signup-username"
                  type="text"
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={(e) => handleSignupChange("username", e.target.value)}
                  onBlur={() => handleSignupBlur("username")}
                  autoComplete="username"
                  aria-invalid={Boolean(signupErrors.username)}
                  aria-describedby={signupErrors.username ? "signup-username-error" : undefined}
                />
              </div>
              <FieldError id="signup-username-error" error={signupErrors.username} />
            </label>

            <label htmlFor="signup-password">
              Create password
              <div className={signupErrors.password ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <LockKeyhole size={18} />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => handleSignupChange("password", e.target.value)}
                  onBlur={() => handleSignupBlur("password")}
                  autoComplete="new-password"
                  aria-invalid={Boolean(signupErrors.password)}
                  aria-describedby={signupErrors.password ? "signup-password-error" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <FieldError id="signup-password-error" error={signupErrors.password} />

              {signupData.password.length > 0 && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={
                          i < passwordStrength
                            ? `password-strength-bar filled-${strengthMeta.className}`
                            : "password-strength-bar"
                        }
                      />
                    ))}
                  </div>
                  <span className={`password-strength-label ${strengthMeta.className}`}>
                    {strengthMeta.label}
                  </span>
                </div>
              )}
            </label>

            <label htmlFor="signup-confirm-password">
              Confirm password
              <div className={signupErrors.confirmPassword ? "auth-input-wrap has-error" : "auth-input-wrap"}>
                <LockKeyhole size={18} />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                  onBlur={() => handleSignupBlur("confirmPassword")}
                  autoComplete="new-password"
                  aria-invalid={Boolean(signupErrors.confirmPassword)}
                  aria-describedby={
                    signupErrors.confirmPassword ? "signup-confirm-password-error" : undefined
                  }
                />
              </div>
              <FieldError id="signup-confirm-password-error" error={signupErrors.confirmPassword} />
              {confirmMatches && (
                <div className="field-success">
                  <Check size={12} />
                  <span>Passwords match</span>
                </div>
              )}
            </label>

            {message && <div className="auth-message">{message}</div>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="auth-switch">
              Already have an account?
              <button type="button" onClick={() => switchMode("login")}>
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
