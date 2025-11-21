import React, { useRef } from "react";
import "../style/Testimonial.css";
import carousel1 from "../assets/Testimonials-1.jpg";
import carousel2 from "../assets/Testimonials-03.jpg";
import carousel3 from "../assets/Testimonials-04.jpg";
import carousel4 from "../assets/Testimonials-02.jpg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  IoMdArrowDropleftCircle,
  IoMdArrowDroprightCircle,
} from "react-icons/io";

const Testimonials: React.FC = () => {
  // ✅ Properly type the ref for react-slick
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    infinite: true,
    speed: 500,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="testimonial">
      <div className="testimonial_text">
        <p className=""test_text>Testimonials</p>
        <p className="text_para">REAL FEEDBACK FROM REAL CLIENTS.</p>
      </div>

      <div className="slider-container">
        <Slider ref={sliderRef} {...settings}>
          {[carousel1, carousel2, carousel3, carousel4].map((image, index) => (
            <div className="slide-box" key={index}>
              <div className="testimonial-card">
                <div className="testimonial-header">
                  <img src={image} alt={`User ${index + 1}`} className="user-image" />
                  <div className="user-info">
                    <h4>Julia</h4>
                    <p>Marketing Director,</p>
                  </div>
                </div>

                <hr className="divider" />

                <p className="testimonial-text">
                  Creavision built an amazing website for us. Highly recommend
                  their Website Development service!
                </p>

                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-text">5.0 RATING</span>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        <div
          className="custom-arrow custom-prev"
          onClick={() => sliderRef.current?.slickPrev()}
        >
          <IoMdArrowDropleftCircle size={60} color="black" />
        </div>
        <div
          className="custom-arrow custom-next"
          onClick={() => sliderRef.current?.slickNext()}
        >
          <IoMdArrowDroprightCircle size={60} color="black" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
