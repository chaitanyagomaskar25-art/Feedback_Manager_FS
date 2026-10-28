import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Auth = ({ mode }) => {
  const isRegister = mode === "register";
  const { user, isLoading, signIn, signUp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const credentials = isRegister ? { name, email, password } : { email, password };
      if (isRegister) await signUp(credentials);
      else await signIn(credentials);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "We couldn't sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="panel auth-panel">
        <div className="auth-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
          </svg>
        </div>
        <p className="eyebrow"><span className="eyebrow-dot" /> Welcome to Kindred</p>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">
          {isRegister
            ? "Join the conversation and help make things better."
            : "Sign in to share feedback and see your dashboard."}
        </p>

        <form className="form-fields auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="field-label" htmlFor="auth-name">Your name</label>
              <input
                id="auth-name"
                className="field-input"
                autoComplete="name"
                maxLength={80}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              className="field-input"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className="field-input"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {isRegister && <p className="auth-hint">Use at least 8 characters.</p>}
          </div>
          {error && <div className="alert" role="alert">{error}</div>}
          <button type="submit" className="primary-button auth-submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Kindred?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Auth;
