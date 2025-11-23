
import Footer from '../component/Footer'
import { FiMail } from "react-icons/fi";
import { FiSend } from "react-icons/fi";
import test from '../assets/Testimonials-1.jpg'
import { FiMessageCircle } from "react-icons/fi";
import top from '../assets/white_top.png'
import '../style/ContactRoute.css'
import Header from './Header';
const ContactRoute = () => {
  return (
    <>
    <Header/>
    
    
     <div className="contact-container">
      <p className="contact-title">
        LET US HELP <span>YOU.</span>
      </p>

      <div className="contact-points">
        <p>↘️ &nbsp;We will respond to you within 12 hours.</p>
        <p>↘️ &nbsp;Project details and create a brief.</p>
        <p>↘️ &nbsp;We’ll sign an NDA if requested.</p>
      </div>

      <div className="profile-section">
        <img
          src={test}
          alt="Profile"
          className="profile-img"
        />

        <div className="profile-text">
          <h3>Project Talk</h3>
          <p>Chief Executive Officer</p>
        </div>
      </div>

      <div className="contact-buttons">
        <button className="email-btn">
          <FiMail size={20} />
          hello@creavision.mail.com
        </button>

        <button className="icon-btn">
          <FiSend size={22} />
        </button>

        <button className="icon-btn">
          <FiMessageCircle size={22} />
        </button>
      </div>
    </div>






       <div className="form-wrapper">
        <img className='top_white' src={top} alt='top'/>
      <div className="form-container">

        <div className="form-grid">
          <div className="form-group">
           
            <input type="text" placeholder='First Name' />
          </div>

       
          <div className="form-group">
            <input type="text" placeholder='Last Name'/>
          </div>

          <div className="form-group">
            <input type="email" placeholder='Your Email'/>
          </div>

          <div className="form-group">
            <input type="text" placeholder='Phone number (optional)' />
          </div>
        </div>

        <div className="form-textarea">
          <label>About Your Projects</label>
          <textarea></textarea>
        </div>

        {/* Button */}
        <button className="submit-btn">LET'S GET STARTED</button>
      </div>
    </div>
   
  <Footer/>
    </>
  )
}

export default ContactRoute
