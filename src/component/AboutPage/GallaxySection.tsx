// import React from 'react'
import '../AboutPage/GallaxySection.css'
import GS1 from '../../assets/GS1.jpg'
import GS2 from '../../assets/GS2.jpg'
import GS3 from '../../assets/GS3.jpg'
import GS4 from '../../assets/GS$.jpg'
import GS5 from '../../assets/GS5.jpg'
const GallaxySection = () => {
  return (
   <section className="gallery-section">

      <div className="gallery-grid">

        <img src={GS1} className="gallery-card" alt="" />
        <img src={GS2} className="gallery-card" alt="" />
        <img src={GS3} className="gallery-card" alt="" />

        <img src={GS4} className="gallery-card-large" alt="" />
        {/* <img src='https://creavision.1onestrong.com/wp-content/uploads/2025/07/Image-09-800x534.jpg' className="gallery-card" alt="" /> */}

        {/* TEAM BOX */}
        <div className="team-box">
          <h3>50+ team members</h3>

          <div className="team-avatars">
            <img src={GS5}alt="" />
            {/* <img src={avatar2} alt="" />
            <img src={avatar3} alt="" />
            <img src={avatar4} alt="" /> */}
          </div>

          <button className="team-btn">
            JOIN OUR TEAM →
          </button>
        </div>

      </div>

    </section>
  )
}

export default GallaxySection
