import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import SeatGrid from "../components/SeatGrid";
import Navbar from "../components/Navbar";
import { ToastContext } from "../context/ToastContext";
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function SessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sRes, uRes] = await Promise.all([
          API.get(`/sessions/${sessionId}`),
          API.get("/auth/me")
        ]);
        setSession(sRes.data);
        setUser(uRes.data);
      } catch (err) {
        addToast("Session not found", "error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionId]);

  if (loading) return (
    <div className="page-shell">
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!session) return null;

  const sessionDate = new Date(session.date);
  const isMyBatch = user?.batch === session.reservedForBatch;
  const isHoliday = session.isHoliday;

  return (
    <div className="page-shell">
      <Navbar user={user} />

      <main className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header/Hero */}
        <div style={{ marginBottom: "2.5rem" }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: "1.5rem", padding: "0.5rem 0.75rem" }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <CalendarIcon size={20} className="text-secondary" />
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {sessionDate.toLocaleDateString(undefined, { weekday: 'long' })} Session
                </span>
                {isHoliday && <span style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.625rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>HOLIDAY</span>}
              </div>
              <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                {sessionDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </h1>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <MapPin size={16} />
                  Main Campus, Floor 4
                </div>
                <div style={{ width: "4px", height: "4px", background: "var(--border)", borderRadius: "50%" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem", color: session.reservedForBatch === "BatchA" ? "var(--batch-a)" : "var(--batch-b)", fontWeight: 700 }}>
                  <Users size={16} />
                  Duty: {session.reservedForBatch}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "1rem 1.5rem", background: "var(--bg-base)" }}>
              <div style={{ display: "flex", gap: "2rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Capacity</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{session.bookings.filter(b => b.status === "active").length} <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>/ 50</span></div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Status</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--green)" }}>Open</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isHoliday ? (
          <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ color: "#ef4444", marginBottom: "1.5rem" }}><ShieldAlert size={48} /></div>
            <h2>Public Holiday Blocked</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0.5rem auto" }}>
              Sessions are not available on public holidays. Please select another date.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>

            {/* Seat Grid Area */}
            <div className="card" style={{ padding: "1.5rem 2rem" }}>
              <SeatGrid session={session} currentUserId={user?._id} />
            </div>

            {/* Rules & Info Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={16} className="text-secondary" />
                  Session Windows
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "0.75rem", background: "var(--bg-base)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, fontStyle: "uppercase", color: "var(--text-muted)" }}>BATCH PRIORITY</div>
                    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600 }}>
                      {isMyBatch ? (
                        <><CheckCircle2 size={14} style={{ color: "var(--green)" }} /> Your Batch (Eligible)</>
                      ) : (
                        <><ShieldAlert size={14} style={{ color: "var(--batch-b)" }} /> {session.reservedForBatch} Only</>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    <p style={{ marginBottom: "0.5rem" }}>• Reserved seats bookable up to 2 weeks out.</p>
                    <p>• Floating seats unlock after 3:00 PM the previous day.</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: "1.25rem", background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
                <h3 style={{ fontSize: "0.9rem", color: "white", marginBottom: "0.5rem" }}>Booking confirmed?</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Your seat selection is instant. Once booked, navigate to the Dashboard to see your session pass.
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}