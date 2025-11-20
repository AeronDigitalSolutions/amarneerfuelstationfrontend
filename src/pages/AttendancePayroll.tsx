import { useState, useEffect } from "react";
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

const BASE_URL = "https://amarneerfuelstationbackend.onrender.com";

export default function AttendancePayroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [, setLoading] = useState(false);

  // MODALS
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Add Employee
  const [emp, setEmp] = useState<Employee>({
    name: "",
    role: "",
    salaryType: "Monthly",
    salaryAmount: 0,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Add Attendance
  const [attendance, setAttendance] = useState<Attendance>({
    employeeId: "",
    date: "",
    shift: "",
    inTime: "",
    outTime: "",
    status: "Present",
    overtimeHours: 0,
  });

  // FILTERS
  const [filterMode, setFilterMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load Data
  useEffect(() => {
    fetchEmployees();
    fetchAttendances();
    autoFillShift();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/payroll/employee`);
      const data = await res.json();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendances = async () => {
    const res = await fetch(`${BASE_URL}/api/payroll/attendance`);
    const data = await res.json();
    setAttendances(data);
  };

  // Auto Fill Shift
  const autoFillShift = () => {
    const now = new Date();
    const hours = now.getHours();

    let shift = "A";
    if (hours >= 6 && hours < 14) shift = "A";
    else if (hours >= 14 && hours < 22) shift = "B";
    else shift = "C";

    setAttendance((prev) => ({
      ...prev,
      date: now.toISOString().split("T")[0],
      shift,
      inTime: now.toTimeString().substring(0, 5),
    }));
  };

  /* HANDLE INPUTS */
  const handleEmpChange = (e: any) => {
    const { name, value } = e.target;
    setEmp((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendanceChange = (e: any) => {
    const { name, value } = e.target;
    setAttendance((prev) => ({ ...prev, [name]: value }));
  };

  /* ADD EMPLOYEE */
  const addEmployee = async () => {
    if (!emp.name || !emp.role || !emp.salaryAmount)
      return alert("Please fill all required fields.");

    const res = await fetch(`${BASE_URL}/api/payroll/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emp),
    });

    const data = await res.json();
    setEmployees((prev) => [data, ...prev]);
    setShowEmployeeModal(false);
    setEmp({
      name: "",
      role: "",
      salaryType: "Monthly",
      salaryAmount: 0,
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    });
  };

  /* SAVE ATTENDANCE */
  const endShift = async () => {
    if (!attendance.employeeId) return alert("Select an employee!");

    const now = new Date();
    const updated = {
      ...attendance,
      outTime: now.toTimeString().substring(0, 5),
    };

    const res = await fetch(`${BASE_URL}/api/payroll/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const data = await res.json();
    setAttendances((prev) => [data, ...prev]);
    setShowAttendanceModal(false);

    setAttendance({
      employeeId: "",
      date: "",
      shift: "",
      inTime: "",
      outTime: "",
      status: "Present",
      overtimeHours: 0,
    });
  };

  /* DELETE ATTENDANCE */
  const deleteAttendance = async (id: string) => {
    if (!window.confirm("Delete this record?")) return;

    await fetch(`${BASE_URL}/api/payroll/attendance/${id}`, {
      method: "DELETE",
    });

    setAttendances(attendances.filter((a) => a._id !== id));
  };

  /* FILTER LOGIC */
  const applyFilters = (data: Attendance[]) => {
    return data.filter((item) => {
      let matchesDate = true;

      if (filterMode === "single" && singleDate)
        matchesDate = item.date === singleDate;

      if (filterMode === "range" && startDate && endDate)
        matchesDate = item.date >= startDate && item.date <= endDate;

      let matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesDate && matchesStatus;
    });
  };

  const clearFilters = () => {
    setSingleDate("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("All");
  };

  const filteredData = applyFilters(attendances);

  return (
    <div className={styles.container}>
      <h1>👷 Attendance & Payroll Management</h1>

      {/* ======================================================
           TOP ACTION BUTTONS
      ====================================================== */}
      <div className={styles.toggleGroup}>
        <button
          className={styles.primaryButton}
          onClick={() => setShowEmployeeModal(true)}
        >
          ➕ Add Employee
        </button>

        <button
          className={styles.primaryButton}
          onClick={() => setShowAttendanceModal(true)}
        >
          ➕ Add Attendance / Shift
        </button>
      </div>

      {/* ======================================================
           FILTER BAR (Compact Horizontal)
      ====================================================== */}
      <div className={styles.filterCard}>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleButton} ${
              filterMode === "single" ? styles.toggleActive : ""
            }`}
            onClick={() => setFilterMode("single")}
          >
            Single Date
          </button>
          <button
            className={`${styles.toggleButton} ${
              filterMode === "range" ? styles.toggleActive : ""
            }`}
            onClick={() => setFilterMode("range")}
          >
            Date Range
          </button>
        </div>

        <div className={styles.filterRow}>
          {filterMode === "single" && (
            <input
              type="date"
              className={styles.filterInput}
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
            />
          )}

          {filterMode === "range" && (
            <>
              <input
                type="date"
                className={styles.filterInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className={styles.filterInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}

          <select
            className={styles.filterInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>

          <button className={styles.clearButton} onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* ======================================================
           ATTENDANCE TABLE
      ====================================================== */}
      <section className={styles.section}>
        <h2>📋 Attendance Records</h2>

        <div className={styles.tableContainer}>
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
                <th>Salary</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((a) => {
                const empData =
                  typeof a.employeeId === "object"
                    ? a.employeeId
                    : employees.find((e) => e._id === a.employeeId);

                return (
                  <tr key={a._id}>
                    <td>{a.date}</td>
                    <td>
                      {empData
                        ? `${empData.name} (${empData.role})`
                        : "Unknown"}
                    </td>
                    <td>{a.shift}</td>
                    <td>{a.inTime}</td>
                    <td>{a.outTime}</td>
                    <td>{a.status}</td>
                    <td>{a.overtimeHours}</td>
                    <td>{a.salaryEarned || 0}</td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteAttendance(a._id!)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
           EMPLOYEE MODAL
      ====================================================== */}
      {showEmployeeModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEmployeeModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Employee</h3>

            <div className={styles.formGrid}>
              <input
                name="name"
                placeholder="Employee Name"
                value={emp.name}
                onChange={handleEmpChange}
              />
              <input
                name="role"
                placeholder="Role"
                value={emp.role}
                onChange={handleEmpChange}
              />
              <select
                name="salaryType"
                value={emp.salaryType}
                onChange={handleEmpChange}
              >
                <option>Monthly</option>
                <option>Shift</option>
              </select>
              <input
                name="salaryAmount"
                type="number"
                placeholder="Salary Amount"
                value={emp.salaryAmount}
                onChange={handleEmpChange}
              />

              <input
                name="bankName"
                placeholder="Bank Name"
                value={emp.bankName}
                onChange={handleEmpChange}
              />
              <input
                name="accountNumber"
                placeholder="Account Number"
                value={emp.accountNumber}
                onChange={handleEmpChange}
              />
              <input
                name="ifscCode"
                placeholder="IFSC Code"
                value={emp.ifscCode}
                onChange={handleEmpChange}
              />
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveButton} onClick={addEmployee}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowEmployeeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
           ATTENDANCE MODAL
      ====================================================== */}
      {showAttendanceModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAttendanceModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Attendance / Shift</h3>

            <div className={styles.formGrid}>
              <select
                name="employeeId"
                value={attendance.employeeId as string}
                onChange={handleAttendanceChange}
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                value={attendance.date}
                onChange={handleAttendanceChange}
              />
              <input
                name="shift"
                value={attendance.shift}
                readOnly
                placeholder="Shift"
              />
              <input
                type="time"
                name="inTime"
                value={attendance.inTime}
                readOnly
              />
              <input
                type="time"
                name="outTime"
                value={attendance.outTime}
                onChange={handleAttendanceChange}
              />
              <select
                name="status"
                value={attendance.status}
                onChange={handleAttendanceChange}
              >
                <option>Present</option>
                <option>Absent</option>
                <option>Leave</option>
              </select>
              <input
                type="number"
                name="overtimeHours"
                value={attendance.overtimeHours}
                onChange={handleAttendanceChange}
                placeholder="Overtime (hrs)"
              />
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveButton} onClick={endShift}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowAttendanceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
