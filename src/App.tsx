import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardMain from "./pages/DashboardMain";
import Pos from "./pages/Pos";
import SaleEntry from "./pages/SaleEntry";
import TankManagement from "./pages/TankManagement";
import AccountingFinance from "./pages/AccountingFinance";
import AttendancePayroll from "./pages/AttendancePayroll";
import CreditLineManagement from "./pages/CreditLineManagement";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardMain />} />
        <Route path="/pos" element={<Pos />} />
         
        <Route path="/saleentry" element={<SaleEntry />} />
     <Route path="/tanks" element={<TankManagement />} />
     <Route path="/finance" element={<AccountingFinance/>} />
      <Route path="/attendance" element={<AttendancePayroll/>} />
            <Route path="/creditline" element={<CreditLineManagement/>} />
            <Route path="/admin" element={<AdminRoleManagement/>} />
                        <Route path="/dash" element={<Dashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
