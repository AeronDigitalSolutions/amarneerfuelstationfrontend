

import { useEffect } from "react";
import { FaEye, FaGoogle, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import "../pagecss/SignIn.css";
// import { Link } from "react-router-dom";
// import shape1 from '../assets/signIn1.png'
// import shape2 from '../assets/sign2.png'
// import shape3 from '../assets/sign3.png'
// import shape4 from '../assets/sign4.png'
// import shape5 from '../assets/sign5.png'
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
        {/* <img src={shape1} className="parallax shape-1" data-speed="10" />
        <img src={shape2} className="parallax shape-2" data-speed="16" />
        <img src={shape3} className="parallax shape-3" data-speed="20" />
        <img src={shape4} className="parallax shape-4" data-speed="14" />
        <img src={shape4} className="parallax shape-4" data-speed="22" />
        <img src={shape5} className="parallax shape-5" data-speed="14" alt="" /> */}

        {/* Login Box */}
        <div className="login-box">
          <p className="title_login">
            <span className="green">P</span>ETROL PUMP<span className="dot">.</span>
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
            <a href="#" className="iconG"><FaGoogle /></a>
            <a href="#" className="iconf"><FaFacebookF /></a>
            <a href="#" className="iconT"><FaTwitter /></a>
            <a href="#" className="iconL"><FaLinkedinIn /></a>
          </div>

          <p className="bottom-text_signIN">
            Not a member? <a style={{ fontWeight: "bold", color: "#6f2775" }}>Sign up</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignIn;
