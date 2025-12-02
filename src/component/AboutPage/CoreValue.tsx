// import '../AboutPage/CoreValue.css'
import '../../style/About/CoreValue.css'
import graphic from '../../assets/graphic.png'
import integrity from '../../assets/integrity.png'
import collabation from '../../assets/collabortion.png'
import cust from '../../assets/cust.png'
import account from '../../assets/account.png'
import inno from '../../assets/innovation.png'
import AOS from 'aos';
import 'aos/dist/aos.css'
const CoreValues = () => {
  AOS.init({
    duration: 1000,
    offset: 120,
    once: true,
  });
  return (
    <>
      <div className="values-wrapper">
        <div className="values-container">


          <div className="values-left">
            <p className="tag">
              <span className="dot"></span>
              <span className="dot2"></span>
              OUR CORE VALUES
            </p>

            <h1 className="main-heading">
              THE HEART <br />
              OF OUR
              CULTURE.
            </h1>
          </div>


          <div className="values-right">

            <div className="grid-box" data-aos="fade-up" data-aos-delay="200">


              <div className="value-card">
                <div className="icon">
                  <img className='iconc' src={graphic} alt='graphic' />
                  {/* <FaFlask /> */}
                </div>
                <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Reliability</h3>
                  <p className='tiitle_lorem'>We deliver stable, accurate systems built for daily petrol pump operations.</p>
                </div>
              </div>

              <div className="value-card">
                <div className="icon"><img src={integrity} alt="integrity" /></div>
                {/* <h3>Integrity</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
                 <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Integrity</h3>
                  <p className='tiitle_lorem'>Your data is secure, transparent, and handled with complete trust.</p>
                </div>
              </div>


              <div className="value-card" style={{ borderRight: '0px' }}>
                <div className="icon"><img src={collabation} alt="collabation" /></div>
                <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Innovation</h3>
                  <p className='tiitle_lorem'>We constantly evolve with new automation and reporting features..</p>
                </div>
                {/* <h3>Collaboration</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
              </div>


              <div className="value-card" style={{ borderBottom: '0px' }}>
                <div className="icon"><img src={cust} alt="cust" /></div>
                 <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Efficiency</h3>
                  <p className='tiitle_lorem'>We simplify daily tasks so petrol pumps run faster and smoother.</p>
                </div>
                {/* <h3>Customer-Centric</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
              </div>


              <div className="value-card" style={{ borderBottom: '0px' }}>
                <div className="icon"><img src={account} alt="acount" /></div>
                <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Growth</h3>
                  <p className='tiitle_lorem'>Our tools help pump owners scale operations with confidence.</p>
                </div>
                {/* <h3>Accountability</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
              </div>


              <div className="value-card" style={{ borderRight: '0px', borderBottom: '0px' }}>
                <div className="icon"><img src={inno} alt="inno" /></div>
               <div className='responsivetext_CV'>
                  <h3 className='tiitle_cv'>Dependability</h3>
                  <p className='tiitle_lorem'>A stable system you can rely on every day without interruptions.</p>
                </div>
                {/* <h3>Innovation</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CoreValues;
