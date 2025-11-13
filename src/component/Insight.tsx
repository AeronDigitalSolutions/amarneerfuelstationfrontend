// import React from 'react'
import '../style/Insight.css'
import img1 from '../assets/insight1.jpg'
import img2 from '../assets/insight2.jpg'
import img3 from '../assets/insight3.jpg'


const Insight = () => {
  return (
  <section className="articles">
      <div className="articles-header">
        <p className="subtext">INSIGHTS & RESOURCES</p>
        <h1 className="heading">EXPLORE OUR ARTICLES.</h1>
      </div>

      <div className="articles-grid">
        {/* -------- CARD 1 -------- */}
        <div className="article-card">
          <div className="article-image">
            <img src={img1} alt="Cognitive Biases in User Research" />
          </div>
          <div className="article-info">
            <p className="meta">SEO Optimization | July 2, 2025</p>
            <h3>Cognitive Biases in User Research You Should Avoid</h3>
            <p className="author">by creapixels</p>
          </div>
        </div>

        {/* -------- CARD 2 -------- */}
        <div className="article-card">
          <div className="article-image">
            <img src={img2} alt="Mobile App Design Trends" />
          </div>
          <div className="article-info">
            <p className="meta">App Design | July 3, 2025</p>
            <h3>Top Mobile App Design Trends to Follow in 2025</h3>
            <p className="author">by creapixels</p>
          </div>
        </div>

        {/* -------- CARD 3 -------- */}
        <div className="article-card">
          <div className="article-image">
            <img src={img3} alt="Web Design Agencies 2025" />
          </div>
          <div className="article-info">
            <p className="meta">Website Design | July 3, 2025</p>
            <h3>
              Top 10 Web Design Agencies Worldwide in 2025 for Your Projects
            </h3>
            <p className="author">by creapixels</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Insight
