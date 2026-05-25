import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBars,
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaDroplet,
  FaGaugeHigh,
  FaGasPump,
  FaMoneyBillTrendUp,
  FaShieldHalved,
  FaUserCheck,
  FaWarehouse,
  FaXmark,
} from "react-icons/fa6";
import "../style/dashboardShell.css";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  route: string;
  roles?: string[];
  permissionKey?: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", route: "/dashboardmain", roles: ["Owner", "SuperAdmin", "Admin"], icon: <FaChartLine /> },
  { label: "SuperAdmins", route: "/owner/super-admins", roles: ["Owner"], icon: <FaShieldHalved /> },
  { label: "Petrol Pumps", route: "/owner/pumps", roles: ["Owner"], icon: <FaGasPump /> },
  { label: "Admins & Access", route: "/admin", roles: ["Owner", "SuperAdmin"], icon: <FaUserCheck /> },
  { label: "Shift", route: "/shift", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "shift", icon: <FaGaugeHigh /> },
  { label: "Test Fuel", route: "/testfuel", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "testFuel", icon: <FaDroplet /> },
  { label: "Fuel Rate", route: "/fuelrate", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "fuelRate", icon: <FaChartLine /> },
  { label: "Pump Management", route: "/pump", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "pumpManagement", icon: <FaGasPump /> },
  { label: "Add Tank", route: "/addtank", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "addTank", icon: <FaWarehouse /> },
  { label: "Sale Entry", route: "/saleentry", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "saleEntry", icon: <FaMoneyBillTrendUp /> },
  { label: "Tank Management", route: "/tanks", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "tankManagement", icon: <FaWarehouse /> },
  { label: "Attendance", route: "/attendance", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "attendance", icon: <FaUserCheck /> },
  { label: "Credit Line", route: "/creditline", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "creditLine", icon: <FaCreditCard /> },
  { label: "Finance", route: "/finance", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "finance", icon: <FaMoneyBillTrendUp /> },
  { label: "Live Payment", route: "/payment", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "payment", icon: <FaCreditCard /> },
  { label: "Payment Compare", route: "/paymentcomp", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "paymentComparison", icon: <FaChartLine /> },
  { label: "Generate Report", route: "/wholeday", roles: ["Owner", "SuperAdmin", "Admin"], permissionKey: "wholeDayReport", icon: <FaClipboardList /> },
];

const getUserPermissions = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem("modulePermissions") || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole") || "";
  const username = localStorage.getItem("username") || "User";
  const permissions = getUserPermissions();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pumps, setPumps] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [selectedPumpId, setSelectedPumpId] = useState(localStorage.getItem("selectedPumpId") || "");

  useEffect(() => {
    document.body.classList.add("premium-dashboard-body");
    return () => {
      document.body.classList.remove("premium-dashboard-body");
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_URL ||
      (window.location.hostname === "localhost"
        ? "http://localhost:5001/api"
        : "https://amarneerfuelstationbackend.onrender.com/api");
    const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

    const fetchPumps = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pumps`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        setPumps(data);
        if (!localStorage.getItem("selectedPumpId") && data[0]?._id) {
          localStorage.setItem("selectedPumpId", data[0]._id);
          setSelectedPumpId(data[0]._id);
        }
      } catch {
        // ignore
      }
    };

    fetchPumps();
  }, []);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.roles && !item.roles.includes(userRole)) return false;
        if (userRole === "Admin" && item.permissionKey && !permissions[item.permissionKey]) return false;
        return true;
      }),
    [userRole, permissions]
  );

  const activePageLabel = useMemo(() => {
    const direct = visibleNavItems.find((item) => item.route === location.pathname);
    if (direct) return direct.label;
    const partial = visibleNavItems.find((item) => location.pathname.startsWith(item.route));
    return partial?.label || "Module";
  }, [location.pathname, visibleNavItems]);

  const onSelectPump = (pumpId: string) => {
    setSelectedPumpId(pumpId);
    localStorage.setItem("selectedPumpId", pumpId);
    window.dispatchEvent(new CustomEvent("pump-context-changed", { detail: { pumpId } }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("modulePermissions");
    localStorage.removeItem("customRoleName");
    localStorage.removeItem("selectedPumpId");
    navigate("/sign");
  };

  return (
    <div className="premium-shell">
      {menuOpen && <button className="premium-shell-overlay" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <aside className={`premium-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="premium-brand">
          <Link to="/dashboardmain" className="premium-brand-link">
            <span className="premium-brand-dot" />
            <span>Aerneer Ops</span>
          </Link>
          <button className="premium-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <FaXmark />
          </button>
        </div>

        <div className="premium-role-chip">{userRole || "User"}</div>

        <nav className="premium-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.route}
              to={item.route}
              end
              className={({ isActive }) => `premium-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="premium-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="premium-main">
        <header className="premium-topbar">
          <div className="premium-topbar-left">
            <button className="premium-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <FaBars />
            </button>
            <div>
              <p className="premium-breadcrumb">Dashboard / {activePageLabel}</p>
              <h1 className="premium-page-title">{activePageLabel}</h1>
            </div>
          </div>

          <div className="premium-topbar-right">
            {pumps.length > 0 && (
              <label className="premium-pump-select-wrap">
                <span>Pump</span>
                <select value={selectedPumpId} onChange={(e) => onSelectPump(e.target.value)} className="premium-pump-select">
                  {pumps.map((pump) => (
                    <option key={pump._id} value={pump._id}>
                      {pump.name} ({pump.code})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="premium-user-chip">{username}</div>
            <button className="premium-logout-btn" onClick={logout}>
              <FaArrowRightFromBracket />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="premium-content">{children}</main>
      </div>
    </div>
  );
}
