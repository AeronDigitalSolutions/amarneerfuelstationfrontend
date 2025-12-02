import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "../pagecss/SignIn.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
// import shape1 from "../assets/shape1.png";
// import shape2 from "../assets/shape2.png";
// import shape3 from "../assets/shape3.png";
// import shape4 from "../assets/shape4.png";

// 🔥 Auto Switch Backend (Local + Live)
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://amarneerfuelstationbackend.onrender.com";

export default function SignIn() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const shapes = document.querySelectorAll<HTMLImageElement>(".parallax");
      shapes.forEach((shape) => {
        const speed = Number(shape.getAttribute("data-speed") || 20);
        const x = (window.innerWidth - e.pageX * speed) / 200;
        const y = (window.innerHeight - e.pageY * speed) / 200;
        shape.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const handleLogin = async () => {
    if (!username || !password || !role) {
      alert("All fields required");
      return;
    }

    console.log("Calling:", `${BASE_URL}/api/auth/login`);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("username", data.user.username);

      // REDIRECT BASED ON ROLE
      switch (data.user.role) {
        case "Admin":
          navigate("/adminloginpage");
          break;

        case "Manager":
          navigate("/dashboard-manager");
          break;

        case "Cashier":
          navigate("/dashboard-cashier");
          break;

        case "Accountant":
          navigate("/dashboard-accountant");
          break;

        case "Attendant":
          navigate("/dashboard-attendant");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      alert("Server Error");
      console.error(err);
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

          {/* ROLE DROPDOWN */}
          <select
            className="input-box_sign"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Admin</option>
            <option>Manager</option>
            <option>Cashier</option>
            <option>Accountant</option>
            <option>Attendant</option>
          </select>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
