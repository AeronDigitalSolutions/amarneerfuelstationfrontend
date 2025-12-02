// import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../style/Testimonial.css'
import img1 from "../assets/Testimonials-1.jpg";
import img2 from '../assets/Testimonials-02.jpg'
import img4 from '../assets/Testimonials-03.jpg'
import img5 from '../assets/Testimonials-04.jpg'
const Testimonials = () => {
  // DESKTOP SLIDER
  const desktopSettings = {
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  // MOBILE SLIDER
  const mobileSettings = {
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 1800,
    infinite: true,
    slidesToShow: 1,       // 👈 ONLY ONE SLIDE ON MOBILE
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  const data = [
   { name: "Aman", role: "CEO", img: img2, text: "System is smooth and very easy to use." },
  { name: "Riya", role: "Owner", img: img4, text: "Daily reports are accurate and helpful." },
  { name: "Julia", role: "Marketing Director", img: img1, text: "Great platform for managing operations." },
  { name: "Riya", role: "Owner", img: img5, text: "Great results!" }
  ];

  return (
    <section className="testimonials-section">
      <p className='testimoinal_para' data-aos="fade-in">testimoinal</p>
      <h2 className="testimonials-title">REAL FEEDBACK FROM REAL CLIENTS.</h2>

      {/* DESKTOP ONLY SLIDER */}
      <div className="desktop-slider">
        <Slider {...desktopSettings}>
          {data.map((item, i) => (
            <div className="slide" key={i}>
              <div className="testimonial-card">
                <img src={item.img} className="profile-img" alt={item.name} />
                <h4>{item.name}</h4>
                <p className="roleP">{item.role}</p>
                <p className="text">{item.text}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* MOBILE ONLY SLIDER */}
      <div className="mobile-slider">
        <Slider {...mobileSettings}>
          {data.map((item, i) => (
            <div className="slide" key={i}>
              <div className="testimonial-card mobile-card">
                <img src={item.img} className="profile-img" alt={item.name} />
                <h4>{item.name}</h4>
                <p>{item.role}</p>
                <p className="text">{item.text}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
