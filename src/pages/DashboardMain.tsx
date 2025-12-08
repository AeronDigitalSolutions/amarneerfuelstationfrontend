import { Link } from "react-router-dom";
import '../style/DashboardMain.css'
// import shape from '../assets/Shape-012.png';
import graphic from '../assets/graphic.png';
// import social from '../assets/social.png';
// import brand from '../assets/brand.png';
// import seo from '../assets/seo.png';
import top from '../assets/servicestop.png'
import Header from "../component/Header";
import Footer from "../component/Footer";
import AOS from 'aos';
import 'aos/dist/aos.css';
export default function DashboardMain() {
   AOS.init({
      duration: 1000,
      offset: 120,
      once: true,
    });
  return (
    <>
    <Header/>
    <h1 className="dashbord_heading"  data-aos="fade-in"  data-aos-anchor-placement="bottom-center">Petro Pump DashBoard</h1>
    <p className="dashbord_sub_tittle"  data-aos="fade-in"  data-aos-anchor-placement="bottom-center">Welcome! Choose a section to begin.</p>
   
<div className="dash">
      <main className='grid_services_dash'>

         <Link to='/admin' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Admin</h3>
            <p className='services_desc_dash'>Manage users, roles, permissions, and system settings securely.</p>
          </div>
        </Link>
{/* 
        <Link to='/dashboard' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>DashBoard</h3>
            <p className='services_desc_dash'>View live sales, stock, credit, and operations in one place.</p>
          </div>
        </Link> */}


 <Link to='/shift' className="service-box_dash" data-aos="fade-up"   data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Shift</h3>
            <p className='services_desc_dash'>Handle shift start, meter readings, sales entry, and closing totals.</p>
          </div>
        </Link> 

  <Link to='/testfuel' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Test Fuel</h3>
            <p className='services_desc_dash'>Record and monitor test fuel usage for accurate meter calibration.</p>
          </div>
        </Link> 
        

 <Link to='/fuelrate' className="service-box_dash" data-aos="fade-up" data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Fuel Rate</h3>
            <p className='services_desc_dash'>Set and update daily fuel prices for all products instantly.</p>
          </div>
        </Link>


   <Link to='/pump' className="service-box_dash" data-aos="fade-up"   data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Pump Management</h3>
            <p className='services_desc_dash'>Manage pump numbers, nozzles, meters, and operator assignments.</p>
          </div>
        </Link> 


         <Link to='/addtank' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Add Tank</h3>
            <p className='services_desc_dash'>Add new tanks and define product type, capacity, and details.</p>
          </div>
        </Link> 
        
<Link to='/saleentry' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>SaleEntry</h3>
            <p className='services_desc_dash'>Enter daily fuel sales with meter readings and automated totals.</p>
          </div>
        </Link>

  <Link to='/tanks' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Fuel Tank Management</h3>
            <p className='services_desc_dash'>Track tank dips, stock levels, receipts, and fuel variance..</p>
          </div>
        </Link>

<Link to='/attendance' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Attendance</h3>
            <p className='services_desc_dash'>Track staff attendance, shift timings, and daily work status.</p>
          </div>
        </Link>


        <Link to='/creditline' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>CreditLine</h3>
            <p className='services_desc_dash'>Manage supplier and customer credit with clear outstanding reports.</p>
          </div>
        </Link>

        

 <Link to='/finance' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Finance</h3>
            <p className='services_desc_dash'>Handle expenses, cash flow, and accounting summaries with ease.</p>
          </div>
        </Link>




 <Link to='/wholeday' className="service-box_dash" data-aos="fade-up"  data-aos-anchor-placement="bottom-bottom">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Whole Day Report</h3>
            <p className='services_desc_dash'>Handle expenses, cash flow, and accounting summaries with ease.</p>
          </div>
        </Link>



      </main>
      </div>
      <Footer/>
    </>
  );
}
