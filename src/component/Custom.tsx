// import React from 'react'
import '../style/Custom.css'
import Image from '../assets/right_custom.jpg'
// import { LuArrowUpRight } from "react-icons/lu";
const Custom = () => {
  return (
    <section className='custom'>
      <div className='custom_container'>
        <div className='left_custom'>
          <p className='heading_custom'>HELPING VISIONARY BRANDS REACH THE</p>
          <span className='span_custom'>TOP 1%</span>
          <hr className='custom_hr'></hr>


          <div className='display_custom_bottom'>
            <div className='custom_resposive'>
            <div className='star'>✦</div>
            <p className='para_custom'>10Y experience in digital marketing services</p>
            </div>
             <button className="discover-custom">
                        Contact Us
                      </button>
          </div>
        </div>



        <div className='right_custom'>
          <div className='image_custom'>
            <img src={Image} alt='image'/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Custom
