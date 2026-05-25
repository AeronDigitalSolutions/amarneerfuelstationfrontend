import { useEffect, useMemo, useState } from "react";
import styles from "../style/attendancepayroll.module.css";
import FullScreenLoader from "../component/FullScreenLoader";

type Employee = {
  _id?: string;
  name: string;
  employmentType: "Full-time" | "Part-time";
  salaryAmount: number;
  grantedHolidays: number;
  role?: string;
};

type AttendanceRow = {
  _id?: string;
  employeeId:
    | string
    | {
        _id: string;
        name: string;
        role?: string;
        employmentType?: string;
        salaryAmount?: number;
        grantedHolidays?: number;
      };
  date: string;
  shiftId?: string;
  shift?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  status: "Present" | "Absent";
  overtimeHours: number;
  shiftHours?: number;
  perDaySalary?: number;
  perHourSalary?: number;
  overtimePay?: number;
  salaryEarned?: number;
  shiftInfo?: {
    shiftId?: string | null;
    shiftName?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  };
};

type SalarySlipData = {
  employee: {
    _id: string;
    name: string;
    employmentType: string;
  };
  month: string;
  monthlySalary: number;
  perDaySalary: number;
  grantedHolidays: number;
  attendance: {
    totalEntries: number;
    presentDays: number;
    absentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
  };
  overtime: {
    hours: number;
    pay: number;
  };
  deductions: {
    unpaidLeaveDeduction: number;
  };
  bonus: number;
  salaryBreakup: {
    basePay: number;
    grossBeforeBonus: number;
    totalPayable: number;
  };
};

type ShiftMaster = {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
};

type EmployeeForm = {
  name: string;
  employmentType: "Full-time" | "Part-time";
  salaryAmount: number | "";
  grantedHolidays: number | "";
};

type AttendanceForm = {
  employeeId: string;
  date: string;
  shiftId: string;
  status: "Present" | "Absent";
  overtimeHours: number | "";
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

const toMinutes = (value: string) => {
  if (!value) return 0;
  const [hh, mm] = value.split(":").map(Number);
  if (Number.isFinite(hh) && Number.isFinite(mm)) return hh * 60 + mm;
  return 0;
};

const getShiftHours = (startTime: string, endTime: string) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const duration = end === start ? 24 * 60 : end > start ? end - start : 24 * 60 - start + end;
  return Number((duration / 60).toFixed(2));
};

