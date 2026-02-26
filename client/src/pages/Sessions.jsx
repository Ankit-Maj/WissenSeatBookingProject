import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { ToastContext } from "../context/ToastContext";
import { Link } from "react-router-dom";
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    MapPin,
    MoveRight,
    CheckCircle2,
    CircleSlash,
    Clock,
    Users
} from "lucide-react";

export default function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const { addToast } = useContext(ToastContext);

    const loadData = async () => {
        try {
            const [sRes, uRes] = await Promise.all([
                API.get("/sessions"),
                API.get("/auth/me")
            ]);
            setSessions(sRes.data);
            setUser(uRes.data);
        } catch (err) {
            addToast("Failed to load sessions", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleQuickBook = async (sessionId, type) => {
        try {
            const res = await API.post("/bookings/book", { sessionId, type });
            addToast(res.data.msg, "success");
            loadData();
        } catch (err) {
            addToast(err.response?.data?.msg || "Booking failed", "error");
        }
    };

    const filteredSessions = sessions
        .filter(s => {
            const dateStr = new Date(s.date).toLocaleDateString();
            const matchesSearch = dateStr.includes(search) || s.reservedForBatch?.includes(search);
            const isPast = new Date(s.date) < new Date().setHours(0, 0, 0, 0);

            if (filter === "upcoming") return !isPast && matchesSearch;
            if (filter === "my-batch") return s.reservedForBatch === user?.batch && matchesSearch;
            return matchesSearch;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (loading) return (
        <div className="page-shell">
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <div className="spinner" />
            </div>
        </div>
    );

    return (
        <div className="page-shell">
            <Navbar user={user} />

            <main className="container" style={{ padding: "2rem 1.5rem" }}>
                <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ marginBottom: "0.5rem" }}>Browse Sessions</h1>
                        <p style={{ color: "var(--text-secondary)" }}>View all available work sessions and reserve your spot instantly.</p>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ position: "relative" }}>
                            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search date or batch..."
                                style={{ paddingLeft: "40px", width: "240px" }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select className="select-input" style={{ width: "160px" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Sessions</option>
                            <option value="upcoming">Upcoming Only</option>
                            <option value="my-batch">My Batch Days</option>
                        </select>
                    </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                    {filteredSessions.map(session => {
                        const sDate = new Date(session.date);
                        const isPast = sDate < new Date().setHours(0, 0, 0, 0);
                        const isMyBatch = user?.batch === session.reservedForBatch;
                        const myBooking = session.bookings.find(b => b.userId === user?._id && b.status === "active");
                        const reservedCount = session.bookings.filter(b => b.type === "reserved" && b.status === "active").length;
                        const floatCount = session.bookings.filter(b => (b.type === "floating" || b.type === "temporaryFloating") && b.status === "active").length;

                        return (
                            <div key={session._id} className="card" style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.25rem",
                                opacity: isPast ? 0.6 : 1,
                                border: myBooking ? "1px solid var(--accent)" : "1px solid var(--border)",
                                background: myBooking ? "rgba(99, 102, 241, 0.03)" : "var(--bg-card)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                                            {sDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: session.reservedForBatch === 'BatchA' ? 'var(--batch-a)' : 'var(--batch-b)' }}>
                                            <Users size={14} />
                                            Duty: {session.reservedForBatch}
                                        </div>
                                    </div>
                                    {myBooking && (
                                        <div style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "4px 10px", borderRadius: "99px", fontSize: "0.625rem", fontWeight: 800 }}>
                                            BOOKED SEAT {myBooking.seatNumber}
                                        </div>
                                    )}
                                    {session.isHoliday && (
                                        <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "99px", fontSize: "0.625rem", fontWeight: 800 }}>
                                            HOLIDAY
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ padding: "0.75rem", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                        <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase" }}>Reserved</div>
                                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{reservedCount} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>/ 40</span></div>
                                    </div>
                                    <div style={{ padding: "0.75rem", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                        <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase" }}>Floating</div>
                                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{floatCount} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>/ 10+</span></div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                                    <Link to={`/session/${session._id}`} className="btn btn-ghost" style={{ flex: 1 }}>
                                        View Grid
                                    </Link>
                                    {!isPast && !session.isHoliday && !myBooking && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1.5 }}
                                            onClick={() => handleQuickBook(session._id, isMyBatch ? "reserved" : "floating")}
                                        >
                                            Quick Book
                                            <MoveRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredSessions.length === 0 && (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 2rem" }}>
                            <CircleSlash size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                            <h3>No sessions found</h3>
                            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
