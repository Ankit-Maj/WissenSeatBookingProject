import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { ToastContext } from "../context/ToastContext";
import { Check, Trash2, Info, Armchair, ChevronRight, MapPin, Clock } from "lucide-react";

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

export default function SeatGrid({ session: initialSession, currentUserId }) {
  const { addToast } = useContext(ToastContext);
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => { setSession(initialSession); }, [initialSession]);

  const refresh = async () => {
    try {
      const res = await API.get(`/sessions/${session._id}`);
      setSession(res.data);
      setSelectedSeat(null);
    } catch (err) {
      addToast("Failed to refresh session data", "error");
    }
  };

  const activeBookings = session.bookings?.filter(b => b.status === "active") || [];
  const seatMap = {};
  activeBookings.forEach(b => { if (b.seatNumber) seatMap[b.seatNumber] = b; });

  const myBooking = activeBookings.find(b => String(b.userId) === String(currentUserId));
  const reservedBooked = activeBookings.filter(b => b.type === "reserved").length;
  const floatBooked = activeBookings.filter(b => b.type === "floating").length;
  const tempFloatSlots = activeBookings.filter(b => b.type === "temporaryFloating" && !b.userId).length;
  const tempFloatFilled = activeBookings.filter(b => b.type === "temporaryFloating" && b.userId).length;
  const totalFloatCap = TOTAL_FLOATING + tempFloatSlots + tempFloatFilled;
  const floatOpen = isFloatingOpen(session.date);
  const isPast = new Date(session.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleBook = async (type, requestedSeat) => {
    setLoading(true);
    try {
      const res = await API.post("/bookings/book", {
        sessionId: session._id,
        type,
        requestedSeat
      });
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
    let cls = "seat";

    if (booking) {
      if (String(booking.userId) === String(currentUserId)) cls += " mine";
      else if (booking.type === "reserved") cls += " reserved";
      else if (booking.type === "floating") cls += " floating";
      else if (booking.type === "temporaryFloating") cls += " temp-float";
    } else {
      cls += " free";
      if (selectedSeat === seatNum) cls += " selected";
    }

    return cls;
  };

  const handleSeatClick = (num) => {
    if (seatMap[num] || isPast) return;
    setSelectedSeat(num === selectedSeat ? null : num);
  };

  const getActiveZone = () => {
    if (!selectedSeat) return null;
    return selectedSeat <= 40 ? "reserved" : "floating";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* Reserved Zone */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", color: "var(--text-primary)" }}>Reserved Zone</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Exclusive to {session.reservedForBatch} (Seats 1-40)</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{40 - reservedBooked} Available</div>
            <div style={{ width: "80px", height: "4px", background: "var(--bg-base)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
              <div style={{ width: `${(reservedBooked / 40) * 100}%`, height: "100%", background: "var(--seat-reserved)" }} />
            </div>
          </div>
        </div>
        <div className="seat-grid">
          {Array.from({ length: TOTAL_RESERVED }, (_, i) => i + 1).map(num => {
            const booking = seatMap[num];
            return (
              <div
                key={num}
                className={getSeatClass(num)}
                onClick={() => handleSeatClick(num)}
                style={{ cursor: booking || isPast ? "default" : "pointer" }}
                title={booking ? `Seat ${num}: ${booking.username}` : `Seat ${num}: Available`}
              >
                {booking ? (
                  <span style={{ fontSize: "0.625rem", fontWeight: 800 }}>
                    {booking.username?.charAt(0).toUpperCase()}
                  </span>
                ) : num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Zone */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", color: "var(--text-primary)" }}>Floater Zone</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Open to everyone after 3PM (Seats 41+)</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{totalFloatCap - (floatBooked + tempFloatFilled)} Available</div>
            <div style={{ width: "80px", height: "4px", background: "var(--bg-base)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
              <div style={{ width: `${((floatBooked + tempFloatFilled) / totalFloatCap) * 100}%`, height: "100%", background: "var(--seat-floating)" }} />
            </div>
          </div>
        </div>
        {!floatOpen && !isPast && (
          <div style={{ background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Clock size={20} style={{ color: "var(--seat-floating)" }} />
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Unlocks Today at 3:00 PM</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Standard floating seats (41-50) will become available for all members.</p>
            </div>
          </div>
        )}
        <div className="seat-grid">
          {Array.from({ length: TOTAL_FLOATING + tempFloatSlots + tempFloatFilled }, (_, i) => i + 41).map(num => {
            const booking = seatMap[num];
            return (
              <div
                key={num}
                className={getSeatClass(num)}
                onClick={() => handleSeatClick(num)}
                style={{ cursor: booking || isPast ? "default" : "pointer" }}
                title={booking ? `Seat ${num}: ${booking.username}` : `Seat ${num}: Available`}
              >
                {booking ? (
                  <span style={{ fontSize: "0.625rem", fontWeight: 800 }}>
                    {booking.username?.charAt(0).toUpperCase()}
                  </span>
                ) : num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Floating Action Panel */}
      {!isPast && (
        <div style={{
          position: "sticky",
          bottom: "1.5rem",
          background: "var(--bg-surface)",
          padding: "1.25rem",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10
        }}>
          {myBooking ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--seat-mine)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.25rem", fontWeight: 800 }}>
                  {myBooking.seatNumber}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>You are booked!</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Seat {myBooking.seatNumber} ({myBooking.type})</div>
                </div>
              </div>
              <button className="btn btn-danger" style={{ height: "48px", padding: "0 1.5rem" }} onClick={handleCancel} disabled={loading}>
                <Trash2 size={18} />
                Vacate Workspace
              </button>
            </>
          ) : selectedSeat ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontSize: "1.25rem", fontWeight: 800 }}>
                  {selectedSeat}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>Seat {selectedSeat} Selected</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Confirm your {getActiveZone()} booking</div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ height: "48px", padding: "0 2rem" }}
                onClick={() => handleBook(getActiveZone(), selectedSeat)}
                disabled={loading || (getActiveZone() === 'floating' && !floatOpen)}
              >
                Confirm Booking
                <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>Ready to book?</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Select an available seat above to begin</div>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ height: "48px", opacity: 0.5, cursor: "default" }}>
                Select a Seat
              </button>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", padding: "1.25rem", background: "var(--bg-base)", borderRadius: "12px", border: "1px solid var(--border)" }}>
        {[
          { color: "var(--seat-free)", label: "Available" },
          { color: "var(--seat-reserved)", label: "Reserved" },
          { color: "var(--seat-floating)", label: "Floater" },
          { color: "var(--seat-temp-float)", label: "Temporary" },
          { color: "var(--seat-mine)", label: "Your Seat" }
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}