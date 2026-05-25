import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRightLong,
  FaChartColumn,
  FaChartLine,
  FaClipboardList,
  FaCreditCard,
  FaDroplet,
  FaGaugeHigh,
  FaGasPump,
  FaMoneyBillTrendUp,
  FaReceipt,
  FaShieldHalved,
  FaUserCheck,
  FaWarehouse,
} from "react-icons/fa6";
import AOS from "aos";
import "aos/dist/aos.css";
import "../style/DashboardMain.css";

type ModulePermissionKey =
  | "shift"
  | "testFuel"
  | "fuelRate"
  | "pumpManagement"
  | "addTank"
  | "saleEntry"
  | "tankManagement"
  | "attendance"
  | "creditLine"
  | "finance"
  | "wholeDayReport"
  | "payment"
  | "paymentComparison";

type SummaryData = {
  totalSales: number;
  totalLitres: number;
  cashPayments: number;
  bankPayments: number;
  stockLevels: Array<{ fuelType: string; currentLevel: number; capacity: number }>;
  totalStaff: number;
  presentToday: number;
  totalOutstanding: number;
};

type SaleSnippet = {
  _id?: string;
  saleId?: string;
  totalAmount?: number;
  totalLitres?: number;
  paymentMode?: string;
  createdAt?: string;
};

