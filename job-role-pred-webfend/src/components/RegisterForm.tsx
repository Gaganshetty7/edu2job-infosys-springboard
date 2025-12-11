import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await register(name, email, password);

    if (res.ok) {
      navigate("/login"); // go to login after successful signup
    } else {
      setError(res.msg);
    }
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-title">Create Account</div>
      <div className="auth-subtitle">Start your career prediction journey</div>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div className="auth-field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="auth-field">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="auth-field">
        <label>Password</label>
        <input type="password" value={password} 
               onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <button type="submit" className="auth-btn">
        Create account
      </button>

      <button type="button" className="google-btn">
        <img src="https://www.svgrepo.com/show/355037/google.svg" width="18" /> 
        Sign up with Google
      </button>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </form>
  );
}
