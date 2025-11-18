import '../pagecss/SignIn.css'
// import Ilogo from '../assets/images.jpeg'
import signIn from '../assets/signin.png'
import { Link } from 'react-router-dom'
const SignIn = () => {
  return (
     <div className="login-page">

      <div className="left-box">
        <div className="left-content">
          <div className="logo-row">
            {/* <img src={Ilogo} className="logo-img" alt="" /> */}
            <p className="logo-text">innap</p>
          </div>

          <p className="welcome-title">Welcome back!</p>

          <p className="left-subtext">User Experience & Interface Design<br></br>
          Strategy SaaS Solutions</p>

          <img src={signIn} className="illustration-img" alt="" />
        </div>
      </div>

      <div className="right-box">
        <div className="form-card">

          <p className="signin-title">Sign in your account</p>

          <label className="form-label">Email <span className='label_ex'>*</span></label>
          <input
            type="email"
            placeholder="demo@example.com"
            required
            className="input-field"
          />

          <label className="form-label">Password <span className='label_ex'>*</span></label>
          <input
            type="password"
            placeholder="••••••"
            className="input-field"
          />

          <div className="remember-row">
            <input type="checkbox" className='signCheck' />
            <span style={{fontSize:'14px'}}>Remember my preference</span>
          </div>

          <button className="sign-btn">Sign In</button>

          <p className="signup-text">
            Don’t have an account? <Link to='/signup' className="signup-link">Sign up</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default SignIn
