import { BrowserRouter, Routes, Route } from "react-router-dom";

import ThemeToggle from "./component/ThemeToggle";
import "./global.css";

// PUBLIC PAGES
import Home from "./pages/Home";
import ContactRoute from "./component/ContactRoute";
import Services from "./component/Services";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// OLD SYSTEM PAGES (STILL USED IN OTHER ROLES)
import SaleEntry from "./pages/SaleEntry";
import TankManagement from "./pages/TankManagement";
import AccountingFinance from "./pages/AccountingFinance";
import AttendancePayroll from "./pages/AttendancePayroll";
import CreditLineManagement from "./pages/CreditLineManagement";
import DashboardMain from "./pages/DashboardMain";
import AddTank from "./pages/AddTank";
import FuelRates from "./pages/FuelRates";
import PumpNo from "./pages/PumpNo";
import TestFuel from "./pages/TestFuel";
import ShiftTiming from "./pages/ShiftTiming";
import LivePayment from "./pages/LivePayment";
import PaymentComparison from "./pages/PaymentComparison";

// NEW ROLE-BASED DASHBOARDS
import ManagerDashboard from "./pages/ManagerDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import AttendantDashboard from "./pages/AttendantDashboard";

// ADMIN PAGE
import AdminRoleManagement from "./pages/AdminRoleManagement";

// AUTH GUARD
import AuthGuard from "./guards/AuthGuards";

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />

      <Routes>

        {/* ========================
            PUBLIC ROUTES 
        ========================= */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/services" element={<Services />} />
        <Route path="/sign" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ========================
            ROLE-BASED DASHBOARDS 
        ========================= */}

        {/* ADMIN */}
        <Route
          path="/adminloginpage"
          element={
            <AuthGuard role="Admin">
              <AdminRoleManagement />
            </AuthGuard>
          }
        />

        {/* MANAGER */}
        <Route
          path="/dashboard-manager"
          element={
            <AuthGuard role="Manager">
              <ManagerDashboard />
            </AuthGuard>
          }
        />

        {/* CASHIER */}
        <Route
          path="/dashboard-cashier"
          element={
            <AuthGuard role="Cashier">
              <CashierDashboard />
            </AuthGuard>
          }
        />

        {/* ACCOUNTANT */}
        <Route
          path="/dashboard-accountant"
          element={
            <AuthGuard role="Accountant">
              <AccountantDashboard />
            </AuthGuard>
          }
        />

        {/* ATTENDANT */}
        <Route
          path="/dashboard-attendant"
          element={
            <AuthGuard role="Attendant">
              <AttendantDashboard />
            </AuthGuard>
          }
        />

        {/* ========================
            OLD MODULE ROUTES 
            (Only used if you still need them)
        ========================= */}
        <Route path="/dashboard" element={<DashboardMain />} />
        <Route path="/saleentry" element={<SaleEntry />} />
        <Route path="/tanks" element={<TankManagement />} />
        <Route path="/finance" element={<AccountingFinance />} />
        <Route path="/attendance" element={<AttendancePayroll />} />
        <Route path="/creditline" element={<CreditLineManagement />} />
        <Route path="/fuelrate" element={<FuelRates />} />
        <Route path="/pump" element={<PumpNo />} />
        <Route path="/addtank" element={<AddTank />} />
        <Route path="/testfuel" element={<TestFuel />} />
        <Route path="/shift" element={<ShiftTiming />} />
        <Route path="/payment" element={<LivePayment />} />
        <Route path="/paymentcomp" element={<PaymentComparison />} />

        {/* ========================
            FALLBACK 
        ========================= */}
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
