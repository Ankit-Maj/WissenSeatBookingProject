import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ToastContext } from "../context/ToastContext";
import { UserPlus, User, Mail, Lock, Users, ShieldCheck } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    batch: "BatchA",
    squad: "Squad1"
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return addToast("Passwords do not match", "error");
    }
    setLoading(true);
    try {
      await API.post("/auth/signup", formData);
      addToast("Account created successfully", "success");
      navigate("/");
    } catch (err) {
      addToast(err.response?.data?.msg || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-page">
        <div className="card auth-card" style={{ maxWidth: "500px" }}>
          <div className="auth-header">
            <div style={{
              display: "inline-flex",
              padding: "1rem",
              background: "var(--accent-dim)",
              borderRadius: "16px",
              color: "var(--accent)",
              marginBottom: "1rem"
            }}>
              <UserPlus size={32} />
            </div>
            <h1>Create Account</h1>
            <p style={{ color: "var(--text-secondary)" }}>Join WissenSeats and start booking</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="ankit_m"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="ankit@wissen.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <ShieldCheck size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="password"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Batch</label>
                <div style={{ position: "relative" }}>
                  <Users size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 1 }} />
                  <select
                    className="select-input"
                    style={{ paddingLeft: "36px" }}
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  >
                    <option value="BatchA">Batch A</option>
                    <option value="BatchB">Batch B</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Squad</label>
                <div style={{ position: "relative" }}>
                  <Users size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 1 }} />
                  <select
                    className="select-input"
                    style={{ paddingLeft: "36px" }}
                    value={formData.squad}
                    onChange={(e) => setFormData({ ...formData, squad: e.target.value })}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={i + 1} value={`Squad${i + 1}`}>Squad {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <footer style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}