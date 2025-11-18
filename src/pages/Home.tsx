// import React from 'react'
// import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Header from '../component/Header'
import Custom from '../component/Custom'
import Post from '../component/Post'
import StateSection from '../component/StateSection'
import Services from '../component/Services'
import Slider from '../component/Slider'
import Whychooseus from '../component/Whychooseus'
import Testimonials from '../component/Testimonials'
import Insight from '../component/Insight'
import Question from '../component/Question'
import ChatProject from '../component/ChatProject'
import Footer from '../component/Footer'
// import Pos from './Pos'
// import SaleEntry from './SaleEntry';
const Home = () => {
  return (
    <div>

      <Header/>
      <Custom/>
      <Post/>
      <StateSection/>
      <Services/>
      <Slider/>
      <Whychooseus/>
      <Testimonials/>
      <Insight/>
      <Question/>
      <ChatProject/>
      <Footer/>
    </div>
    // <BrowserRouter>
    //   <Header />
    //   <Routes>
    //     <Route
    //       path="/"
    //       element={
        //     <>
        //       <Custom />
        //       <Post />
        //       <StateSection />
        //       <Services />
        //       <Slider />
        //       <Footer />
        //   //   </>
        //   // }
        // />



  )
}

export default Home
