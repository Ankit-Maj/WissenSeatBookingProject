import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { ToastContext } from "../context/ToastContext";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Users,
  Armchair,
  Calendar as CalendarIcon,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Calendar() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes] = await Promise.all([
          API.get("/sessions"),
          API.get("/auth/me")
        ]);
        setSessions(sRes.data);
        setUser(uRes.data);
      } catch (err) {
        addToast("Failed to fetch calendar data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  /* Stats */
  const monthSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const selectedSession = selectedDay ? sessions.find(s => {
    const dObj = new Date(s.date);
    return dObj.getFullYear() === year && dObj.getMonth() === month && dObj.getDate() === parseInt(selectedDay.split('-')[2]);
  }) : null;

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <CalendarIcon size={20} className="text-secondary" />
          <h1 style={{ fontSize: "1.5rem" }}>Session Schedule</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>

          {/* ── Main Calendar Grid ── */}
          <section className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                  {viewDate.toLocaleString('default', { month: 'long' })} {year}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{monthSessions.length} total sessions scheduled</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-ghost" onClick={prevMonth}><ChevronLeft size={18} /></button>
                <button className="btn btn-ghost" onClick={nextMonth}><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="cal-grid">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                <div key={d} className="cal-header-cell">{d.slice(0, 3)}</div>
              ))}
              {blanks.map(b => <div key={`b-${b}`} className="cal-cell other-month" />)}
              {days.map(d => {
                const dateKey = new Date(year, month, d).toLocaleDateString('en-CA');
                const session = sessions.find(s => {
                  const dObj = new Date(s.date);
                  return dObj.getFullYear() === year && dObj.getMonth() === month && dObj.getDate() === d;
                });
                const isSelected = selectedDay === dateKey;
                const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

                return (
                  <div
                    key={d}
                    className={`cal-cell clickable ${isSelected ? 'today' : ''}`}
                    style={isSelected ? { border: "2px solid var(--accent)", background: "var(--bg-card-hover)" } : {}}
                    onClick={() => setSelectedDay(dateKey)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="cal-day-num">{d}</div>
                      {session?.bookings?.some(b => String(b.userId) === String(user?._id) && b.status === "active") && (
                        <CheckCircle2 size={12} style={{ color: "var(--accent)" }} />
                      )}
                    </div>
                    {session && !session.isHoliday && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span className={`cal-event ${session.reservedForBatch === 'BatchA' ? 'batch-a' : 'batch-b'}`}>
                          {session.reservedForBatch === 'BatchA' ? 'A' : 'B'}
                        </span>
                        <div style={{ fontSize: "0.55rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          {session.bookings.filter(b => b.status === "active").length}/50
                        </div>
                      </div>
                    )}
                    {session?.isHoliday && (
                      <span className="cal-event" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Holiday</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Details Panel ── */}
          <aside className="card" style={{ position: "sticky", top: "2rem" }}>
            {!selectedDay ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ color: "var(--text-muted)", marginBottom: "1rem" }}><Info size={40} /></div>
                <h3>Select a Day</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Pick a calendar day to see session details and occupancy.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem" }}>
                    {new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                </div>

                {selectedSession ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {selectedSession.isHoliday ? (
                      <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef444433", padding: "1rem", borderRadius: "8px", color: "#f87171" }}>
                        <h4 style={{ fontSize: "0.875rem" }}>Public Holiday</h4>
                        <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>No sessions available on this day.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div style={{ padding: "0.75rem", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase" }}>Batch Duty</div>
                            <div style={{ fontWeight: 700, marginTop: "0.25rem", color: selectedSession.reservedForBatch === "BatchA" ? "var(--batch-a)" : "var(--batch-b)" }}>
                              {selectedSession.reservedForBatch}
                            </div>
                          </div>
                          <div style={{ padding: "0.75rem", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase" }}>Capacity</div>
                            <div style={{ fontWeight: 700, marginTop: "0.25rem" }}>
                              {selectedSession.bookings.filter(b => b.status === "active").length} / 50
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>Occupancy Breakdown</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {[
                              { label: "Reserved", count: selectedSession.bookings.filter(b => b.type === "reserved" && b.status === "active").length, total: 40, color: "var(--seat-reserved)" },
                              { label: "Floater", count: selectedSession.bookings.filter(b => (b.type === "floating" || b.type === "temporaryFloating") && b.status === "active").length, total: 10, color: "var(--seat-floating)" }
                            ].map(cap => (
                              <div key={cap.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                                  <span style={{ fontWeight: 600 }}>{cap.label}</span>
                                  <span style={{ color: "var(--text-muted)" }}>{cap.count} / {cap.total}</span>
                                </div>
                                <div style={{ height: "6px", background: "var(--bg-base)", borderRadius: "3px", overflow: "hidden" }}>
                                  <div style={{ height: "100%", background: cap.color, width: `${(cap.count / cap.total) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Link to={`/session/${selectedSession._id}`} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                          View Seat Grid
                          <ArrowRight size={16} />
                        </Link>
                      </>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No session scheduled for this day.</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}