import '../AboutPage/CoreValue.css'
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

          <div className="grid-box" data-aos="fade-up"  data-aos-delay="200">

            
            <div className="value-card">
              <div className="icon">
                <img className='iconc' src={graphic} alt='graphic' />
                {/* <FaFlask /> */}
                </div>
              <h3 className='tiitle_cv'>Creativity</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

           
            <div className="value-card">
              <div className="icon"><img src={integrity} alt="integrity"/></div>
              <h3>Integrity</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

           
            <div className="value-card" style={{borderRight:'0px'}}>
              <div className="icon"><img src={collabation} alt="collabation"/></div>
              <h3>Collaboration</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

          
            <div className="value-card" style={{borderBottom:'0px'}}>
              <div className="icon"><img src={cust} alt="cust"/></div>
              <h3>Customer-Centric</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

           
            <div className="value-card" style={{borderBottom:'0px'}}>
              <div className="icon"><img src={account} alt="acount"/></div>
              <h3>Accountability</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

            
            <div className="value-card" style={{borderRight:'0px', borderBottom:'0px'}}>
              <div className="icon"><img src={inno} alt="inno"/></div>
              <h3>Innovation</h3> 
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default CoreValues;
