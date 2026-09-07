import { useEffect, useRef, useState } from "react";

function Auth({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    const completeGoogleLogin = async (credential) => {
      setMessage("");
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Google authentication failed");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        onAuthenticated(data.user);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => completeGoogleLogin(response.credential),
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 340,
        text: "continue_with",
        shape: "rectangular",
      });
    };

    if (window.google?.accounts?.id) renderGoogleButton();
    else window.addEventListener("google-loaded", renderGoogleButton);
    return () => window.removeEventListener("google-loaded", renderGoogleButton);
  }, [googleClientId, onAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Authentication failed");

      if (isRegistering) {
        setIsRegistering(false);
        setMessage("Account created. Sign in with your new credentials.");
      } else {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        onAuthenticated(data.user);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Behavioral Impact Tracker</p>
        <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-copy">Sign in to access your behavioral impact workspace.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input required minLength={3} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" />
          </label>
          <label>
            Password
            <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={isRegistering ? "new-password" : "current-password"} />
          </label>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>
          {!isRegistering && (
            <>
              <div className="auth-divider"><span>or continue with</span></div>
              {googleClientId ? <div ref={googleButtonRef} className="google-button" /> : <p className="google-config">Google Sign-In requires `VITE_GOOGLE_CLIENT_ID` in `client/.env`.</p>}
            </>
          )}
        <button className="auth-switch" type="button" onClick={() => { setIsRegistering(!isRegistering); setMessage(""); }}>
          {isRegistering ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </section>
    </main>
  );
}

export default Auth;