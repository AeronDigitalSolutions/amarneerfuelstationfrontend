// import React from 'react'
// import { ChevronLeft, ChevronRight } from "lucide-react";
import { RiArrowRightSLine } from "react-icons/ri";
import { useState } from 'react';
import { GoArrowUpRight } from "react-icons/go";
import '../style/Slider.css'
import slider2 from '../assets/slider2.jpg'
import slider3 from '../assets/slider3.jpg'
import '../assets/slider4.jpg'
import { RiArrowLeftSLine } from "react-icons/ri";
import slider from '../assets/slider1.jpg'
import slider4 from '../assets/slider4.jpg'
const Slider = () => {
  const [slide, setSlide] = useState(1);

  const nextSlide = () => setSlide(slide === 4 ? 1 : slide + 1);
  const prevSlide = () => setSlide(slide === 1 ? 4 : slide - 1);
  return (
    <>
      <div className='slider_top_container'>
        <p className='slider_top_para' data-aos="fade-in" data-aos-anchor-placement="bottom-center">ourproject</p>
        <p className='slider_top_tittle'>LATEST PROJECT POWERFUL RESULTS..</p>
      </div>
      <div className="slider-container">
        {slide === 1 && (
          <div className="slider-card">
            <div className="slider-content">
              <p className="category">
                PETROL PUMP SOFTWARE
                {/* <span>🇳🇴</span> */}
              </p>
              <p className="title">
                Complete Pump Management System
              </p>
              <p className="desc">
                A unified platform to manage sales, stock, staff, credit, and accounts with real-time automation for improved accuracy and speed.
              </p>
              <a href="#" className="project-link">
                View Project →
              </a>
            </div>
            <div className="slider-image">
              <img src={slider} alt="slide1" />
            </div>
          </div>
        )}

        {slide === 2 && (
          <div className="slider-card">
            <div className="slider-content">
              <p className="category">
                {/* Finance <span>🇺🇸</span> */}
                PETROLEUM OPERATIONS
              </p>
              <p className="title">
                Automation Dashboard + Web App
              </p>
              <p className="desc">
                A smart system designed to streamline daily pump activities, manage fuel data, track staff, and simplify accounting for smoother operations.
              </p>
              <a href="#" className="project-link">
                View Project →
              </a>
            </div>
            <div className="slider-image">
              <img src={slider2} alt="slide2" />
            </div>
          </div>
        )}

        {slide === 3 && (
          <div className="slider-card">
            <div className="slider-content">
              <p className="category">
                OPERATIONS TECH
              </p>
              <p className="title">
                Pump Insights + Reporting Suite
              </p>
              <p className="desc">
                A streamlined reporting module that gives petrol pump owners quick insights into sales, stock, credits, and daily performance.
              </p>
              <a href="#" className="project-link">
                View Project →
              </a>
            </div>
            <div className="slider-image">
              <img src={slider3} alt="slide3" />
            </div>
          </div>
        )}

        {slide === 4 && (
          <div className="slider-card">
            <div className="slider-content">
              <p className="category">
                ENTERPRISE SOLUTIONS
              </p>
              <p className="title">
                POS Integration + Billing Module
              </p>
              <p className="desc">
                A fast, reliable POS and billing system designed to handle daily fuel transactions with accuracy and smooth workflow.              </p>
              <a href="#" className="project-link">
                View Project <GoArrowUpRight />

              </a>
            </div>
            <div className="slider-image">
              <img src={slider4} alt="slide4" />
            </div>
          </div>
        )}

        <div className="slider-controls">
          <button onClick={prevSlide} className="nav-btn">
            {/* <ChevronLeft /> */}
            <RiArrowLeftSLine />

          </button>
          <span className="page-count">
            {slide} / 4
          </span>
          <button onClick={nextSlide} className="nav-btn">
            {/* <ChevronRight /> */}
            <RiArrowRightSLine />

          </button>
        </div>
      </div>
    </>
  )
}

export default Slider
