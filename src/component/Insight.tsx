// import React from 'react'
import '../style/Insight.css'
import img1 from '../assets/insight1.jpg'
import img2 from '../assets/Insight2.jpg'
import img3 from '../assets/insight3.jpg'


const Insight = () => {
  return (
  <section className="articles">
      <div className="articles-header">
        <p className="subtext" data-aos="fade-in">INSIGHTS & RESOURCES</p>
        <h1 className="heading">EXPLORE OUR ARTICLES.</h1>
      </div>

      <div className="articles-grid">
        <div className="article-card">
          <div className="article-image">
            <img src={img1} alt="Cognitive Biases in User Research" />
          </div>
          <div className="article-info">
            <p className="meta">Fuel Management | July 2, 2025</p>
            <h3 className='common'>Common Fuel Handling Mistakes Petrol Pumps Should Avoid</h3>
            <p className="author">by Aeron Digital</p>
          </div>
        </div>

        <div className="article-card">
          <div className="article-image">
            <img src={img2} alt="Mobile App Design Trends" />
          </div>
          <div className="article-info">
            <p className="meta">Operations | July 3, 2025</p>
            <h3 className='common'>Top Automation Trends Transforming Petrol Pumps in 2025</h3>
            <p className="author">by Aeron Digital</p>
          </div>
        </div>

        <div className="article-card">
          <div className="article-image">
            <img src={img3} alt="Web Design Agencies 2025" />
          </div>
          <div className="article-info">
            <p className="meta">Business Growth | July 3, 2025</p>
            <h3 className="common">
             How Smart Reporting Helps Petrol Pumps Boost Profitability
            </h3>
            <p className="author">by Aeron Digital</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Insight
