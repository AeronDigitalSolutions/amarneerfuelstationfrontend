

import { useEffect } from "react";
import { FaEye, FaGoogle, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import "../pagecss/SignIn.css";
import { Link } from "react-router-dom";
import shape1 from "../assets/shape1.png";
import shape2 from "../assets/shape2.png";
import shape3 from "../assets/shape3.png";
import shape4 from "../assets/shape4.png";
import Header from "../component/Header";
import Footer from "../component/Footer";

const SignIn = () => {
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

  return (
    <>
      <Header />
      <div className="login-wrapper">
        {/* Parallax Shapes */}
        <img src={shape1} className="parallax shape-1" data-speed="10" />
        <img src={shape2} className="parallax shape-2" data-speed="16" />
        <img src={shape3} className="parallax shape-3" data-speed="20" />
        <img src={shape4} className="parallax shape-4" data-speed="14" />
        <img src={shape4} className="parallax shape-4" data-speed="22" />

        {/* Login Box */}
        <div className="login-box">
          <p className="title_login">
            <span className="green">E</span>rratum<span className="dot">.</span>
          </p>

          <input type="text" placeholder="Enter Username" className="input-box_sign" />

          <div className="password-wrapper">
            <input type="password" placeholder="Enter Password" className="input-box_sign" />
            <FaEye className="eye-icon" />
          </div>

          <div className="remember-row_sign">
            <label className="checkbox_signIn">
              <input type="radio"/>Remember
            </label>
            <a href="/" className="forgot">Forgot password?</a>
          </div>

          <button className="login-btn">Login</button>

          <div className="divider">
            <span>OR LOGIN WITH</span>
          </div>

          <div className="social-icons">
            <div className="iconG"><FaGoogle /></div>
            <div className="iconf"><FaFacebookF /></div>
            <div className="iconT"><FaTwitter /></div>
            <div className="iconL"><FaLinkedinIn /></div>
          </div>

          <p className="bottom-text_signIN">
            Not a member? <Link to="/signup" style={{ fontWeight: "bold", color: "#2ecc9a" }}>Sign up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignIn;
