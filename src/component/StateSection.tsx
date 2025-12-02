// import React from 'react'
import '../style/StateSection.css'
import AOS from 'aos';
import 'aos/dist/aos.css';

const StateSection = () => {
  AOS.init({
  duration: 1000, 
  offset: 120,    
  once: true,     
});

  return (
    <section className="stats-section">
      <div className="stats-container">

        <div className="stats-card" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom" >
          <p className="stats-number">
            20 <span>+</span>
          </p>
          <p className="stats-text">Years of Trusted Service</p>
        </div>

        <div className="stats-card" data-aos="fade-up" data-aos-delay="200" data-aos-anchor-placement="bottom-bottom">
          <p className="stats-number">
            98%<span> +</span>
          </p>
          <p className="stats-text">Client Retention Rate</p>
        </div>

        <div className="stats-card" data-aos="fade-up" data-aos-delay="400" data-aos-anchor-placement="bottom-bottom">
          <p className="stats-number">
            50% <span> +</span>
          </p>
          <p className="stats-text">Faster Operations With Automation</p>
        </div>

        <div className="stats-card" data-aos="fade-up" data-aos-delay="600" data-aos-anchor-placement="bottom-bottom">
          <p className="stats-number">
            100 <span>+</span>
          </p>
          <p className="stats-text">Active Petrol Pump Installations</p>
        </div>

      </div>
    </section>
  )
}

export default StateSection
