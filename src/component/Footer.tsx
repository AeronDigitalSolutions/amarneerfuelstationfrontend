// import React from 'react';
import '../style/Footer.css';
import logo from '../assets/Logo.png';

const Footer = () => {
  return (
    <footer className='footer'>

      <div className='footer-content'>

        <div className='logo'>
          <img src={logo} alt='logo' />
          <button className="discover-btn" style={{ marginTop: '40px' }}>
            DISCOVER MORE
          </button>
        </div>

        <div className="footer-column">
          <h4>Services</h4>
          <ul>
            <li>Branding</li>
            <li>UI and UX design</li>
            <li>Web Design</li>
            <li>SaaS Design</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Case Studies</h4>
          <ul>
            <li>Brand Mode</li>
            <li>Better AI</li>
            <li>Formwork</li>
            <li>Risetech</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            <li>Clutch</li>
            <li>Behance</li>
            <li>Dribbble</li>
            <li>Awwwards</li>
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
          <p className='right_para_yellow'>Call Creavision</p>
        </div>
      </div>

      <hr />

      <p className='footer_copy'>
        Copyright © 2025 Creavision | Powered by Onecontributor
      </p>

    </footer>
  );
};

export default Footer;
