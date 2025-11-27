import './About.css'
import Footer from "../Footer";
import Header from "../Header";
import CoreValues from './CoreValue';
import { Link } from 'react-router-dom';
import Feature from './Feature';
import GallaxySection from './GallaxySection';
import Team from './Team';
import about1 from '../../assets/about1.jpg'
import top from '../../assets/servicestop.png'
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
              OUR TALENTED <br />
              STRATEGISTS. <br />
              <span className="highlight">EXPERIENCES.</span>
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
            <p className='about_para_p'>Trusted by global brands and startups</p>
          </div>

          <button className="book-btn">
            BOOK A CALL <span className="arrow-btn"></span>
          </button>
        </div>
      </div>
      </div>

    </div>
    <CoreValues/>
    <Feature/>
    <GallaxySection/>
    <Team/>
    <Footer/>
    </>
  );
};

export default AboutSection;
