import API from "../services/api";

export default function SeatGrid({ session }) {

  const activeBookings = session.bookings.filter(
    b => b.status === "active"
  );

  const bookedSeats = activeBookings.map(b => b.seatNumber);

  const handleBooking = async (type) => {
    try {
      const res = await API.post("/bookings/book", {
        sessionId: session._id,
        type
      });

      alert(`Seat ${res.data.seatNumber} booked`);
      window.location.reload();

    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  const handleCancel = async () => {
    try {
      await API.post("/bookings/cancel", {
        sessionId: session._id
      });

      alert("Seat cancelled");
      window.location.reload();

    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  return (
    <div>
      <h3>Seats</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 40px)", gap: "10px" }}>
        {[...Array(50)].map((_, i) => {
          const seatNum = i + 1;
          const isBooked = bookedSeats.includes(seatNum);

          return (
            <div
              key={seatNum}
              style={{
                width: "40px",
                height: "40px",
                border: "1px solid black",
                background: isBooked ? "gray" : "white"
              }}
            >
              {seatNum}
            </div>
          );
        })}
      </div>

      <br />

      <button onClick={() => handleBooking("reserved")}>
        Book Reserved
      </button>

      <button onClick={() => handleBooking("floating")}>
        Book Floating
      </button>

      <button onClick={handleCancel}>
        Cancel Seat
      </button>
    </div>
  );
} 