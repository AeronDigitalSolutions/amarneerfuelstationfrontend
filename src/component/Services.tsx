import "../style/Services.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  FaArrowRightLong,
  FaChartLine,
  FaClock,
  FaGaugeHigh,
  FaMoneyBillTrendUp,
  FaReceipt,
  FaUserGear,
  FaWarehouse,
} from "react-icons/fa6";
import AOS from "aos";
import "aos/dist/aos.css";

const serviceModules = [
  {
    title: "Fuel Sale Entry",
    description: "Capture nozzle-wise meter sales with shift-level clarity and fewer manual errors.",
    route: "/saleentry",
    label: "Operations",
    icon: FaReceipt,
  },
  {
    title: "Tank Management",
    description: "Track dip, refill, closing stock, and variance across all tanks in one place.",
    route: "/tanks",
    label: "Inventory",
    icon: FaWarehouse,
  },
  {
    title: "Attendance & Payroll",
    description: "Manage staff attendance, shift timing, and payout records with audit-ready history.",
    route: "/attendance",
    label: "Workforce",
    icon: FaUserGear,
  },
  {
    title: "Accounting & Finance",
    description: "Handle expenses, journals, and summaries with structured financial visibility.",
    route: "/finance",
    label: "Finance",
    icon: FaMoneyBillTrendUp,
  },
  {
    title: "Credit Line Control",
    description: "Monitor customer balances, payment reminders, and outstanding exposure.",
    route: "/creditline",
    label: "Credit",
    icon: FaChartLine,
  },
  {
    title: "Live Dashboard",
    description: "Watch sales, stock movement, and performance metrics update in near real-time.",
    route: "/dashboard",
    label: "Insights",
    icon: FaGaugeHigh,
  },
  {
    title: "Whole Day Report",
    description: "Generate a complete operational view of daily sales, fuel tests, and collections.",
    route: "/wholeday",
    label: "Reporting",
    icon: FaClock,
  },
];

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 80,
      once: true,
    });
  }, []);

  return (
    <section className="services-premium">
      <div className="services-bg-orb services-bg-orb-a" />
      <div className="services-bg-orb services-bg-orb-b" />

      <div className="services-premium-inner">
        <header className="services-hero" data-aos="fade-up">
          <p className="services-eyebrow">Services</p>
          <h1 className="services-heading">Modern Petrol Pump Operations, Designed Like Enterprise Software</h1>
          <p className="services-subheading">
            Everything your station needs from entry to insights, structured for speed, clarity, and reliable day-to-day control.
          </p>

          <div className="services-stats">
            <div className="services-stat-pill">
              <span className="services-stat-value">7+</span>
              <span className="services-stat-label">Core Modules</span>
            </div>
            <div className="services-stat-pill">
              <span className="services-stat-value">Role-Based</span>
              <span className="services-stat-label">Operational Access</span>
            </div>
            <div className="services-stat-pill">
              <span className="services-stat-value">Realtime</span>
              <span className="services-stat-label">Performance Visibility</span>
            </div>
          </div>
        </header>

        <main className="services-grid">
          {serviceModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                to={module.route}
                key={module.title}
                className="service-card"
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 60, 240)}
              >
                <div className="service-card-top">
                  <span className="service-chip">{module.label}</span>
                  <span className="service-icon-wrap">
                    <Icon className="service-icon" />
                  </span>
                </div>

                <h3 className="service-title">{module.title}</h3>
                <p className="service-desc">{module.description}</p>

                <div className="service-link-row">
                  <span>Explore Module</span>
                  <FaArrowRightLong />
                </div>
              </Link>
            );
          })}
        </main>
      </div>
    </section>
  );
};

export default Services;