const format12h = (value?: string) => {
  if (!value) return "--:--";
  const [hhRaw, mm] = value.split(":");
  const hh = Number(hhRaw);
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12.toString().padStart(2, "0")}:${mm} ${period}`;
};

const formatMoney = (value?: number) => `₹${Number(value || 0).toFixed(2)}`;

export default function AttendancePayroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRow[]>([]);
  const [shifts, setShifts] = useState<ShiftMaster[]>([]);
  const [loading, setLoading] = useState(false);

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Employee | null>(null);
  const [salarySlipMonth, setSalarySlipMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [salarySlipBonus, setSalarySlipBonus] = useState<number | "">("");
  const [salarySlipLoading, setSalarySlipLoading] = useState(false);
  const [salarySlip, setSalarySlip] = useState<SalarySlipData | null>(null);

  const [empForm, setEmpForm] = useState<EmployeeForm>({
    name: "",
    employmentType: "Full-time",
    salaryAmount: "",
    grantedHolidays: "",
  });

  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    shiftId: "",
    status: "Present",
    overtimeHours: "",
  });

  const [filterMode, setFilterMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Present" | "Absent">("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [empRes, attRes, shiftRes] = await Promise.all([
        fetch(`${BASE_URL}/api/payroll/employee`),
        fetch(`${BASE_URL}/api/payroll/attendance`),
        fetch(`${BASE_URL}/api/shifts`),
      ]);
      const [empData, attData, shiftData] = await Promise.all([
        empRes.json(),
        attRes.json(),
        shiftRes.json(),
      ]);
      setEmployees(Array.isArray(empData) ? empData : []);
      setAttendances(Array.isArray(attData) ? attData : []);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarySlip = async (employeeId: string, month: string, bonus: number | "") => {
    if (!employeeId || !month) return;
    try {
      setSalarySlipLoading(true);
      const bonusValue = Number(bonus || 0);
      const params = new URLSearchParams({
        month,
        bonus: String(Number.isFinite(bonusValue) ? bonusValue : 0),
      });
      const res = await fetch(`${BASE_URL}/api/payroll/salary-slip/${employeeId}?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setSalarySlip(null);
        alert(data?.message || "Failed to generate salary slip.");
        return;
      }
      setSalarySlip(data);
    } finally {
      setSalarySlipLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedEmployeeDetails?._id) return;
    const defaultMonth = new Date().toISOString().slice(0, 7);
    setSalarySlipMonth(defaultMonth);
    setSalarySlipBonus("");
    void fetchSalarySlip(selectedEmployeeDetails._id, defaultMonth, 0);
  }, [selectedEmployeeDetails?._id]);

  const selectedShift = useMemo(
    () => shifts.find((s) => s._id === attendanceForm.shiftId) || null,
    [attendanceForm.shiftId, shifts]
  );

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === attendanceForm.employeeId) || null,
    [attendanceForm.employeeId, employees]
  );

  const salaryPreview = useMemo(() => {
    if (!selectedEmployee || !selectedShift) {
      return {
        shiftHours: 0,
        perDaySalary: 0,
        perHourSalary: 0,
        overtimePay: 0,
        salaryEarned: 0,
      };
    }

    const shiftHours = getShiftHours(selectedShift.startTime, selectedShift.endTime);
    const perDaySalary = Number(selectedEmployee.salaryAmount || 0) / 30;
    const perHourSalary = shiftHours > 0 ? perDaySalary / shiftHours : 0;
    const overtimeHours = Number(attendanceForm.overtimeHours || 0);
    const overtimePay =
      attendanceForm.status === "Present" ? Number((overtimeHours * perHourSalary).toFixed(2)) : 0;
    const salaryEarned =
      attendanceForm.status === "Present"
        ? Number((perDaySalary + overtimePay).toFixed(2))
        : 0;

    return {
      shiftHours,
      perDaySalary,
      perHourSalary,
      overtimePay,
      salaryEarned,
    };
  }, [selectedEmployee, selectedShift, attendanceForm.overtimeHours, attendanceForm.status]);

  const openAttendanceModal = () => {
    setAttendanceForm({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      shiftId: shifts[0]?._id || "",
      status: "Present",
      overtimeHours: "",
    });
    setShowAttendanceModal(true);
  };

  const onSaveEmployee = async () => {
    const name = empForm.name.trim();
    const salaryAmount = Number(empForm.salaryAmount || 0);
    const grantedHolidays = Number(empForm.grantedHolidays || 0);

    if (!name) return alert("Please enter employee name.");
    if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
      return alert("Please enter valid monthly salary.");
    }
    if (!Number.isFinite(grantedHolidays) || grantedHolidays < 0) {
      return alert("Granted holidays must be 0 or greater.");
    }

    const payload = {
      name,
      employmentType: empForm.employmentType,
      salaryAmount,
      grantedHolidays,
    };

    const res = await fetch(`${BASE_URL}/api/payroll/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.message || "Failed to add employee");

    setEmployees((prev) => [data, ...prev]);
    setShowEmployeeModal(false);
    setEmpForm({
      name: "",
      employmentType: "Full-time",
      salaryAmount: "",
      grantedHolidays: "",
    });
  };

  const onSaveAttendance = async () => {
    if (!attendanceForm.employeeId) return alert("Please select employee.");
    if (!attendanceForm.shiftId) return alert("Please select shift.");

    const payload = {
      employeeId: attendanceForm.employeeId,
      date: attendanceForm.date,
      shiftId: attendanceForm.shiftId,
      status: attendanceForm.status,
      overtimeHours: Number(attendanceForm.overtimeHours || 0),
    };

    const res = await fetch(`${BASE_URL}/api/payroll/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.message || "Failed to save attendance");

    setAttendances((prev) => [data, ...prev]);
    if (selectedEmployeeDetails?._id === attendanceForm.employeeId) {
      void fetchSalarySlip(selectedEmployeeDetails._id, salarySlipMonth, salarySlipBonus);
    }
    setShowAttendanceModal(false);
  };

  const deleteAttendance = async (id: string) => {
    if (!window.confirm("Delete this attendance record?")) return;

    const res = await fetch(`${BASE_URL}/api/payroll/attendance/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Failed to delete attendance.");

    setAttendances((prev) => prev.filter((a) => a._id !== id));
    if (selectedEmployeeDetails?._id) {
      void fetchSalarySlip(selectedEmployeeDetails._id, salarySlipMonth, salarySlipBonus);
    }
  };

  const filteredAttendances = useMemo(() => {
    return attendances.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      if (!matchesStatus) return false;

      if (employeeFilter !== "All") {
        const id = typeof item.employeeId === "object" ? item.employeeId._id : item.employeeId;
        if (id !== employeeFilter) return false;
      }

      if (filterMode === "single" && singleDate) {
        return item.date === singleDate;
      }

      if (filterMode === "range" && startDate && endDate) {
        return item.date >= startDate && item.date <= endDate;
      }

      return true;
    });
  }, [attendances, statusFilter, employeeFilter, filterMode, singleDate, startDate, endDate]);

  const totalPresent = filteredAttendances.filter((a) => a.status === "Present").length;
  const totalOvertimeHours = filteredAttendances.reduce((sum, row) => sum + Number(row.overtimeHours || 0), 0);
  const totalPayout = filteredAttendances.reduce((sum, row) => sum + Number(row.salaryEarned || 0), 0);

  const employeeAttendanceStats = useMemo(() => {
    return employees.map((employee) => {
      const rows = attendances.filter((row) => {
        const rowEmpId = typeof row.employeeId === "object" ? row.employeeId._id : row.employeeId;
        return rowEmpId === employee._id;
      });

      const presentDays = rows.filter((row) => row.status === "Present").length;
      const absentDays = rows.filter((row) => row.status === "Absent").length;
      const overtimeHours = rows.reduce((sum, row) => sum + Number(row.overtimeHours || 0), 0);
      const totalSalary = rows.reduce((sum, row) => sum + Number(row.salaryEarned || 0), 0);

      return {
        employee,
        presentDays,
        absentDays,
        overtimeHours,
        totalSalary,
      };
    });
  }, [employees, attendances]);

  const selectedEmployeeAttendances = useMemo(() => {
    if (!selectedEmployeeDetails?._id) return [];

    return filteredAttendances
      .filter((row) => {
        const rowEmpId = typeof row.employeeId === "object" ? row.employeeId._id : row.employeeId;
        return rowEmpId === selectedEmployeeDetails._id;
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [filteredAttendances, selectedEmployeeDetails]);

  return (
    <>
      <FullScreenLoader loading={loading} />
      <div className={`${styles.page} module-page`}>
        <section className="module-hero">
          <div>
            <p className="module-hero-tag">WORKFORCE CONTROL</p>
            <h2>Attendance & Salary Console</h2>
            <p>
              Track employee presence shift-wise, auto-calculate overtime earnings, and keep payroll-ready records with
              zero manual math.
            </p>
          </div>
        </section>

        <section className="module-kpis">
          <article className="module-kpi">
            <span>Employees</span>
            <strong>{employees.length}</strong>
          </article>
          <article className="module-kpi">
            <span>Present Records</span>
            <strong>{totalPresent}</strong>
          </article>
          <article className="module-kpi">
            <span>Total Salary (Filtered)</span>
            <strong style={{ fontSize: "22px" }}>{formatMoney(totalPayout)}</strong>
          </article>
        </section>

        <section className={styles.actionRow}>
          <button className="module-btn" onClick={() => setShowEmployeeModal(true)}>
            + Add Employee
          </button>
          <button className="module-btn-success" onClick={openAttendanceModal}>
            + Add Attendance
          </button>
        </section>

        <section className={styles.filterSurface}>
          <div className={styles.filterTop}>
            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${filterMode === "single" ? styles.toggleActive : ""}`}
                onClick={() => setFilterMode("single")}
              >
                Single Date
              </button>
              <button
                className={`${styles.toggleBtn} ${filterMode === "range" ? styles.toggleActive : ""}`}
                onClick={() => setFilterMode("range")}
              >
                Date Range
              </button>
            </div>

            <button
              className={styles.clearBtn}
              onClick={() => {
                setSingleDate("");
                setStartDate("");
                setEndDate("");
                setStatusFilter("All");
                setEmployeeFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className={styles.filterGrid}>
            {filterMode === "single" ? (
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                placeholder="Select date"
              />
            ) : (
              <>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </>
            )}

            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | "Present" | "Absent")}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className={styles.filterMeta}>
            <span>Overtime Hours (Filtered): {totalOvertimeHours.toFixed(2)} hrs</span>
          </div>
        </section>

        <section className="module-surface">
          <div className={styles.tableHeadRow}>
            <h3>Employee List</h3>
            <span>{employeeAttendanceStats.length} employees</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Monthly Salary</th>
                  <th>Granted Holidays</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Overtime (Hrs)</th>
                  <th>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {employeeAttendanceStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyCell}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employeeAttendanceStats.map((row) => {
                    const empData = row.employee;

                    return (
                      <tr key={empData._id} className={styles.clickableRow} onClick={() => setSelectedEmployeeDetails(empData)}>
                        <td>{empData?.name || "Unknown"}</td>
                        <td>{empData?.employmentType || empData?.role || "-"}</td>
                        <td>{formatMoney(empData.salaryAmount)}</td>
                        <td>{Number(empData.grantedHolidays || 0)}</td>
                        <td>{row.presentDays}</td>
                        <td>{row.absentDays}</td>
                        <td>{row.overtimeHours.toFixed(2)}</td>
                        <td>{formatMoney(row.totalSalary)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showEmployeeModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowEmployeeModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>Add Employee</h3>
            <p className={styles.modalSubtext}>Create employee profile for attendance and overtime payroll mapping.</p>

            <div className={styles.formGrid}>
              <div>
                <label>Employee Name</label>
                <input
                  placeholder="e.g. Ramesh Kumar"
                  value={empForm.name}
                  onChange={(e) => setEmpForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label>Employment Type</label>
                <select
                  value={empForm.employmentType}
                  onChange={(e) =>
                    setEmpForm((p) => ({ ...p, employmentType: e.target.value as "Full-time" | "Part-time" }))
                  }
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div>
                <label>Monthly Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 18000"
                  value={empForm.salaryAmount}
                  onChange={(e) =>
                    setEmpForm((p) => ({ ...p, salaryAmount: e.target.value === "" ? "" : Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <label>Granted Holidays (Days)</label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={empForm.grantedHolidays}
                  onChange={(e) =>
                    setEmpForm((p) => ({ ...p, grantedHolidays: e.target.value === "" ? "" : Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="module-btn-success" onClick={onSaveEmployee}>
                Save Employee
              </button>
              <button className="module-btn-secondary" onClick={() => setShowEmployeeModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAttendanceModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>Add Attendance</h3>
            <p className={styles.modalSubtext}>
              Date auto-fills today. Shift timing is auto-used for attendance and overtime salary calculation.
            </p>

            <div className={styles.formGrid}>
              <div>
                <label>Employee</label>
                <select
                  value={attendanceForm.employeeId}
                  onChange={(e) => setAttendanceForm((p) => ({ ...p, employeeId: e.target.value }))}
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} ({e.employmentType || e.role || "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Date (Auto)</label>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>

              <div>
                <label>Shift</label>
                <select
                  value={attendanceForm.shiftId}
                  onChange={(e) => setAttendanceForm((p) => ({ ...p, shiftId: e.target.value }))}
                >
                  <option value="">Select shift</option>
                  {shifts.map((shift) => (
                    <option key={shift._id} value={shift._id}>
                      {shift.shiftName} ({format12h(shift.startTime)} - {format12h(shift.endTime)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Shift Timing (Auto)</label>
                <input
                  readOnly
                  placeholder="Auto from shift"
                  value={
                    selectedShift
                      ? `${format12h(selectedShift.startTime)} - ${format12h(selectedShift.endTime)}`
                      : ""
                  }
                />
              </div>

              <div>
                <label>Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm((p) => ({ ...p, status: e.target.value as "Present" | "Absent" }))}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label>Overtime Hours</label>
                <input
                  type="number"
                  placeholder="e.g. 1.5"
                  value={attendanceForm.overtimeHours}
                  onChange={(e) =>
                    setAttendanceForm((p) => ({
                      ...p,
                      overtimeHours: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className={styles.salaryPreview}>
              <h4>Salary Preview</h4>
              <div className={styles.previewGrid}>
                <div>
                  <span>Per Day Salary</span>
                  <strong>{formatMoney(salaryPreview.perDaySalary)}</strong>
                </div>
                <div>
                  <span>Shift Hours</span>
                  <strong>{salaryPreview.shiftHours.toFixed(2)} hrs</strong>
                </div>
                <div>
                  <span>Per Hour Salary</span>
                  <strong>{formatMoney(salaryPreview.perHourSalary)}</strong>
                </div>
                <div>
                  <span>Overtime Pay</span>
                  <strong>{formatMoney(salaryPreview.overtimePay)}</strong>
                </div>
              </div>
              <p className={styles.previewTotal}>Estimated Total for this entry: {formatMoney(salaryPreview.salaryEarned)}</p>
            </div>

            <div className={styles.modalActions}>
              <button className="module-btn-success" onClick={onSaveAttendance}>
                Save Attendance
              </button>
              <button className="module-btn-secondary" onClick={() => setShowAttendanceModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEmployeeDetails && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedEmployeeDetails(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEmployeeDetails.name}</h3>
            <p className={styles.modalSubtext}>
              {selectedEmployeeDetails.employmentType || selectedEmployeeDetails.role} • Monthly Salary{" "}
              {formatMoney(selectedEmployeeDetails.salaryAmount)} • Granted Holidays{" "}
              {Number(selectedEmployeeDetails.grantedHolidays || 0)} days
            </p>

            <div className={styles.salaryPreview}>
              <h4>Attendance Snapshot</h4>
              <div className={styles.previewGrid}>
                <div>
                  <span>Records</span>
                  <strong>{selectedEmployeeAttendances.length}</strong>
                </div>
                <div>
                  <span>Present</span>
                  <strong>{selectedEmployeeAttendances.filter((row) => row.status === "Present").length}</strong>
                </div>
                <div>
                  <span>Total Overtime</span>
                  <strong>
                    {selectedEmployeeAttendances
                      .reduce((sum, row) => sum + Number(row.overtimeHours || 0), 0)
                      .toFixed(2)}{" "}
                    hrs
                  </strong>
                </div>
                <div>
                  <span>Total Salary</span>
                  <strong>
                    {formatMoney(
                      selectedEmployeeAttendances.reduce((sum, row) => sum + Number(row.salaryEarned || 0), 0)
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className={styles.salarySlipSurface}>
              <div className={styles.salarySlipHead}>
                <h4>Salary Slip</h4>
                <p>
                  Leave logic: absent days are paid only up to granted holidays, then salary is deducted automatically.
                </p>
              </div>

              <div className={styles.salarySlipControls}>
                <div>
                  <label>Salary Month</label>
                  <input
                    type="month"
                    value={salarySlipMonth}
                    onChange={(e) => setSalarySlipMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label>Bonus (Manual)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={salarySlipBonus}
                    onChange={(e) => setSalarySlipBonus(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className={styles.salarySlipBtnWrap}>
                  <button
                    className="module-btn-success"
                    onClick={() => {
                      if (!selectedEmployeeDetails?._id) return;
                      void fetchSalarySlip(selectedEmployeeDetails._id, salarySlipMonth, salarySlipBonus);
                    }}
                    disabled={salarySlipLoading}
                  >
                    {salarySlipLoading ? "Generating..." : "Generate Slip"}
                  </button>
                </div>
              </div>

              {salarySlip ? (
                <div className={styles.salarySlipGrid}>
                  <article>
                    <span>Monthly Salary</span>
                    <strong>{formatMoney(salarySlip.monthlySalary)}</strong>
                  </article>
                  <article>
                    <span>Per Day Salary</span>
                    <strong>{formatMoney(salarySlip.perDaySalary)}</strong>
                  </article>
                  <article>
                    <span>Present / Absent</span>
                    <strong>
                      {salarySlip.attendance.presentDays} / {salarySlip.attendance.absentDays}
                    </strong>
                  </article>
                  <article>
                    <span>Paid Leaves Used</span>
                    <strong>
                      {salarySlip.attendance.paidLeaveDays} / {salarySlip.grantedHolidays}
                    </strong>
                  </article>
                  <article>
                    <span>Unpaid Leaves</span>
                    <strong>{salarySlip.attendance.unpaidLeaveDays}</strong>
                  </article>
                  <article>
                    <span>Overtime</span>
                    <strong>
                      {salarySlip.overtime.hours.toFixed(2)} hrs ({formatMoney(salarySlip.overtime.pay)})
                    </strong>
                  </article>
                  <article>
                    <span>Bonus</span>
                    <strong>{formatMoney(salarySlip.bonus)}</strong>
                  </article>
                  <article>
                    <span>Final Payable</span>
                    <strong>{formatMoney(salarySlip.salaryBreakup.totalPayable)}</strong>
                  </article>
                </div>
              ) : null}
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>OT Hrs</th>
                    <th>OT Pay</th>
                    <th>Salary</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployeeAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyCell}>
                        No attendance records for selected filters.
                      </td>
                    </tr>
                  ) : (
                    selectedEmployeeAttendances.map((row) => (
                      <tr key={row._id}>
                        <td>{row.date}</td>
                        <td>
                          <div className={styles.shiftLabel}>{row.shift || row.shiftInfo?.shiftName || "-"}</div>
                          <div className={styles.shiftTimeLabel}>
                            {format12h(row.shiftStartTime || row.shiftInfo?.startTime || "")} -{" "}
                            {format12h(row.shiftEndTime || row.shiftInfo?.endTime || "")}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusChip} ${
                              row.status === "Present" ? styles.statusPresent : styles.statusAbsent
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>{Number(row.overtimeHours || 0).toFixed(2)}</td>
                        <td>{formatMoney(row.overtimePay)}</td>
                        <td>{formatMoney(row.salaryEarned)}</td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => {
                              if (!row._id) return;
                              void deleteAttendance(row._id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.modalActions}>
              <button className="module-btn-secondary" onClick={() => setSelectedEmployeeDetails(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
