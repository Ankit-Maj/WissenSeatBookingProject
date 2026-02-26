import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    batch: "",
    squad: "",
  });

  const handleSubmit = async () => {
    try {
      await API.post("/auth/signup", form);
      alert("Account created");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      <input placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input type="password" placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <input placeholder="Batch"
        onChange={(e) => setForm({ ...form, batch: e.target.value })}
      />

      <input placeholder="Squad"
        onChange={(e) => setForm({ ...form, squad: e.target.value })}
      />

      <button onClick={handleSubmit}>Signup</button>
    </div>
  );
}