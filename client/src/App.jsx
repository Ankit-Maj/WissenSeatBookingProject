import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionView from "./pages/SessionView";
import Calendar from "./pages/Calendar";
function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/session/:sessionId" element={<ProtectedRoute> <SessionView /> </ProtectedRoute>}/>
          <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>}/>
          <Route path="/calendar" element={<ProtectedRoute> <Calendar /> </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;