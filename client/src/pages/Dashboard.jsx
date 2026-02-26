import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome {user.username}</p>
      <p>Batch: {user.batch}</p>
      <p>Squad: {user.squad}</p>
    </div>
  );
}