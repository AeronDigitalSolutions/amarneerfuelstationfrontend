// import React from 'react'
import '../style/Post.css'
// import { LuArrowUpRight } from "react-icons/lu";
import about from '../assets/about.png'
const Post = () => {
  return (

    <section className="about-section">
      <div className="about-container">
        <div className="about-left">
          <div className="about-image-frame">
            <img src={about} alt="About Us" className="about-main-img" />
          </div>


        </div>

        <div className="about-right">
          <p className="about-subtitle" data-aos="fade-in" data-aos-anchor-placement="bottom-center">ABOUT US</p>
          <p className="about-title">
            OUR ELEVATED DIGITAL  <br /> EXPERIENCES.
          </p>
          <p className="about-desc">
            We build powerful, scalable systems designed to streamline petrol pump operations.
             Our platform helps owners manage sales, stock, staff, credit, and finances 
             effortlessly—while keeping everything running smoothly every day.
          </p>
          <button className="discover-btn_post">
            DISCOVER MORE
            {/* <LuArrowUpRight className="arrow-icon" /> */}
          </button>
        </div>
      </div>
    </section>

  )
}

export default Post
