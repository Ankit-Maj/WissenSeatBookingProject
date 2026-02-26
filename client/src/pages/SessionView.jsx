import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import SeatGrid from "../components/SeatGrid";

export default function SessionView() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    API.get("/sessions")
      .then(res => {
        const found = res.data.find(s => s._id === sessionId);
        setSession(found);
      });
  }, []);

  if (!session) return <h2>Loading...</h2>;

  return (
    <div>
      <h2>Session</h2>
      <p>Date: {new Date(session.date).toDateString()}</p>
      <p>Reserved for: {session.reservedForBatch}</p>

      <SeatGrid session={session} />
    </div>
  );
}