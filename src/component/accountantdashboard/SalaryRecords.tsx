import { useEffect, useState } from "react";
import styles from "../../style/accountantdashboard/salaryrecords.module.css";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function SalaryRecords() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/payroll/attendance`)
      .then((r) => r.json())
      .then((d) => setRecords(d))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.card}>
      <h3>Salary / Payroll Records</h3>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Shift</th>
            <th>Date</th>
            <th>Salary</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.employeeId?.name}</td>
              <td>{r.shift}</td>
              <td>{r.date}</td>
              <td className={styles.amount}>₹{r.salaryEarned || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
