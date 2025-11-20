import '../style/Header.css';
import logo from '../assets/Logo.png'
import { Link } from 'react-router-dom';
// import { LuArrowUpRight } from "react-icons/lu";
import { FaBars } from "react-icons/fa6";
import { useState } from 'react';

const Header = () => {

  const [isOpen ,setIsOpen] = useState(false);
  const toggleMenu =()=>{
    setIsOpen(!isOpen);
  }
  return (
<>

 <header>
      <div className="container_header">
        <nav>

          <div className="logo_header">
            {/* <h2>DesignStudio</h2> */}
          <img src={logo} alt="logo" className="logo" />

          </div>

          <ul className={isOpen ? "nav_link active" : "nav_link"}>
            <li><a href='/'>Home</a></li>
            <li><Link to='/services'>Services</Link></li>
            <li><a href='#'>Blog</a></li>
            <li><a href='#'>Projects</a></li>
            {/* <li><Link  to="/sign">Blog</Link></li> */}
            <li><Link  to="/contact">CONTACT</Link></li>

            <button className="discover-btn_header">
                 <Link  to="/sign" style={{color:'#fff'}}>Sign In</Link>
                  {/* <LuArrowUpRight className="arrow-icon_header" /> */}
               </button>
          </ul>

 
          <div className="icon_header" onClick={toggleMenu}>
            <FaBars />
          </div>

        </nav>
      </div>
    </header>
 
   </>   
    
  )
}
          
export default Header

