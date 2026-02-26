import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import { LogIn, User, Lock, Info } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", formData);
      login(res.data.token);
      addToast("Successfully signed in", "success");
      navigate("/dashboard");
    } catch (err) {
      addToast(err.response?.data?.msg || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-page">
        <div className="card auth-card">
          <div className="auth-header">
            <div style={{
              display: "inline-flex",
              padding: "1rem",
              background: "var(--accent-dim)",
              borderRadius: "16px",
              color: "var(--accent)",
              marginBottom: "1.5rem"
            }}>
              <LogIn size={32} />
            </div>
            <h1>Welcome Back</h1>
            <p style={{ color: "var(--text-secondary)" }}>Sign in to manage your seat bookings</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: "40px" }}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: "40px" }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <footer style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Don't have an account? <Link to="/signup">Create one here</Link>
            </p>
          </footer>

          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "var(--bg-base)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            display: "flex",
            gap: "0.75rem",
            fontSize: "0.75rem",
            lineHeight: "1.4"
          }}>
            <Info size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                <strong>Reserved seats</strong> can be booked up to 2 weeks in advance.
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                <strong>Floater seats</strong> open after 3:00 PM the previous day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}