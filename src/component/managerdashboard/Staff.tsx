import { useEffect, useState } from "react";
import styles from "../../style/managerdashboard/staff.module.css";
import { FaUsers, FaUserCheck } from "react-icons/fa";

type Employee = {
  _id?: string;
  name: string;
  role: string;
  salaryType?: string;
  salaryAmount?: number;
};

type Attendance = {
  _id?: string;
  employeeId: string | Employee;
  date: string;
  status: string;
  shift?: string;
  inTime?: string;
  outTime?: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes("localhost") ? "http://localhost:5000/api" : "https://amarneerfuelstationbackend.onrender.com/api");

export default function Staff() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([
        fetch(`${BASE_URL}/api/payroll/employee`).then((r) => r.ok ? r.json() : []),
        fetch(`${BASE_URL}/api/payroll/attendance`).then((r) => r.ok ? r.json() : []),
      ]);
      setEmployees(Array.isArray(r1) ? r1 : []);
      setAttendances(Array.isArray(r2) ? r2 : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const todayIso = new Date().toISOString().split("T")[0];

  const totalEmployees = employees.length;
  const presentToday = attendances.filter(a => (a.date || "").split("T")[0] === todayIso && a.status === "Present").length;

  const recentAttendance = [...attendances].sort((a,b) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())).slice(0, 8);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Staff Summary</h2>
        <p className={styles.sub}>Headcount & today's attendance</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaUsers className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Employees</div>
              <div className={styles.cardValue}>{totalEmployees}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>All roles</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaUserCheck className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Present Today</div>
              <div className={styles.cardValue}>{presentToday}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>{totalEmployees ? `${((presentToday/totalEmployees)*100).toFixed(0)}% present` : "—"}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconBadge}>💼</div>
            <div>
              <div className={styles.cardTitle}>Payroll Count</div>
              <div className={styles.cardValue}>{employees.filter(e => e.salaryType === "Monthly").length} monthly</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Shift vs monthly</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconBadge}>🕒</div>
            <div>
              <div className={styles.cardTitle}>Recent Shift Records</div>
              <div className={styles.cardValueSmall}>{recentAttendance.length} entries</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Latest attendance</div>
        </div>
      </div>

      <section className={styles.recent}>
        <h3>Recent Attendance</h3>
        {loading ? <p className={styles.loading}>Loading…</p> : (
          recentAttendance.length === 0 ? <p className={styles.empty}>No attendance records</p> : (
            <ul className={styles.list}>
              {recentAttendance.map(a => {
                const emp = typeof a.employeeId === "object" ? a.employeeId : employees.find(e => e._id === a.employeeId);
                return (
                  <li key={a._id} className={styles.listItem}>
                    <div>
                      <div className={styles.name}>{emp ? `${emp.name} (${emp.role})` : "Unknown"}</div>
                      <div className={styles.meta}>{a.date} · {a.shift || "-"} · {a.status}</div>
                    </div>
                    <div className={styles.time}>{a.inTime || "-"} — {a.outTime || "-"}</div>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </section>
    </div>
  );
}
