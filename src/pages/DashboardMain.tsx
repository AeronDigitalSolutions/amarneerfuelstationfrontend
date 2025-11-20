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
export default function DashboardMain() {
  return (
    <>
    <Header/>
    <h1 style={{fontSize:'2rem',color:'Black', display:'flex', justifyContent:'center' ,marginBottom:'0px'}}>Petro Pump DashBoard</h1>
    <p style={{fontSize:'1.3rem',color:'grey', display:'flex', justifyContent:'center' , marginTop:'10px'}}>Welcome! Choose a Section a section to begin</p>
   
<div className="dash">
      <main className='grid_services_dash'>

         <Link to='/admin' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Admin</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>

        <Link to='/dashboard' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>DashBoard</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


 <Link to='/shift' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Shift</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link> 

  <Link to='/testfuel' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Test Fuel</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link> 
        

 <Link to='/fuelrate' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Fuel Rate</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


   <Link to='/pump' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Pump Management</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link> 


         <Link to='/addtank' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Add Tank</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link> 
        
<Link to='/saleentry' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>SaleEntry</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>

  <Link to='/tanks' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Fuel Tank Management</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>

<Link to='/attendance' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Attendance</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>


        <Link to='/creditline' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>CreditLine</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>

        

 <Link to='/finance' className="service-box_dash">
          <div className="top-tab_dash">
            <img src={top} alt='top' />
          </div>
          <div className="box_grid_services_dash">
            <div className="icon_dash">
              <img className='img_services_img_dash' src={graphic} alt="icon" />
            </div>
            <h3 className='services_para_dash'>Finance</h3>
            <p className='services_desc_dash'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </Link>
      </main>
      </div>
      <Footer/>
    </>
  );
}
