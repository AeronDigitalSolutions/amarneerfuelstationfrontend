import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "../pagecss/SignIn.css";
import Header from "../component/Header";
import Footer from "../component/Footer";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

export default function AttendantSign() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: "Attendant" }), // fixed role
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        return;
      }

      if (data.user.role !== "Attendant") {
        alert("Only Attendants can log in here.");
        return;
      }

      // Save login session
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("username", data.user.username);

      navigate("/attendant-attendance");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <Header />

      <div className="login-wrapper">
        <div className="login-box">
          <p className="title_login">
            <span className="green">P</span>ETROL PUMP<span className="dot">.</span>
          </p>

          <input
            type="text"
            placeholder="Enter Username"
            className="input-box_sign"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className="input-box_sign"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaEye
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
