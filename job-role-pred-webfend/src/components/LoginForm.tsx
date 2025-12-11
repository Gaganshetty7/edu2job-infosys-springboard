// src/components/LoginForm.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();


  // Email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await login(email, password);
    if (res.ok) {
      navigate("/dashboard");
    } else {
      setError(res.msg);
    }
  };


  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-title">Welcome back</div>
      <div className="auth-subtitle">Login to continue your journey</div>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div className="auth-field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="auth-field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ textAlign: "right", marginBottom: 14 }}>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <button type="submit" className="auth-btn">
        Login
      </button>

      <div style={{ marginTop: 10 }}>
        <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          if (!credentialResponse.credential) {
            setError("Google login failed");
            return;
          }

          // Send the ID token to backend
          const res = await loginWithGoogle(credentialResponse.credential);
          if (res.ok) navigate("/dashboard");
          else setError("Google login failed: backend rejected token");
        }}
        onError={() => setError("Google login failed")}
      />
      </div>

      <div className="auth-footer">
        Don’t have an account? <Link to="/signup">Create one</Link>
      </div>
    </form>
  );
}
