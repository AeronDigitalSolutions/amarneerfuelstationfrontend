import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  FaArrowRightLong,
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
} from "react-icons/fa6";
import Header from "../component/Header";
import Footer from "../component/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import "../style/DashboardMain.css";

const modules = [
  {
    title: "Admin",
    description: "Manage users, roles, and permission controls with secure operational governance.",
    route: "/admin",
    tag: "Control",
    icon: FaShieldHalved,
  },
  {
    title: "Shift",
    description: "Track shift start, meter opening/closing, and handover checkpoints with clarity.",
    route: "/shift",
    tag: "Operations",
    icon: FaGaugeHigh,
  },
  {
    title: "Test Fuel",
    description: "Record nozzle test fuel to maintain calibration confidence and reduce variance.",
    route: "/testfuel",
    tag: "Quality",
    icon: FaDroplet,
  },
  {
    title: "Fuel Rate",
    description: "Update day-wise pricing quickly for all fuel products from one managed surface.",
    route: "/fuelrate",
    tag: "Pricing",
    icon: FaChartLine,
  },
  {
    title: "Pump Management",
    description: "Configure pumps, nozzles, and machine mapping for cleaner sales operations.",
    route: "/pump",
    tag: "Infra",
    icon: FaGasPump,
  },
  {
    title: "Add Tank",
    description: "Create and standardize tank master records with product and capacity definitions.",
    route: "/addtank",
    tag: "Master Data",
    icon: FaWarehouse,
  },
  {
    title: "Sale Entry",
    description: "Capture shift-level sales entries faster with calculated totals and less manual effort.",
    route: "/saleentry",
    tag: "Sales",
    icon: FaMoneyBillTrendUp,
  },
  {
    title: "Tank Management",
    description: "Monitor stock movement, dips, and receipts to keep inventory trustworthy.",
    route: "/tanks",
    tag: "Inventory",
    icon: FaWarehouse,
  },
  {
    title: "Attendance",
    description: "Maintain staff attendance and day-level workforce visibility without spreadsheet drift.",
    route: "/attendance",
    tag: "Workforce",
    icon: FaUserCheck,
  },
  {
    title: "Credit Line",
    description: "Track customer outstanding and payment patterns with cleaner credit discipline.",
    route: "/creditline",
    tag: "Receivables",
    icon: FaCreditCard,
  },
  {
    title: "Finance",
    description: "Organize expenses and cash flow for better reporting confidence and closing control.",
    route: "/finance",
    tag: "Accounts",
    icon: FaMoneyBillTrendUp,
  },
  {
    title: "Whole Day Report",
    description: "Generate a complete daily report across operations, payments, and performance.",
    route: "/wholeday",
    tag: "Reporting",
    icon: FaClipboardList,
  },
];

export default function DashboardMain() {
  useEffect(() => {
    AOS.init({
      duration: 850,
      offset: 70,
      once: true,
    });
  }, []);

  return (
    <>
      <Header />

      <section className="dashboard-hub">
        <div className="dashboard-hub-orb dashboard-hub-orb-a" />
        <div className="dashboard-hub-orb dashboard-hub-orb-b" />

        <div className="dashboard-hub-inner">
          <header className="dashboard-hub-hero" data-aos="fade-up">
            <p className="dashboard-hub-eyebrow">Control Center</p>
            <h1 className="dashboard-hub-title">Petrol Pump Dashboard</h1>
            <p className="dashboard-hub-subtitle">
              Choose a module to manage daily operations with speed, clarity, and audit-ready records.
            </p>

            <div className="dashboard-hub-stat-row">
              <div className="dashboard-hub-stat-pill">
                <span className="dashboard-hub-stat-value">12</span>
                <span className="dashboard-hub-stat-label">Core Modules</span>
              </div>
              <div className="dashboard-hub-stat-pill">
                <span className="dashboard-hub-stat-value">Role-Based</span>
                <span className="dashboard-hub-stat-label">Access Routing</span>
              </div>
              <div className="dashboard-hub-stat-pill">
                <span className="dashboard-hub-stat-value">Realtime</span>
                <span className="dashboard-hub-stat-label">Operational Flow</span>
              </div>
            </div>
          </header>

          <main className="dashboard-hub-grid">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <Link
                  to={module.route}
                  key={module.title}
                  className="dashboard-hub-card"
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 45, 220)}
                >
                  <div className="dashboard-hub-card-top">
                    <span className="dashboard-hub-chip">{module.tag}</span>
                    <span className="dashboard-hub-icon-wrap">
                      <Icon className="dashboard-hub-icon" />
                    </span>
                  </div>

                  <h3 className="dashboard-hub-card-title">{module.title}</h3>
                  <p className="dashboard-hub-card-desc">{module.description}</p>

                  <span className="dashboard-hub-card-link">
                    Open Module <FaArrowRightLong />
                  </span>
                </Link>
              );
            })}
          </main>
        </div>
      </section>

      <Footer />
    </>
  );
}
