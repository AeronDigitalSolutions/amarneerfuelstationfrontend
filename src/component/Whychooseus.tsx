// import React from "react";
import "../style/Whychooseus.css";
import Slider from "../assets/slider4.jpg";
import why from '../assets/whychooseus.png'

const Whychooseus = () => {
  return (
    <section className="why-container">
      <div className="why-header">
        <p className="why-sub">WHY CHOOSE US?</p>
        <p className="why-title">YOUR SUCCESS IS OUR PRIORITY.</p>
      </div>

      <div className="why-grid">
        <div className="why-card purple box1">
          <p style={{display:'flex', alignItems:'center',fontWeight:'bold', fontSize:'20px'}}>Full-Service Solutions</p>
          <img src={Slider} alt="service" />
        </div>

        <div className="why-card purple box2">
          <p style={{display:'flex', alignItems:'center',fontWeight:'bold', fontSize:'20px'}}>Data-Driven Strategies That Deliver ROI</p>
          <img src={Slider} alt="strategy" />
        </div>

        <div className="why-card purple box3">
          <p style={{display:'flex', alignItems:'center',fontWeight:'bold', fontSize:'20px'}}>Proven Results Across Diverse Industry Sectors</p>
          <img src={Slider} alt="results" />
        </div>

        <div className="why-card purple box4">
          <p style={{display:'flex', alignItems:'center',fontWeight:'bold', fontSize:'20px'}}>Our clients rate us as excellent.</p>
          {/* <p>We scored 9/10, based on 200 reviews.</p> */}
          <img src={Slider} alt="team" />
        </div>

        <div className="why-card white box5">
          <p className="why-title2 ">Let’s Build Your Brand Together</p>
          <button className="contact-btn_why">
            CONTACT US <span>→</span>
          </button>
          <img src={why} alt="person" className="person-img" />
        </div>
      </div>
    </section>
  );
};

export default Whychooseus;
