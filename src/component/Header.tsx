import '../style/Header.css';
import logo from '../assets/Logo.png';
import { Link } from 'react-router-dom';
import { FaBars } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import { useState } from 'react';

const Header = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen && <div className="menu_overlay" onClick={toggleMenu}></div>}

      <header>
        <div className="container_header">
          <nav>

            <div className="logo_header">
              <img src={logo} alt="logo" className="logoh" />
            </div>

            <ul className={isOpen ? "nav_link active" : "nav_link"}>
              <li><a href="/">Home</a></li>
              <li><Link to="/dashboard">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>

              <div className="mobile-sign-btn">
                <Link to="/sign">Sign In</Link>
              </div>
            </ul>

            <Link to="/sign" className="discover-btn_header desktop-only-btn">
              <span style={{ color: "#fff" }}>Sign In</span>
            </Link>

            <div className="icon_header" onClick={toggleMenu}>
              {isOpen ? <FaXmark /> : <FaBars />}
            </div>

          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
