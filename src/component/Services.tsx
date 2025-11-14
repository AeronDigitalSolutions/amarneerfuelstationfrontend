// import React from 'react'
import '../style/Services.css'
import shape from '../assets/Shape-012.png';
import graphic from '../assets/graphic.png';
import social from '../assets/social.png';
import brand from '../assets/brand.png';
import seo from '../assets/seo.png';
import { Link } from 'react-router-dom';
import top from '../assets/servicestop.png'
const Services = () => {
  return (
    <section className='services'>
      <div className='services_container'>
        <p className='services_para'>Services</p>
        <p className='services_tittle'>DIGITAL SOLUTIONS THAT DRIVE REAL RESULTS.</p>
      </div>

      <main className='grid_services'>

        {/* <Link to="/pos" className='box_grid_services' data-aos="fade-up">
          <img className='img_services_img' src={shape} alt='shape' />
          <p className='services_para'>Website Development</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link> */}

        {/* <Link to='/saleentry' className='box_grid_services' data-aos="fade-up" data-aos-delay="200">
          <img className='img_services_img' src={shape} alt='shape' />
          <p className='services_para'>App Development</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

        <Link to='tanks' className='box_grid_services' data-aos="fade-up" data-aos-delay="400">
          <img className='img_services_img' src={social} alt='shape' />
          <p className='services_para'>Social media</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

        <Link to='finance' className='box_grid_services' data-aos="fade-up" data-aos-delay="600">
          <img className='img_services_img' src={graphic} alt='shape' />
          <p className='services_para'>Graphic Design</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link> */}


        {/* <Link to='attendance' className='box_grid_services' data-aos="fade-up" data-aos-delay="800">
          <img className='img_services_img' src={brand} alt='shape' />
          <p className='services_para'>Brand Identify</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

        <Link to='creditline' className='box_grid_services' data-aos="fade-up" data-aos-delay="1000">
          <img className='img_services_img' src={seo} alt='shape' />
          <p className='services_para'>SEO Optization</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link> */}

        <Link to='/pos' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={shape} alt="icon" />
          </div>
          <h3 className='services_para'>POS Screen</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/creditline' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={graphic} alt="icon" />
          </div>
          <h3 className='services_para'>Credit Line Management</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/attendance' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={social} alt="icon" />
          </div>
          <h3 className='services_para'> Attendance Management</h3>
            <p className='services_desc'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/finance' className="service-box">
          <div className="top-tab">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services">
          <div className="icon">
          <img className='img_services_img' src={brand} alt="icon" />
          </div>
          <h3 className='services_para'>finance</h3>
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




   


      </main>

    </section>
  )
}

export default Services
