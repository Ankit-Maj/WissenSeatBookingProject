import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Calendar as CalendarIcon, User, Armchair, Hexagon } from "lucide-react";

export default function Navbar({ user }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name.slice(0, 2).toUpperCase();
    };

    const batchColor = user?.batch === "BatchA" ? "var(--batch-a)" : "var(--batch-b)";

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-inner">
                    <Link to="/dashboard" className="navbar-logo">
                        <div className="logo-icon">🪑</div>
                        <span>WissenSeats</span>
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
                                <LayoutDashboard size={18} />
                                <span className="hide-mobile">Dashboard</span>
                            </Link>
                            <Link to="/calendar" className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
                                <CalendarIcon size={18} />
                                <span className="hide-mobile">Calendar</span>
                            </Link>
                            <Link to="/sessions" className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
                                <Armchair size={18} />
                                <span className="hide-mobile">Sessions</span>
                            </Link>
                            <Link to="/batches" className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
                                <Hexagon size={18} />
                                <span className="hide-mobile">Batches</span>
                            </Link>
                        </div>

                        <div style={{ height: "24px", width: "1px", background: "var(--border)" }} />

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "99px",
                                background: "var(--bg-card-hover)",
                                border: "1px solid var(--border)"
                            }}>
                                <div style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    background: batchColor,
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 700
                                }}>
                                    {getInitials(user?.username)}
                                </div>
                                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{user?.username}</span>
                            </div>

                            <button onClick={handleLogout} className="btn btn-ghost" style={{ color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
