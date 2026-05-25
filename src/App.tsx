import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";

import ThemeToggle from "./component/ThemeToggle";
import "./global.css";
import "./style/moduleUpgrade.css";

// PUBLIC PAGES
import Home from "./pages/Home";
import ContactRoute from "./component/ContactRoute";
import Services from "./component/Services";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About1 from "./component/AboutPage/About1";

// OLD SYSTEM PAGES (modules)
import SaleEntry from "./pages/SaleEntry";
import TankManagement from "./pages/TankManagement";
import AccountingFinance from "./pages/AccountingFinance";
import AttendancePayroll from "./pages/AttendancePayroll";
import CreditLineManagement from "./pages/CreditLineManagement";
import DashboardMain from "./pages/DashboardMain";
import AddTank from "./pages/AddTank";
import FuelRates from "./pages/FuelRates";
import PumpNo from "./pages/Machine";
import TestFuel from "./pages/TestFuel";
import ShiftTiming from "./pages/ShiftTiming";
import LivePayment from "./pages/LivePayment";
import PaymentComparison from "./pages/PaymentComparison";
import Dashboard from "./pages/Dashboard";

// ADMIN
import AdminRoleManagement from "./pages/AdminRoleManagement";

// AUTH GUARD
import AuthGuard from "./guards/AuthGuards";
import AttendancePage from "./pages/AttendancePage";
import WholeDayReport from "./pages/WholeDayReport";
import OwnerPumps from "./pages/OwnerPumps";
import OwnerSuperAdmins from "./pages/OwnerSuperAdmins";
import DashboardShell from "./layouts/DashboardShell";

function App() {
  const withShell = (node: ReactNode) => <DashboardShell>{node}</DashboardShell>;

  return (
    //  <LoaderProvider>
    //   <GlobalLoader />
    <BrowserRouter>
      <ThemeToggle />

      <Routes>

        {/* ========================
            PUBLIC ROUTES
        ========================= */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About1 />} />
        <Route path="/sign" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ========================
            ROLE-BASED DASHBOARDS
        ========================= */}

        {/* ADMIN */}
        <Route
          path="/adminloginpage"
          element={
            <AuthGuard roles={["Owner", "SuperAdmin"]}>
              {withShell(<AdminRoleManagement />)}
            </AuthGuard>
          }
        />

<Route
  path="/admin"
  element={
    <AuthGuard roles={["Owner", "SuperAdmin"]}>
      {withShell(<AdminRoleManagement />)}
    </AuthGuard>
  }
/>

        {/* ========================
            OLD SYSTEM MODULE ROUTES 
            (still used inside dashboards)
        ========================= */}
        <Route path="/dashboard" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]}>{withShell(<DashboardMain />)}</AuthGuard>} />
        <Route path="/dashboardmain" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]}>{withShell(<DashboardMain />)}</AuthGuard>} />
        <Route path="/owner/pumps" element={<AuthGuard role="Owner">{withShell(<OwnerPumps />)}</AuthGuard>} />
        <Route path="/owner/super-admins" element={<AuthGuard role="Owner">{withShell(<OwnerSuperAdmins />)}</AuthGuard>} />
        <Route path="/saleentry" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="saleEntry">{withShell(<SaleEntry />)}</AuthGuard>} />
        <Route path="/tanks" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="tankManagement">{withShell(<TankManagement />)}</AuthGuard>} />
        <Route path="/finance" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="finance">{withShell(<AccountingFinance />)}</AuthGuard>} />
        <Route path="/attendance" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="attendance">{withShell(<AttendancePayroll />)}</AuthGuard>} />
        <Route path="/creditline" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="creditLine">{withShell(<CreditLineManagement />)}</AuthGuard>} />
        <Route path="/fuelrate" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="fuelRate">{withShell(<FuelRates />)}</AuthGuard>} />
        <Route path="/pump" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="pumpManagement">{withShell(<PumpNo />)}</AuthGuard>} />
        <Route path="/addtank" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="addTank">{withShell(<AddTank />)}</AuthGuard>} />
        <Route path="/testfuel" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="testFuel">{withShell(<TestFuel />)}</AuthGuard>} />
        <Route path="/shift" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="shift">{withShell(<ShiftTiming />)}</AuthGuard>} />
        <Route path="/payment" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="payment">{withShell(<LivePayment />)}</AuthGuard>} />
        <Route path="/paymentcomp" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="paymentComparison">{withShell(<PaymentComparison />)}</AuthGuard>} />
        <Route path="/wholeday" element={<AuthGuard roles={["Owner", "SuperAdmin", "Admin"]} permissionKey="wholeDayReport">{withShell(<WholeDayReport />)}</AuthGuard>} />

        {/* OPTIONAL OLD ADMIN PAGE */}
        {/* <Route path="/admin" element={<AdminRoleManagement />} /> */}
        <Route path="/dash" element={<Dashboard />} />
<Route path="/attendant-attendance" element={<AttendancePage/>} />

        {/* ========================
            FALLBACK 
        ========================= */}
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
    // </LoaderProvider>
  );
}

export default App;
