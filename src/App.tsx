import { BrowserRouter, Routes, Route } from "react-router-dom";
// import DashboardMain from "./pages/DashboardMain";
// import Pos from "./pages/Pos";
import SaleEntry from "./pages/SaleEntry";
import TankManagement from "./pages/TankManagement";
import AccountingFinance from "./pages/AccountingFinance";
import AttendancePayroll from "./pages/AttendancePayroll";
import CreditLineManagement from "./pages/CreditLineManagement";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import Dashboard from "./pages/Dashboard";
import ThemeToggle from "./component/ThemeToggle"; // ✅ Import ThemeToggle
import "./global.css"; // ✅ Import global theme styles
import Home from "./pages/Home";
import ContactRoute from "./component/ContactRoute";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AddTank from "./pages/AddTank";
import FuelRates from "./pages/FuelRates";
import PumpNo from "./pages/PumpNo";
import DashboardMain from "./pages/DashboardMain";
import TestFuel from "./pages/TestFuel";
import ShiftTiming from "./pages/ShiftTiming";

function App() {
  return (
    <BrowserRouter>
      {/* 🌗 Theme Toggle stays fixed at top-right */}
      <ThemeToggle />
      {/* <Home/> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardMain/>} />
        <Route path="/saleentry" element={<SaleEntry />} />
        <Route path="/tanks" element={<TankManagement />} />
        <Route path="/finance" element={<AccountingFinance />} />
        <Route path="/attendance" element={<AttendancePayroll />} />
        <Route path="/creditline" element={<CreditLineManagement />} />
        <Route path="/admin" element={<AdminRoleManagement />} />
        <Route path="/dash" element={<Dashboard />} />
         <Route path="/contact" element={<ContactRoute/>} />
         <Route path="/sign" element={<SignIn/>}/>
         <Route path="/signup" element={<SignUp/>}/>
        <Route path="/dashboardmain" element={<DashboardMain />} />

        <Route path="/fuelrate" element={<FuelRates />} />
        <Route path="/pump" element={<PumpNo />} />
        <Route path="/addtank" element={<AddTank />} />
        <Route path="/testfuel" element={<TestFuel />} />
                <Route path="/shift" element={<ShiftTiming/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
