import { useEffect } from 'react';
import '../style/Qestion.css';
import { IoIosArrowDown } from 'react-icons/io';
import { FaPhone } from 'react-icons/fa6';
import img from '../assets/qustion1.jpg';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Question = () => {
  useEffect(() => {
    AOS.init({
      duration: 3000,
      offset: 120,
      once: true,
    });
    AOS.refresh();
  }, []);

  return (
    <section className='question'>
      <div className='right_conatiner'>
        <p className='display_img_question'>
          <img src={img} alt='img' />
          <div className='right_img_quetion'>
            <p className='name_question'>Ethan Johnson</p>
            <p className='desc_question'>Chief Officer</p>
          </div>
        </p>

        <p className='text_question'>
          Need help or want to streamline your pump operations? Contact us directly through our website.
        </p>

        <button className="contact-btn">
          BOOK CALL
          <span className="arrow-icon">
            <FaPhone size={16} />
          </span>
        </button>
      </div>

      <div className="right-panel">
        <details className="accordion-item">
          <summary className="accordion-header" data-aos="fade-in" data-aos-anchor-placement="bottom-bottom" >
            <span className="accordion-number">01.</span>
            <span className="accordion-question">What Services Do You Offer?</span>
            <span className="accordion-icon"><IoIosArrowDown /></span>
          </summary>
          <div className="accordion-body">
            <p>We provide a complete petrol pump management system covering sales, stock, staff, credit, POS, and accounting automation.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary className="accordion-header" data-aos="fade-in" data-aos-anchor-placement="bottom-bottom" >
            <span className="accordion-number">02.</span>
            <span className="accordion-question">How Do You Measure System Performance?</span>
            <span className="accordion-icon"><IoIosArrowDown /></span>
          </summary>
          <div className="accordion-body">
            <p>We track accuracy, real-time sync, stock variance, sales reports, UPI logs, and operational efficiency improvements.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary className="accordion-header" data-aos="fade-in" data-aos-anchor-placement="bottom-bottom" >
            <span className="accordion-number">03.</span>
            <span className="accordion-question">How Long Does It Take to See Results?</span>
            <span className="accordion-icon"><IoIosArrowDown /></span>
          </summary>
          <div className="accordion-body">
            <p>Most pumps experience smoother operations and better control within the first few weeks of using the platform.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary className="accordion-header" data-aos="fade-in" data-aos-anchor-placement="bottom-bottom" >
            <span className="accordion-number">04.</span>
            <span className="accordion-question">How Much Does Your System Cost?</span>
            <span className="accordion-icon"><IoIosArrowDown /></span>
          </summary>
          <div className="accordion-body">
            <p>Pricing is customized based on modules, users, and integrations required for your petrol pump setup.</p>
          </div>
        </details>

        <details className="accordion-item">
          <summary className="accordion-header" data-aos="fade-in" data-aos-anchor-placement="bottom-bottom" >
            <span className="accordion-number">05.</span>
            <span className="accordion-question">What Makes Your Platform Different?</span>
            <span className="accordion-icon"><IoIosArrowDown /></span>
          </summary>
          <div className="accordion-body">
            <p>We offer an all-in-one solution with automation, real-time UPI API sync, advanced reports, and reliable support.</p>
          </div>
        </details>
      </div>
    </section>
  );
};

export default Question;
