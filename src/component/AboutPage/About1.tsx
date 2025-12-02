// import './About.css'
// import '../../style/About/About1.css'
import '../../style/About/About.css'
import Footer from "../Footer";
import Header from "../Header";
import CoreValues from './CoreValue';
import { Link } from 'react-router-dom';
import Feature from './Feature';
import GallaxySection from './GallaxySection';
import Team from './Team';
import about1 from '../../assets/about1.jpg'
import top from '../../assets/servicestop.png'
import Post from '../Post';
import StateSection from '../StateSection';
import ChatProject from '../ChatProject';
const AboutSection = () => {
  return (
    <>
    <Header/>
    <div className="about-wrapper">
 <div className="about-box">
      {/* White centered section */}
      {/* <img style={{width:'300px'}} src={top} alt='top'/> */}
       <img className="top-img" src={top} alt="top" />
      <div className="about-content">

       
        <div className="breadcrumb">
          <Link className='link_about' to='/'>HOME</Link>
          <span className="arrow">›</span>
          <Link className='link_about' to='#'>ABOUT</Link>
        </div>

        <div className="top-section">
          <div className="left">
            <h1>
            OUR EXPERT <br />
             INDUSTRY-READY <br />
              <span className="highlight">SOLUTIONS.</span>
            </h1>
          </div>

          <div className="right">
            <img src={about1} className="team-image" />
          </div>
        </div>

        
        <div className="line"></div>

        <div className="bottom-section">
          <div className="trusted">
            <div className="icon-star">✦</div>
            <p className='about_para_p'>Trusted by petrol pumps and fuel businesses across India.</p>
          </div>

          <button className="book-btn">
            BOOK A CALL <span className="arrow-btn"></span>
          </button>
        </div>
      </div>
      </div>

    </div>
    <Post/>
    <StateSection/>
    <CoreValues/>
    <Feature/>
    <GallaxySection/>
    <Team/>
    <ChatProject/>
    <Footer/>
    </>
  );
};

export default AboutSection;
