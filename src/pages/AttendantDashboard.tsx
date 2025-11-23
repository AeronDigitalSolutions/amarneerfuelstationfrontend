import { useEffect, useState } from "react";
import styles from "../style/attendantDashboard.module.css";

import AttendanceSidebar from "../component/attendantdashboard/Attendance";
import SalarySummarySidebar from "../component/attendantdashboard/SalarySummary";
import ShiftSidebar from "../component/attendantdashboard/Shift";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://amarneerfuelstationbackend.onrender.com";

export default function AttendantDashboard() {
  const [activeTab, setActiveTab] = useState<"attendance" | "salary" | "shift">(
    "attendance"
  );

  const username = localStorage.getItem("username") || "Attendant";

  // ---------- Dynamic Data States ----------
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState<any>(null);
  const [shifts, setShifts] = useState([]);

  // ---------- Fetch Data ----------
  useEffect(() => {
    fetchAttendance();
    fetchShifts();
    fetchSalaryDetails();
  }, []);

  // Attendance
  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payroll/attendance`);
      const data = await res.json();

      // Filter only this attendant's records
      const myData = data.filter(
        (a: any) => a.employeeId?.name === username
      );

      setAttendance(myData);
    } catch (error) {
      console.error("Attendance fetch error:", error);
    }
  };

  // Shift Timings
  const fetchShifts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/shifts`);
      const data = await res.json();
      setShifts(data);
    } catch (error) {
      console.error("Shift fetch error:", error);
    }
  };

  // Salary Summary
  const fetchSalaryDetails = async () => {
    try {
      const empRes = await fetch(`${BASE_URL}/api/payroll/employee`);
      const empData = await empRes.json();

      const employee = empData.find(
        (e: any) => e.name === username
      );

      if (!employee) return;

      // Calculate attendance count for salary estimate
      const attendanceRes = await fetch(`${BASE_URL}/api/payroll/attendance`);
      const attendanceData = await attendanceRes.json();

      const myAttendance = attendanceData.filter(
        (a: any) => a.employeeId?.name === username
      );

      const summary = {
        salaryType: employee.salaryType,
        baseSalary: employee.salaryAmount,
        daysPresent: myAttendance.length,
        shiftsThisMonth: myAttendance.length,
        estimatedEarned:
          employee.salaryType === "Monthly"
            ? (employee.salaryAmount / 30) * myAttendance.length
            : employee.salaryAmount * myAttendance.length,
      };

      setSalary(summary);
    } catch (error) {
      console.error("Salary Error:", error);
    }
  };

  // ---------- Logout ----------
  const logout = () => {
    localStorage.clear();
    window.location.href = "/sign";
  };

  return (
    <div className={styles.page}>
      {/* ---------- Sidebar ---------- */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Attendant</div>

        <nav>
          <button
            className={`${styles.link} ${
              activeTab === "attendance" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>

          <button
            className={`${styles.link} ${
              activeTab === "salary" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("salary")}
          >
            Salary Summary
          </button>

          <button
            className={`${styles.link} ${
              activeTab === "shift" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("shift")}
          >
            Shift Timing
          </button>

          <button className={styles.logout} onClick={logout}>
            Logout ⏏
          </button>
        </nav>
      </aside>

      {/* ---------- Main Area ---------- */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2>Attendant Dashboard</h2>
            <p className={styles.subtitle}>Welcome back, {username}</p>
          </div>
        </header>

        <main className={styles.content}>
          {activeTab === "attendance" && (
            <AttendanceSidebar records={attendance} />
          )}

          {activeTab === "salary" && (
            <SalarySummarySidebar summary={salary} />
          )}

          {activeTab === "shift" && <ShiftSidebar shifts={shifts} />}
        </main>
      </div>
    </div>
  );
}
