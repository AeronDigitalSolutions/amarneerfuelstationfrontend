// import React from "react";
// import "./Feature.css";
import '../../style/About/Feature.css'
const Feature= () => {
  return (
    <section className="features-section">
      <h1 className="main-title">
     DELIVERING INNOVATIVE DIGITAL  <br /> PRODUCTS & SOLUTIONS.
      </h1>

      <p className="subtitle">
      We provide end-to-end software solutions that streamline fuel sales, stock control, staff management,
       and daily pump operations.
      </p>

      <div className="features-grid">
        <div className="feature-card" data-aos="fade-up" data-aos-anchor-placement="bottom-bottom">
          <h2>Passion and precision</h2>
          <p>
            We build every module with care to ensure accurate fuel, stock, and sales tracking.
          </p>
          <span className="number-badge">01</span>
        </div>

        <div className="feature-card" data-aos="fade-up" data-aos-delay="200" data-aos-anchor-placement="bottom-bottom">
          <h2>Measure twice, automate once</h2>
          <p>
           Our system reduces manual work by automating key pump operations.
          </p>
          <span className="number-badge">02</span>
        </div>

        <div className="feature-card" data-aos="fade-up" data-aos-delay="400" data-aos-anchor-placement="bottom-bottom">
          <h2>Smart design, smooth workflows</h2>
          <p>
            Easy-to-use screens streamline daily tasks for owners and staff.
          </p>
          <span className="number-badge">03</span>
        </div>

        <div className="feature-card" data-aos="fade-up" data-aos-delay="600" data-aos-anchor-placement="bottom-bottom">
          <h2>Practical — and highly effective</h2>
          <p>
            Real-world pump challenges shaped our powerful feature set.
          </p>
          <span className="number-badge">04</span>
        </div>
      </div>
    </section>
  );
};

export default Feature;