const quickActions = [
  {
    title: "Start / Manage Shift",
    subtitle: "Open, close, and handover shift checkpoints quickly.",
    route: "/shift",
    icon: FaGaugeHigh,
    permissionKey: "shift" as ModulePermissionKey,
  },
  {
    title: "Record Sale Entry",
    subtitle: "Capture nozzle readings and payment totals.",
    route: "/saleentry",
    icon: FaMoneyBillTrendUp,
    permissionKey: "saleEntry" as ModulePermissionKey,
  },
  {
    title: "Record Tank Movement",
    subtitle: "Update dip/stock movement for inventory control.",
    route: "/tanks",
    icon: FaWarehouse,
    permissionKey: "tankManagement" as ModulePermissionKey,
  },
  {
    title: "Log Daily Expense",
    subtitle: "Capture finance outflow with categorized entries.",
    route: "/finance",
    icon: FaReceipt,
    permissionKey: "finance" as ModulePermissionKey,
  },
  {
    title: "Credit Follow-Up",
    subtitle: "Track overdue credit accounts and reminders.",
    route: "/creditline",
    icon: FaCreditCard,
    permissionKey: "creditLine" as ModulePermissionKey,
  },
  {
    title: "Generate Report",
    subtitle: "Export day-end operations and collections.",
    route: "/wholeday",
    icon: FaClipboardList,
    permissionKey: "wholeDayReport" as ModulePermissionKey,
  },
  {
    title: "SuperAdmin Assignment",
    subtitle: "Create and switch pump-level SuperAdmins.",
    route: "/owner/super-admins",
    icon: FaShieldHalved,
    onlyFor: ["Owner"] as string[],
  },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat("en-IN");

export default function DashboardMain() {
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5001/api"
      : "https://amarneerfuelstationbackend.onrender.com/api");
  const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

  const userRole = localStorage.getItem("userRole") || "";
  const customRoleName = localStorage.getItem("customRoleName") || "";
  const [accessiblePumps, setAccessiblePumps] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [selectedPumpId, setSelectedPumpId] = useState(localStorage.getItem("selectedPumpId") || "");
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [summary, setSummary] = useState<SummaryData>({
    totalSales: 0,
    totalLitres: 0,
    cashPayments: 0,
    bankPayments: 0,
    stockLevels: [],
    totalStaff: 0,
    presentToday: 0,
    totalOutstanding: 0,
  });
  const [recentSales, setRecentSales] = useState<SaleSnippet[]>([]);

  const modulePermissions = (() => {
    try {
      return JSON.parse(localStorage.getItem("modulePermissions") || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  })();

  const visibleQuickActions = quickActions.filter((item) => {
    if (item.onlyFor && !item.onlyFor.includes(userRole)) return false;
    if (userRole === "Admin" && item.permissionKey) return Boolean(modulePermissions[item.permissionKey]);
    return true;
  });

  useEffect(() => {
    AOS.init({
      duration: 850,
      offset: 70,
      once: true,
    });
    const fetchPumps = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pumps`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        setAccessiblePumps(data);
        if (!localStorage.getItem("selectedPumpId") && data[0]?._id) {
          localStorage.setItem("selectedPumpId", data[0]._id);
          setSelectedPumpId(data[0]._id);
        }
      } catch {
        // ignore silently on dashboard
      }
    };
    fetchPumps();
  }, [BASE_URL]);

  useEffect(() => {
    const syncFromStorage = () => {
      setSelectedPumpId(localStorage.getItem("selectedPumpId") || "");
    };

    const handlePumpChange = () => {
      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("pump-context-changed", handlePumpChange as EventListener);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("pump-context-changed", handlePumpChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!selectedPumpId) return;
    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        const [summaryRes, salesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/dashboard`),
          fetch(`${BASE_URL}/sales`),
        ]);

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary({
            totalSales: Number(summaryData?.totalSales || 0),
            totalLitres: Number(summaryData?.totalLitres || 0),
            cashPayments: Number(summaryData?.cashPayments || 0),
            bankPayments: Number(summaryData?.bankPayments || 0),
            stockLevels: Array.isArray(summaryData?.stockLevels) ? summaryData.stockLevels : [],
            totalStaff: Number(summaryData?.totalStaff || 0),
            presentToday: Number(summaryData?.presentToday || 0),
            totalOutstanding: Number(summaryData?.totalOutstanding || 0),
          });
        }

        if (salesRes.ok) {
          const salesData = await salesRes.json();
          const rows = Array.isArray(salesData) ? salesData : [];
          const sorted = [...rows].sort((a: any, b: any) => {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });
          setRecentSales(sorted.slice(0, 5));
        } else {
          setRecentSales([]);
        }

        setLastSyncAt(new Date());
      } catch {
        setRecentSales([]);
      } finally {
        setLoadingOverview(false);
      }
    };
    fetchOverview();
  }, [BASE_URL, selectedPumpId]);

  const selectedPump = useMemo(
    () => accessiblePumps.find((pump) => pump._id === selectedPumpId) || null,
    [accessiblePumps, selectedPumpId]
  );

  const stockSignals = useMemo(
    () =>
      (summary.stockLevels || []).map((stock) => {
        const capacity = Number(stock.capacity || 0);
        const current = Number(stock.currentLevel || 0);
        const ratio = capacity > 0 ? (current / capacity) * 100 : 0;
        return {
          ...stock,
          ratio,
          status: ratio <= 20 ? "Critical" : ratio <= 40 ? "Watch" : "Healthy",
        };
      }),
    [summary.stockLevels]
  );

  const lowStockCount = stockSignals.filter((item) => item.status !== "Healthy").length;
  const shiftLabel = (() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning Shift";
    if (hour >= 14 && hour < 22) return "Evening Shift";
    return "Night Shift";
  })();

  const nonCashCollections = Math.max(0, Number(summary.totalSales) - Number(summary.cashPayments));
  const todayPresencePct =
    summary.totalStaff > 0 ? Math.round((summary.presentToday / summary.totalStaff) * 100) : 0;

  return (
    <section className="dashboard-hub">
        <div className="dashboard-hub-orb dashboard-hub-orb-a" />
        <div className="dashboard-hub-orb dashboard-hub-orb-b" />

        <div className="dashboard-hub-inner">
          <header className="dashboard-hub-hero" data-aos="fade-up">
            <p className="dashboard-hub-eyebrow">Operations Overview</p>
            <h1 className="dashboard-hub-title">Pump Intelligence Dashboard</h1>
            <p className="dashboard-hub-subtitle">
              Live operational signals across sales, stock, cashflow, attendance, and credit. Use the left navigation
              for modules and monitor execution from here.
            </p>

            <div className="dashboard-hub-context-row">
              <div className="dashboard-hub-context-pill">
                <span className="dashboard-hub-stat-value">Active Pump</span>
                <span className="dashboard-hub-stat-label">
                  {selectedPump ? `${selectedPump.name} (${selectedPump.code})` : "Select from top-right"}
                </span>
              </div>
              <div className="dashboard-hub-context-pill">
                <span className="dashboard-hub-stat-value">Shift Window</span>
                <span className="dashboard-hub-stat-label">{shiftLabel}</span>
              </div>
              <div className="dashboard-hub-context-pill">
                <span className="dashboard-hub-stat-value">Last Sync</span>
                <span className="dashboard-hub-stat-label">
                  {lastSyncAt ? lastSyncAt.toLocaleTimeString() : loadingOverview ? "Syncing..." : "No data"}
                </span>
              </div>
              {userRole === "Admin" && customRoleName && (
                <div className="dashboard-hub-context-pill">
                  <span className="dashboard-hub-stat-value">Signed In As</span>
                  <span className="dashboard-hub-stat-label">{customRoleName}</span>
                </div>
              )}
            </div>
          </header>

          <main className="dashboard-overview">
            <section className="dashboard-kpi-grid" data-aos="fade-up">
              <article className="dashboard-kpi-card">
                <span className="dashboard-kpi-icon"><FaMoneyBillTrendUp /></span>
                <p className="dashboard-kpi-label">Today Sales</p>
                <h3 className="dashboard-kpi-value">{currency.format(summary.totalSales || 0)}</h3>
              </article>

              <article className="dashboard-kpi-card">
                <span className="dashboard-kpi-icon"><FaDroplet /></span>
                <p className="dashboard-kpi-label">Fuel Dispensed</p>
                <h3 className="dashboard-kpi-value">{numberFmt.format(Math.round(summary.totalLitres || 0))} L</h3>
              </article>

              <article className="dashboard-kpi-card">
                <span className="dashboard-kpi-icon"><FaChartColumn /></span>
                <p className="dashboard-kpi-label">Cash vs Digital</p>
                <h3 className="dashboard-kpi-value">
                  {currency.format(summary.cashPayments || 0)} / {currency.format(nonCashCollections)}
                </h3>
              </article>

              <article className="dashboard-kpi-card">
                <span className="dashboard-kpi-icon"><FaCreditCard /></span>
                <p className="dashboard-kpi-label">Credit Outstanding</p>
                <h3 className="dashboard-kpi-value">{currency.format(summary.totalOutstanding || 0)}</h3>
              </article>

              <article className="dashboard-kpi-card">
                <span className="dashboard-kpi-icon"><FaUserCheck /></span>
                <p className="dashboard-kpi-label">Staff Presence</p>
                <h3 className="dashboard-kpi-value">
                  {summary.presentToday}/{summary.totalStaff} ({todayPresencePct}%)
                </h3>
              </article>
            </section>

            <section className="dashboard-mid-grid">
              <article className="dashboard-panel" data-aos="fade-up">
                <div className="dashboard-panel-head">
                  <h3>Operational Signals</h3>
                  <span>{lowStockCount} alerts</span>
                </div>

                {stockSignals.length === 0 ? (
                  <p className="dashboard-muted">No tank stock data available for this pump yet.</p>
                ) : (
                  <div className="dashboard-stock-list">
                    {stockSignals.slice(0, 5).map((stock) => (
                      <div className="dashboard-stock-row" key={`${stock.fuelType}-${stock.capacity}`}>
                        <div className="dashboard-stock-title-row">
                          <p>{stock.fuelType || "Fuel"}</p>
                          <span>{stock.status}</span>
                        </div>
                        <div className="dashboard-stock-bar">
                          <div style={{ width: `${Math.max(6, Math.min(100, stock.ratio))}%` }} />
                        </div>
                        <small>
                          {numberFmt.format(Math.round(stock.currentLevel || 0))} /{" "}
                          {numberFmt.format(Math.round(stock.capacity || 0))} litres
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-panel" data-aos="fade-up" data-aos-delay="60">
                <div className="dashboard-panel-head">
                  <h3>Quick Actions</h3>
                  <span>{visibleQuickActions.length} available</span>
                </div>
                <div className="dashboard-action-list">
                  {visibleQuickActions.slice(0, 6).map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link to={action.route} className="dashboard-action-item" key={action.title}>
                        <span className="dashboard-action-icon"><Icon /></span>
                        <span>
                          <strong>{action.title}</strong>
                          <small>{action.subtitle}</small>
                        </span>
                        <FaArrowRightLong />
                      </Link>
                    );
                  })}
                </div>
              </article>
            </section>

            <section className="dashboard-bottom-grid">
              <article className="dashboard-panel" data-aos="fade-up">
                <div className="dashboard-panel-head">
                  <h3>Recent Transactions</h3>
                  <Link to="/saleentry" className="dashboard-inline-link">View sales</Link>
                </div>
                {recentSales.length === 0 ? (
                  <p className="dashboard-muted">No recent sale entries recorded yet.</p>
                ) : (
                  <div className="dashboard-sales-list">
                    {recentSales.map((sale) => (
                      <div className="dashboard-sale-row" key={sale._id || sale.saleId}>
                        <div>
                          <strong>{sale.saleId || "Sale Entry"}</strong>
                          <small>{sale.createdAt ? new Date(sale.createdAt).toLocaleString() : "-"}</small>
                        </div>
                        <div>
                          <strong>{currency.format(Number(sale.totalAmount || 0))}</strong>
                          <small>{numberFmt.format(Math.round(Number(sale.totalLitres || 0)))} L</small>
                        </div>
                        <span className="dashboard-sale-chip">{sale.paymentMode || "Mixed"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-panel" data-aos="fade-up" data-aos-delay="60">
                <div className="dashboard-panel-head">
                  <h3>Executive Notes</h3>
                  <span>Auto Insights</span>
                </div>
                <ul className="dashboard-note-list">
                  <li>
                    <FaChartLine />
                    <span>
                      Sales throughput is {summary.totalLitres > 0 ? "active" : "not started yet"} for current pump.
                    </span>
                  </li>
                  <li>
                    <FaGasPump />
                    <span>
                      {lowStockCount > 0
                        ? `${lowStockCount} stock line(s) need monitoring.`
                        : "Tank stock levels are currently healthy."}
                    </span>
                  </li>
                  <li>
                    <FaUserCheck />
                    <span>
                      Attendance readiness is {todayPresencePct >= 70 ? "stable" : "below target"} ({todayPresencePct}
                      % present).
                    </span>
                  </li>
                  <li>
                    <FaCreditCard />
                    <span>
                      Outstanding credit is {currency.format(summary.totalOutstanding || 0)}. Follow up on due
                      accounts today.
                    </span>
                  </li>
                </ul>
              </article>
            </section>
          </main>
        </div>
    </section>
  );
}
