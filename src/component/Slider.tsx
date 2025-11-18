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
    <div className="slider-container">
      {slide === 1 && (
        <div className="slider-card">
          <div className="slider-content">
            <p className="category">
              Healthcare <span>🇳🇴</span>
            </p>
            <p className="title">
              WellPath Labs – Paid Campaigns + Landing Pages
            </p>
            <p className="desc">
              Mauris vitae quam in justo. In eget tortor a nunc vehicula tempor.
              Nam ac tincidunt ipsum, eget nisi.
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
              Finance <span>🇺🇸</span>
            </p>
            <p className="title">
              SmartBank – Digital Campaigns + Web App
            </p>
            <p className="desc">
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas.
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
              Education <span>🇮🇳</span>
            </p>
            <p className="title">
              Learnify – Marketing Strategy + Landing Pages
            </p>
            <p className="desc">
              Suspendisse potenti. Integer ac dui vel massa pulvinar feugiat.
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
              E-commerce <span>🇬🇧</span>
            </p>
            <p className="title">
              ShopEase – Paid Ads + Product Landing
            </p>
            <p className="desc">
              Ut congue sapien ac nibh fermentum, vel malesuada justo dictum.
            </p>
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
  )
}

export default Slider
