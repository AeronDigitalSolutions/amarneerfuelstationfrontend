// import React from "react";
import "./Feature.css";

const Feature= () => {
  return (
    <section className="features-section">
      <h1 className="main-title">
        DELIVERING INNOVATIVE DIGITAL <br /> PRODUCTS & SOLUTIONS.
      </h1>

      <p className="subtitle">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
        luctus nec ullamcorper mattis, pulvinar dapibus leo.
      </p>

      <div className="features-grid">
        <div className="feature-card">
          <h2>Passion and personality</h2>
          <p>
            Curabitur at felis non libero suscipit fermentum. Duis volutpat, ante
            et scelerisque aliquet libero id nulla.
          </p>
          <span className="number-badge">01</span>
        </div>

        <div className="feature-card">
          <h2>Measure twice, code once</h2>
          <p>
            Curabitur at felis non libero suscipit fermentum. Duis volutpat, ante
            et scelerisque aliquet libero id nulla.
          </p>
          <span className="number-badge">02</span>
        </div>

        <div className="feature-card">
          <h2>Fresh design, smart business processes</h2>
          <p>
            Curabitur at felis non libero suscipit fermentum. Duis volutpat, ante
            et scelerisque aliquet libero id nulla.
          </p>
          <span className="number-badge">03</span>
        </div>

        <div className="feature-card">
          <h2>Unconventional — and highly effective</h2>
          <p>
            Curabitur at felis non libero suscipit fermentum. Duis volutpat, ante
            et scelerisque aliquet libero id nulla.
          </p>
          <span className="number-badge">04</span>
        </div>
      </div>
    </section>
  );
};

export default Feature;
