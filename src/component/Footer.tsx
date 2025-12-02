// import React from 'react';
import '../style/Footer.css';
import logo from '../assets/Logo.png';

const Footer = () => {
  return (
    <footer className='footer'>

      <div className='footer-content'>

        <div className='logo'>
          <img src={logo} alt='logo' />
          <p style={{color:'white',marginTop:'20px'}}>Smart, reliable software for managing petrol pump operations end-to-end.</p>
          <button className="discover-btn" style={{ marginTop: '40px' }}>
           Company Desk
          </button>
        </div>

        <div className="footer-column">
          <h4>Services</h4>
          <ul>
            <li>Fuel Sales & POS</li>
            <li>Tank Stock Management</li>
            <li>Attendance & Payroll</li>
            <li>Accounting & Finance</li>
            <li>Reports & Dashboard</li>
          </ul>

          
         
        </div>

        <div className="footer-column">
          <h4>Case Studies</h4>
          <ul>
            <li>Automated Pump Setup</li>
            <li>Real-Time UPI Sync</li>
            <li>Multi-Branch Management</li>
            <li>Fuel Stock Accuracy</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            <li>Support</li>
            <li>Documentation</li>
            <li>WhatsApp</li>
            <li>Help Center</li>
          </ul>
        </div>

      </div>

      <div className='footer_bottom'>
        <p className='social_media_fotter'>
          <a>Instagram</a>
          <a>Facebook</a>
          <a>LinkedIn</a>
          <a>Twitter</a>
        </p>

        <div className='right_footer_text'>
          <p>Let's work together</p>
          <p className='right_para_yellow'>Call Aeron Digital</p>
        </div>
      </div>

      <hr />

      <p className='footer_copy'>
        Copyright © 2025 Aeron Digital | Powered by Onecontributor
      </p>

    </footer>
  );
};

export default Footer;
