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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

export default function SignIn() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    if (!username || !password) {
      alert("Username/email and password are required");
      return;
    }

    console.log("Calling:", `${BASE_URL}/api/auth/login`);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("modulePermissions", JSON.stringify(data.user.modulePermissions || {}));
      localStorage.setItem("customRoleName", data.user.customRoleName || "");

      // REDIRECT BASED ON ROLE
      switch (data.user.role) {
        case "Owner":
          navigate("/dashboardmain");
          break;

        case "SuperAdmin":
          navigate("/adminloginpage");
          break;

        case "Admin":
          navigate("/dashboardmain");
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
          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
