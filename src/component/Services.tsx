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
        
        <Link to="/pos" className='box_grid_services' data-aos="fade-up">
                <img className='top' src={top} alt='top'/> 
          <img className='img_services_img' src={shape} alt='shape' />
          <p className='services_para'>Website Development</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

      <Link to='/saleentry'  className='box_grid_services' data-aos="fade-up" data-aos-delay="200">
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
        </Link>


        <Link to='attendance' className='box_grid_services' data-aos="fade-up" data-aos-delay="800">
          <img className='img_services_img' src={brand} alt='shape' />
          <p className='services_para'>Brand Identify</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

        <Link to='creditline' className='box_grid_services' data-aos="fade-up" data-aos-delay="1000">
          <img className='img_services_img' src={seo} alt='shape' />
          <p className='services_para'>SEO Optization</p>
          <p className='services_desc'>Lorem ipsum dolor sit amet perferendis? Illo recusandae error odio eius voluptatibus officiis.</p>
        </Link>

        
      </main>

    </section>
  )
}

export default Services
