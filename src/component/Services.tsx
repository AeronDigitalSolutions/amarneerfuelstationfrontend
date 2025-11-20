// import React from 'react'
import '../style/Services.css'
import shape from '../assets/Shape-012.png';
import graphic from '../assets/graphic.png';
import social from '../assets/social.png';
import brand from '../assets/brand.png';
import seo from '../assets/seo.png';
import { Link } from 'react-router-dom';
import top from '../assets/servicestop.png'
// import Header from './Header';
// import Footer from './Footer';
const Services = () => {
  return (
    <>
    <section className='services'>
      <div className='services_container'>
        <p className='services_para'>Services</p>
        <p className='services_tittle'>DIGITAL SOLUTIONS THAT DRIVE REAL RESULTS.</p>
      </div>

      <main className='grid_services'>
 <Link to='/saleentry' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={graphic} alt="icon" />
          </div>
          <h3 className='services_para'>Sale Entry</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/tanks' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={social} alt="icon" />
          </div>
          <h3 className='services_para'> Fuel Tank Management </h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/attendance' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={brand} alt="icon" />
          </div>
          <h3 className='services_para'>Attendance</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/tanks' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={seo} alt="icon" />
          </div>
          <h3 className='services_para'>Fuel Tank Management</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/saleentry' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={seo} alt="icon" />
          </div>
          <h3 className='services_para'>Fuel Sale Entry</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


        <Link to='/dashboard' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={shape} alt="icon" />
          </div>
          <h3 className='services_para'>Dashboard</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


   


      </main>

    </section>
    </>
  )
}

export default Services
