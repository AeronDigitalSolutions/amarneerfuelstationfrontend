// import React from 'react'
import Footer from '../component/Footer'
import Header from '../component/Header'
import '../pagecss/SignUp.css'
import { Link } from 'react-router-dom'
const SignUp = () => {
  return (
    <>
   <Header/>
      <div className="signup-wrapper">

      <div className="signup-card">
        <p className="title">Sign up your account</p>

        <label className="label">Username <span className='label_ex'>*</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="username"
          required
        />

        <label className="label">Email <span className='label_ex'>*</span></label>
        <input style={{color:"#6e6e6e"}}
          type="email"
          className="input-field"
          placeholder="hello@example.com"
          required
        />

        <label className="label">Password <span className='label_ex'>*</span></label>
        <input
          type="password"
          className="input-field"
          placeholder="password"
          required
        />

        <button className="signup-btn">Sign me up</button>

        <p className="footer-text">
          Already have an account? <Link to='sign' className="signin-link">Sign in</Link>
        </p>
      </div>

    </div>
    <Footer/>
    </>
  )
}

export default SignUp
