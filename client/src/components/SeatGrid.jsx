import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { ToastContext } from "../context/ToastContext";
import { Check, Trash2, Info } from "lucide-react";

const TOTAL_RESERVED = 40;
const TOTAL_FLOATING = 10;

/* ── helpers ─────────────────────────────────────────── */
const isFloatingOpen = (sessionDate) => {
  const now = new Date();
  const cutoff = new Date(sessionDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(15, 0, 0, 0); // 3:00 PM the previous day
  return now >= cutoff;
};

/* ── SeatGrid ──────────────────────────────────────────── */
export default function SeatGrid({ session: initialSession, currentUserId }) {
  const { addToast } = useContext(ToastContext);
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSession(initialSession); }, [initialSession]);

  const refresh = async () => {
    const res = await API.get(`/sessions/${session._id}`);
    setSession(res.data);
  };

  const activeBookings = session.bookings?.filter(b => b.status === "active") || [];
  const seatMap = {};
  activeBookings.forEach(b => { if (b.seatNumber) seatMap[b.seatNumber] = b; });

  const myBooking = activeBookings.find(b => b.userId === currentUserId);
  const reservedBooked = activeBookings.filter(b => b.type === "reserved").length;
  const floatBooked = activeBookings.filter(b => b.type === "floating").length;
  const tempFloatSlots = activeBookings.filter(b => b.type === "temporaryFloating" && !b.userId).length;
  const tempFloatFilled = activeBookings.filter(b => b.type === "temporaryFloating" && b.userId).length;
  const totalFloatCap = TOTAL_FLOATING + tempFloatSlots + tempFloatFilled;
  const floatOpen = isFloatingOpen(session.date);
  const isPast = new Date(session.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleBook = async (type) => {
    setLoading(true);
    try {
      const res = await API.post("/bookings/book", { sessionId: session._id, type });
      addToast(res.data.msg, "success");
      await refresh();
    } catch (err) {
      addToast(err.response?.data?.msg || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await API.post("/bookings/cancel", { sessionId: session._id });
      addToast(res.data.msg, "success");
      await refresh();
    } catch (err) {
      addToast(err.response?.data?.msg || "Cancel failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSeatClass = (seatNum) => {
    const booking = seatMap[seatNum];
    if (!booking) return "seat free";
    if (booking.userId === currentUserId) return "seat mine";
    if (booking.type === "reserved") return "seat reserved";
    if (booking.type === "floating") return "seat floating";
    if (booking.type === "temporaryFloating") return "seat temp-float";
    return "seat free";
  };

  const getSeatTitle = (seatNum) => {
    const booking = seatMap[seatNum];
    if (!booking) return `Seat ${seatNum} - Available`;
    const who = booking.userId === currentUserId ? "You" : (booking.username || "Taken");
    return `Seat ${seatNum} - ${who}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Reserved Zone */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--seat-reserved)" }}>●</span> Reserved Zone (1-40)
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{reservedBooked}/40 Booked</span>
        </div>
        <div className="seat-grid">
          {Array.from({ length: TOTAL_RESERVED }, (_, i) => i + 1).map(num => (
            <div key={num} className={getSeatClass(num)} title={getSeatTitle(num)}>
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Zone */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--seat-floating)" }}>●</span> Floating Zone (41-50)
            {tempFloatSlots > 0 && <span style={{ fontSize: "0.7rem", background: "var(--batch-b-dim)", color: "var(--batch-b)", padding: "2px 6px", borderRadius: "4px" }}>+{tempFloatSlots} Temp</span>}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{floatBooked + tempFloatFilled}/{totalFloatCap} Booked</span>
        </div>
        {!floatOpen && !isPast && (
          <div style={{ background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Info size={16} style={{ color: "var(--seat-floating)" }} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Floater seats unlock after <strong>3:00 PM</strong> the previous day.
            </p>
          </div>
        )}
        <div className="seat-grid">
          {Array.from({ length: TOTAL_FLOATING + tempFloatSlots + tempFloatFilled }, (_, i) => i + 41).map(num => (
            <div key={num} className={getSeatClass(num)} title={getSeatTitle(num)}>
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isPast && (
        <div className="card" style={{ background: "var(--bg-base)" }}>
          {myBooking ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--seat-mine)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>
                  {myBooking.seatNumber}
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Your Seat Reserved</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Session: {new Date(session.date).toLocaleDateString()}</div>
                </div>
              </div>
              <button className="btn btn-danger" onClick={handleCancel} disabled={loading}>
                <Trash2 size={16} />
                Vacate Seat
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, height: "48px" }}
                onClick={() => handleBook("reserved")}
                disabled={loading || reservedBooked >= TOTAL_RESERVED}
              >
                <Check size={18} />
                Book Reserved ({40 - reservedBooked} left)
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, height: "48px" }}
                onClick={() => handleBook("floating")}
                disabled={loading || !floatOpen || (floatBooked + tempFloatFilled) >= totalFloatCap}
              >
                <Armchair size={18} />
                Book Floater ({totalFloatCap - floatBooked - tempFloatFilled} left)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", padding: "1rem", background: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)" }}>
        {[
          { color: "var(--seat-free)", label: "Available" },
          { color: "var(--seat-reserved)", label: "Reserved Zone" },
          { color: "var(--seat-floating)", label: "Floater Zone" },
          { color: "var(--seat-temp-float)", label: "Temp Floater" },
          { color: "var(--seat-mine)", label: "Your Seat" }
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}