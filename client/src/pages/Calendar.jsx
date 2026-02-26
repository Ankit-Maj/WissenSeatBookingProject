import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Calendar() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/sessions")
      .then(res => {
        const formatted = res.data.map(session => ({
          title: session.reservedForBatch,
          date: session.date,
          id: session._id
        }));
        setSessions(formatted);
      });
  }, []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={sessions}
      eventClick={(info) => {
        navigate(`/session/${info.event.id}`);
      }}
    />
  );
}