// import React from 'react'
import '../style/Header.css';
import logo from '../assets/Logo.png'
import { LuArrowUpRight } from "react-icons/lu";
const Header = () => {
  return (
    
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src={logo} alt="logo" className="logo" />
        </div>

        <nav className="nav-menu">
          <a href="#">HOME</a>
          <a href="#">SERVICES</a>
          <a href="#">PROJECTS</a>
          <a href="#">PAGE</a>
          <a href="#">BLOG</a>
          <a href="#">CONTACT</a>
        </nav>

        {/* <button className="contact-btn">
          CONTACT US
<span className="arrow-icon">
            <LuArrowUpRight size={16} />
          </span>
        </button> */}
         <button className="discover-btn">
                    DISCOVER MORE <LuArrowUpRight className="arrow-icon" />
                  </button>
      </div>
    </header>
  )
}
          
export default Header

