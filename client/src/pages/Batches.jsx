import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { ToastContext } from "../context/ToastContext";
import {
    Users,
    User as UserIcon,
    Hexagon,
    Layers,
    AlertCircle,
    TrendingUp,
    BarChart3,
    ShieldCheck
} from "lucide-react";

export default function Batches() {
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useContext(ToastContext);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sRes, uRes] = await Promise.all([
                    API.get("/auth/stats"),
                    API.get("/auth/me")
                ]);
                setData(sRes.data);
                setUser(uRes.data);
            } catch (err) {
                addToast("Failed to load batch data", "error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return (
        <div className="page-shell">
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <div className="spinner" />
            </div>
        </div>
    );

    const { stats, limits } = data;

    const StatProgressBar = ({ label, current, max, color }) => {
        const percentage = Math.min((current / max) * 100, 100);
        return (
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "flex-end" }}>
                    <div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                            {current === max ? "(Capacity Reached)" : `${max - current} spots left`}
                        </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: percentage > 90 ? "#ef4444" : "var(--text-secondary)" }}>
                        {current} / {max}
                    </span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-base)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: color,
                        borderRadius: "4px",
                        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                </div>
            </div>
        );
    };

    return (
        <div className="page-shell">
            <Navbar user={user} />

            <main className="container" style={{ padding: "2rem 1.5rem" }}>
                <header style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ marginBottom: "0.5rem" }}>Organization Status</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage batches and monitor squad capacities across the platform.</p>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start" }}>

                    {/* My Profile Section */}
                    <section>
                        <div className="card" style={{ padding: "2rem", background: "var(--bg-surface)", border: "1px solid var(--accent)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.1, color: "var(--accent)" }}>
                                <Hexagon size={180} strokeWidth={1} />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                    <UserIcon size={32} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.5rem" }}>{user?.username}</h2>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                                        <span style={{ padding: "2px 8px", background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700 }}>VERIFIED MEMBER</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div style={{ padding: "1.25rem", background: "var(--bg-base)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                        <Layers size={14} /> Assigned Batch
                                    </div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: user?.batch === 'BatchA' ? 'var(--batch-a)' : 'var(--batch-b)' }}>
                                        {user?.batch}
                                    </div>
                                </div>
                                <div style={{ padding: "1.25rem", background: "var(--bg-base)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                        <Hexagon size={14} /> Assigned Squad
                                    </div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>
                                        {user?.squad}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <ShieldCheck size={20} style={{ color: "#10b981" }} />
                                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                    Your membership is active. You can book reserved seats for <strong>{user?.batch}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <AlertCircle size={18} className="text-secondary" />
                                Capacity Rules
                            </h3>
                            <ul style={{ fontSize: "0.875rem", color: "var(--text-secondary)", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <li>Maximum <strong>{limits.batch}</strong> members per Batch.</li>
                                <li>Maximum <strong>{limits.squad}</strong> members per individual Squad.</li>
                                <li>Transfers between batches require administrative approval.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Statistics Section */}
                    <section className="card" style={{ padding: "2rem" }}>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <BarChart3 size={24} className="text-secondary" />
                            Real-time Occupancy
                        </h3>

                        <div style={{ marginBottom: "3rem" }}>
                            <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Batch Distribution</h4>
                            <StatProgressBar label="Batch A" current={stats.BatchA} max={limits.batch} color="var(--batch-a)" />
                            <StatProgressBar label="Batch B" current={stats.BatchB} max={limits.batch} color="var(--batch-b)" />
                        </div>

                        <div>
                            <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Squad Distribution</h4>
                            <StatProgressBar label="Squad 1" current={stats.Squad1} max={limits.squad} color="var(--accent)" />
                            <StatProgressBar label="Squad 2" current={stats.Squad2} max={limits.squad} color="var(--accent)" />
                            <StatProgressBar label="Squad 3" current={stats.Squad3} max={limits.squad} color="var(--accent)" />
                            <StatProgressBar label="Squad 4" current={stats.Squad4} max={limits.squad} color="var(--accent)" />
                            <StatProgressBar label="Squad 5" current={stats.Squad5} max={limits.squad} color="var(--accent)" />
                        </div>

                        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--bg-base)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <TrendingUp size={20} style={{ color: "var(--accent)" }} />
                            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Total Active Users: <strong>{stats.BatchA + stats.BatchB}</strong></span>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
