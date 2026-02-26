import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { ToastContext } from "../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Users,
  Armchair,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();

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
      addToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await API.post("/sessions/generate");
      addToast(res.data.msg, "success");
      loadData();
    } catch (err) {
      addToast("Failed to generate sessions", "error");
    } finally {
      setGenLoading(false);
    }
  };

  // ── Calendar Helpers ──────────────────────────────────────────
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  /* Stats derived from loaded sessions */
  const activeBookingsCount = sessions.reduce((acc, s) => {
    return acc + (s.bookings?.filter(b => b.userId && String(b.userId) === String(user?._id) && b.status === "active").length || 0);
  }, 0);

  const upcomingSessions = sessions
    .filter(s => new Date(s.date) >= new Date().setHours(0, 0, 0, 0) && !s.isHoliday)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

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
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Good afternoon, {user?.username} 👋</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {user?.batch} • {user?.squad} • Manage your seat bookings for upcoming sessions
          </p>
        </header>

        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-label">Your Active Bookings</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>{activeBookingsCount}</div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Next 30 days</p>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Total Workspaces</div>
            <div className="stat-value">50</div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>40 Reserved / 10 Floating</p>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Sessions Loaded</div>
            <div className="stat-value">{sessions.length}</div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>In current database</p>
          </div>
          <div className="card stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={genLoading} style={{ width: "100%" }}>
              <RefreshCw size={16} className={genLoading ? "spin" : ""} />
              {genLoading ? "Loading..." : "Generate Sessions"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* ── Left: Main Calendar ── */}
          <section className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem" }}>
                {viewDate.toLocaleString('default', { month: 'long' })} {year}
              </h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-ghost" style={{ padding: "0.4rem" }} onClick={prevMonth}><ChevronLeft size={16} /></button>
                <button className="btn btn-ghost" style={{ padding: "0.4rem" }} onClick={nextMonth}><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="cal-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="cal-header-cell">{d}</div>
              ))}
              {blanks.map(b => <div key={`b-${b}`} className="cal-cell other-month" />)}
              {days.map(d => {
                const session = sessions.find(s => {
                  const dObj = new Date(s.date);
                  return dObj.getFullYear() === year && dObj.getMonth() === month && dObj.getDate() === d;
                });
                const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

                return (
                  <div key={d} className={`cal-cell clickable ${isToday ? 'today' : ''}`} onClick={() => session && navigate(`/session/${session._id}`)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="cal-day-num">{d}</div>
                      {session?.bookings?.some(b => String(b.userId) === String(user?._id) && b.status === "active") && (
                        <CheckCircle2 size={12} style={{ color: "var(--accent)" }} />
                      )}
                    </div>
                    {session && !session.isHoliday && (
                      <span className={`cal-event ${session.reservedForBatch === 'BatchA' ? 'batch-a' : 'batch-b'}`}>
                        {session.reservedForBatch === 'BatchA' ? 'A' : 'B'}
                      </span>
                    )}
                    {session?.isHoliday && (
                      <span className="cal-event" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Holiday</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Right: Sidebar ── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Upcoming Sessions */}
            <div className="card">
              <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={18} className="text-secondary" />
                Next Available Sessions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {upcomingSessions.length === 0 && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No sessions available</p>}
                {upcomingSessions.map(s => {
                  const myBooking = s.bookings.find(b => String(b.userId) === String(user?._id) && b.status === 'active');
                  return (
                    <Link key={s._id} to={`/session/${s._id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "1rem",
                        background: "var(--bg-base)",
                        borderRadius: "8px",
                        border: myBooking ? "1px solid var(--accent)" : "1px solid var(--border)",
                        transition: "var(--transition)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }} className="card-hover">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {myBooking && <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {s.reservedForBatch} • {50 - s.bookings.filter(b => b.status === 'active').length} available
                          </div>
                        </div>
                        {myBooking ? (
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>Seat {myBooking.seatNumber}</div>
                        ) : (
                          <MapPin size={16} style={{ color: "var(--text-muted)" }} />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="card" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
              <h3 style={{ fontSize: "0.875rem", color: "var(--accent-hover)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={16} />
                Booking Rule Reminder
              </h3>
              <ul style={{ fontSize: "0.75rem", color: "var(--text-secondary)", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li><strong>Week 1:</strong> Batch A (M-W), Batch B (T-F)</li>
                <li><strong>Week 2:</strong> Batch B (M-W), Batch A (T-F)</li>
                <li>Floaters open after 3PM the prior day.</li>
                <li>Reserved seats bookable 14 days out.</li>
              </ul>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}