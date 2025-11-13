// import React from 'react'
import '../style/Qestion.css'
// import { LuArrowUpRight } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FaPhone } from "react-icons/fa6";
import img from '../assets/qustion1.jpg'
const Question = () => {
    return (
        <section className='question'>
            <div className='right_conatiner'>

                <p className='display_img_question'>
                    <img src={img} alt='img' />
                    <div className='right_img_quetion'>
                        <p className='name_question'>Ethan Johnson</p>
                        <p className='desc_question'>Chieft Officer</p>
                    </div>
                </p>

                <p className='text_question'>
                    “Have questions or want to explore new opportunities? Contact us directly through our website.”
                </p>

                <button className="contact-btn">
                    CONTACT US
                    <span className="arrow-icon">
                    <FaPhone size={16}/>
                    </span>
                </button>
            </div>


            {/* right side */}
            {/* <div className=''></div> */}
            <div className="right-panel">
                <details className="accordion-item">
                    <summary className="accordion-header">
                        <span className="accordion-number">01.</span>
                        <span className="accordion-question">What Services Do You Offer?</span>
                        <span className="accordion-icon"><IoIosArrowDown />
                        </span>
                    </summary>
                    <div className="accordion-body">
                        <p>We offer a full suite of digital marketing services including SEO, PPC, social media, content marketing, and conversion-rate optimisation.</p>
                    </div>
                </details>

                <details className="accordion-item">
                    <summary className="accordion-header">
                        <span className="accordion-number">02.</span>
                        <span className="accordion-question">How Do You Measure Campaign Success?</span>
                        <span className="accordion-icon"><IoIosArrowDown />
                        </span>
                    </summary>
                    <div className="accordion-body">
                        <p>We use a mix of KPIs such as ROI, cost per acquisition (CPA), click-through rates, engagement metrics and customer lifetime value.</p>
                    </div>
                </details>

                <details className="accordion-item">
                    <summary className="accordion-header">
                        <span className="accordion-number">03.</span>
                        <span className="accordion-question">How Long Does It Take to See Results?</span>
                        <span className="accordion-icon"><IoIosArrowDown />
                        </span>
                    </summary>
                    <div className="accordion-body">
                        <p>Typically you will start seeing meaningful results within 3-6 months, though this depends on your industry, budget and current state.</p>
                    </div>
                </details>

                <details className="accordion-item">
                    <summary className="accordion-header">
                        <span className="accordion-number">04.</span>
                        <span className="accordion-question">How Much Do Your Services Cost?</span>
                        <span className="accordion-icon"><IoIosArrowDown />
                        </span>
                    </summary>
                    <div className="accordion-body">
                        <p>Our services are tailored to your needs. We provide custom pricing based on scope, deliverables and expected outcomes.</p>
                    </div>
                </details>

                <details className="accordion-item">
                    <summary className="accordion-header">
                        <span className="accordion-number">05.</span>
                        <span className="accordion-question">What Makes Your Agency Different?</span>
                        <span className="accordion-icon"><IoIosArrowDown />
                        </span>
                    </summary>
                    <div className="accordion-body">
                        <p>We combine deep domain expertise, data-driven strategies and full transparency — you always see what we’re doing and why.</p>
                    </div>
                </details>
            </div>
            {/* </div> */}
        </section>
    )
}

export default Question
