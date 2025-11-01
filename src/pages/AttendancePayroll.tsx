import { useState, useEffect } from "react";
import api from "../utils/api";
import styles from "../style/attendancepayroll.module.css";

type Employee = {
  _id?: string;
  name: string;
  role: string;
  salaryType: "Monthly" | "Shift";
  salaryAmount: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
};

type Attendance = {
  _id?: string;
  employeeId: string | Employee;
  date: string;
  shift: string;
  inTime: string;
  outTime: string;
  status: string;
  overtimeHours: number;
  salaryEarned?: number;
};

export default function AttendancePayroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const [emp, setEmp] = useState<Employee>({
    name: "",
    role: "",
    salaryType: "Monthly",
    salaryAmount: 0,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const [attendance, setAttendance] = useState<Attendance>({
    employeeId: "",
    date: "",
    shift: "",
    inTime: "",
    outTime: "",
    status: "Present",
    overtimeHours: 0,
  });

  // 🧭 On mount, load employees & attendance
  useEffect(() => {
    fetchEmployees();
    fetchAttendances();
    autoFillShift();
  }, []);

  /** 🔹 Fetch Employees */
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/payroll/employee");
      setEmployees(res.data);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      alert("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Fetch Attendance Records */
  const fetchAttendances = async () => {
    try {
      const res = await api.get("/api/payroll/attendance");
      setAttendances(res.data);
    } catch (err: any) {
      console.error("Error fetching attendance records:", err);
      alert("Failed to load attendance data.");
    }
  };

  /** ⏰ Automatically set date, shift, and shift start time */
  const autoFillShift = () => {
    const now = new Date();
    const hours = now.getHours();

    let shift = "A";
    if (hours >= 6 && hours < 14) shift = "A";
    else if (hours >= 14 && hours < 22) shift = "B";
    else shift = "C";

    setAttendance(prev => ({
      ...prev,
      date: now.toISOString().split("T")[0],
      shift,
      inTime: now.toTimeString().substring(0, 5),
    }));
  };

  /** 🔹 Handle Employee Form Change */
  const handleEmpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmp(prev => ({ ...prev, [name]: value }));
  };

  /** ➕ Add Employee */
  const addEmployee = async () => {
    if (!emp.name || !emp.role || !emp.salaryAmount) {
      alert("Please fill employee name, role, and salary amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/payroll/employee", emp);
      setEmployees(prev => [res.data, ...prev]);
      setEmp({
        name: "",
        role: "",
        salaryType: "Monthly",
        salaryAmount: 0,
        bankName: "",
        accountNumber: "",
        ifscCode: "",
      });
      alert("✅ Employee added successfully!");
    } catch (err: any) {
      console.error("Error adding employee:", err);
      alert("Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Handle Attendance Change */
  const handleAttendanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAttendance(prev => ({ ...prev, [name]: value }));
  };

  /** 🕒 Start shift — sets current inTime/date/shift automatically */
  const startShift = () => {
    autoFillShift();
    alert("Shift started!");
  };

  /** 🕔 End shift — saves current outTime and submits attendance */
  const endShift = async () => {
    if (!attendance.employeeId) {
      alert("Select an employee first!");
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      const updatedAttendance = {
        ...attendance,
        outTime: now.toTimeString().substring(0, 5),
      };

      const res = await api.post("/api/payroll/attendance", updatedAttendance);
      setAttendances(prev => [res.data, ...prev]);

      alert("✅ Attendance saved successfully!");

      setAttendance({
        employeeId: "",
        date: "",
        shift: "",
        inTime: "",
        outTime: "",
        status: "Present",
        overtimeHours: 0,
      });
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      alert("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  /** 🗑️ Delete Attendance */
  const deleteAttendance = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await api.delete(`/api/payroll/attendance/${id}`);
      setAttendances(prev => prev.filter(a => a._id !== id));
    } catch (err: any) {
      console.error("Error deleting attendance:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>👷 Attendance & Payroll Management</h1>

      {/* ➕ Add Employee */}
      <section className={styles.section}>
        <h2>➕ Add Employee</h2>
        <div className={styles.formGrid}>
          <input name="name" placeholder="Employee Name" value={emp.name} onChange={handleEmpChange} />
          <input name="role" placeholder="Role (e.g., Manager, Pump Operator)" value={emp.role} onChange={handleEmpChange} />
          <select name="salaryType" value={emp.salaryType} onChange={handleEmpChange}>
            <option>Monthly</option>
            <option>Shift</option>
          </select>
          <input name="salaryAmount" type="number" placeholder="Salary Amount (₹)" value={emp.salaryAmount} onChange={handleEmpChange} />
          <input name="bankName" placeholder="Bank Name" value={emp.bankName} onChange={handleEmpChange} />
          <input name="accountNumber" placeholder="Account Number" value={emp.accountNumber} onChange={handleEmpChange} />
          <input name="ifscCode" placeholder="IFSC Code" value={emp.ifscCode} onChange={handleEmpChange} />
        </div>
        <button onClick={addEmployee} className={styles.addButton} disabled={loading}>
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </section>

      {/* 🕒 Attendance / Shift */}
      <section className={styles.section}>
        <h2>🕒 Attendance / Shift Management</h2>
        <div className={styles.formGrid}>
          <select name="employeeId" value={attendance.employeeId as string} onChange={handleAttendanceChange}>
            <option value="">Select Employee</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>
                {e._id?.substring(e._id.length - 5)} – {e.name} ({e.role})
              </option>
            ))}
          </select>

          <input type="date" name="date" value={attendance.date} onChange={handleAttendanceChange} />
          <input name="shift" value={attendance.shift} readOnly placeholder="Shift (auto-filled)" />
          <input type="time" name="inTime" value={attendance.inTime} readOnly placeholder="In Time" />
          <input type="time" name="outTime" value={attendance.outTime} onChange={handleAttendanceChange} placeholder="Out Time" />
          <select name="status" value={attendance.status} onChange={handleAttendanceChange}>
            <option>Present</option>
            <option>Absent</option>
            <option>Leave</option>
          </select>
          <input type="number" name="overtimeHours" placeholder="Overtime (hrs)" value={attendance.overtimeHours} onChange={handleAttendanceChange} />
        </div>

        <div className={styles.buttonRow}>
          <button onClick={startShift} className={styles.startButton}>Start Shift</button>
          <button onClick={endShift} className={styles.addButton} disabled={loading}>
            {loading ? "Saving..." : "End Shift & Save"}
          </button>
        </div>
      </section>

      {/* 📋 Attendance Records */}
      <section className={styles.section}>
        <h2>📋 Attendance Records</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Shift</th>
              <th>In</th>
              <th>Out</th>
              <th>Status</th>
              <th>Overtime</th>
              <th>Salary (₹)</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map(a => {
              const empData =
                typeof a.employeeId === "object"
                  ? a.employeeId
                  : employees.find(e => e._id === a.employeeId);

              return (
                <tr key={a._id}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>
                    {empData
                      ? `${(empData._id || "").substring((empData._id || "").length - 5)} – ${empData.name} (${empData.role})`
                      : "Unknown"}
                  </td>
                  <td>{a.shift}</td>
                  <td>{a.inTime}</td>
                  <td>{a.outTime}</td>
                  <td>{a.status}</td>
                  <td>{a.overtimeHours}</td>
                  <td>{a.salaryEarned?.toFixed(2) || 0}</td>
                  <td>
                    <button onClick={() => deleteAttendance(a._id!)} className={styles.deleteButton}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
