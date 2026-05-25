import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import FullScreenLoader from "../component/FullScreenLoader";
import styles from "../style/shifttiming.module.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";

type Shift = {
  _id?: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  durationHours?: number;
  overnight?: boolean;
  shiftType?: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const toMinutes = (value: string): number => {
  const [hh, mm] = (value || "00:00").split(":").map(Number);
  return hh * 60 + mm;
};

const formatTo12h = (value: string): string => {
  if (!value) return "--:--";
  const [hhRaw, mm] = value.split(":");
  const hh = Number(hhRaw);
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12.toString().padStart(2, "0")}:${mm} ${period}`;
};

const buildShiftPreview = (shiftName: string, startTime: string, endTime: string) => {
  if (!shiftName || !startTime || !endTime) return "Enter shift details to preview.";
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const duration = end === start ? 24 * 60 : end > start ? end - start : 24 * 60 - start + end;
  const overnight = end <= start;
  return `${shiftName}: ${formatTo12h(startTime)} - ${formatTo12h(endTime)} (${(duration / 60).toFixed(
    1
  )} hrs${overnight ? ", Overnight" : ""})`;
};

const defaultShiftTemplates: Array<Pick<Shift, "shiftName" | "startTime" | "endTime">> = [
  { shiftName: "Morning", startTime: "06:00", endTime: "14:00" },
  { shiftName: "Evening", startTime: "14:00", endTime: "22:00" },
  { shiftName: "Night", startTime: "22:00", endTime: "06:00" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const getParts = (time: string) => {
  const [h = "00", m = "00"] = (time || "00:00").split(":");
  return { hour: h.padStart(2, "0"), minute: m.padStart(2, "0") };
};

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const { hour, minute } = getParts(value);

  return (
    <div className={styles.timeField}>
      <label>{label}</label>
      <div className={styles.timePicker}>
        <FaRegClock className={styles.timeIcon} />
        <select value={hour} onChange={(e) => onChange(`${e.target.value}:${minute}`)} className={styles.timeSelect}>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className={styles.timeSep}>:</span>
        <select value={minute} onChange={(e) => onChange(`${hour}:${e.target.value}`)} className={styles.timeSelect}>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className={styles.timeHint}>{formatTo12h(`${hour}:${minute}`)}</span>
      </div>
    </div>
  );
}

export default function ShiftTiming() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("14:00");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/shifts`);
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to load shifts right now.");
    } finally {
      setLoading(false);
    }
  };

  const addShift = async () => {
    if (!shiftName.trim() || !startTime || !endTime) {
      alert("Please fill shift name, start time, and end time.");
      return;
    }
    try {
      setSaving(true);
      setErrorMsg("");
      await axios.post(`${BASE_URL}/shifts`, {
        shiftName: shiftName.trim(),
        startTime,
        endTime,
      });
      setShiftName("");
      setStartTime("06:00");
      setEndTime("14:00");
      setShowAddModal(false);
      await fetchShifts();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to add shift");
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete shift?")) return;
    try {
      setSaving(true);
      await axios.delete(`${BASE_URL}/shifts/${id}`);
      await fetchShifts();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete shift");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (shift: Shift) => {
    setEditingShift({ ...shift });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingShift?._id) return;
    if (!editingShift.shiftName.trim() || !editingShift.startTime || !editingShift.endTime) {
      alert("Please fill shift name, start time, and end time.");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${BASE_URL}/shifts/${editingShift._id}`, {
        shiftName: editingShift.shiftName.trim(),
        startTime: editingShift.startTime,
        endTime: editingShift.endTime,
      });
      setEditingShift(null);
      setShowEditModal(false);
      await fetchShifts();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save shift");
    } finally {
      setSaving(false);
    }
  };

  const createDefaultShifts = async () => {
    if (!confirm("Create default Morning/Evening/Night shifts?")) return;
    try {
      setSaving(true);
      for (const shift of defaultShiftTemplates) {
        try {
          await axios.post(`${BASE_URL}/shifts`, shift);
        } catch {
          // skip duplicates/overlaps; backend handles constraints
        }
      }
      await fetchShifts();
    } finally {
      setSaving(false);
    }
  };

  const openAddShiftModal = () => {
    setShiftName("");
    setStartTime("06:00");
    setEndTime("14:00");
    setShowAddModal(true);
  };

  const totalCoverageHours = useMemo(
    () => shifts.reduce((sum, shift) => sum + Number(shift.durationHours || 0), 0),
    [shifts]
  );
  const overnightCount = shifts.filter((shift) => shift.overnight).length;

  return (
    <>
      <FullScreenLoader loading={loading || saving} />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h2>Shift Timing Management</h2>
          <p>Shift names become reusable master data for attendance and all shift-based modules.</p>
        </div>

        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span>Total Shifts</span>
            <strong>{shifts.length}</strong>
          </div>
          <div className={styles.kpiCard}>
            <span>Total Coverage</span>
            <strong>{totalCoverageHours.toFixed(1)} hrs</strong>
          </div>
          <div className={styles.kpiCard}>
            <span>Overnight</span>
            <strong>{overnightCount}</strong>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button className={styles.primaryBtn} onClick={openAddShiftModal}>
            + Add Shift
          </button>
          <button className={styles.secondaryBtn} onClick={createDefaultShifts}>
            Use Default Templates
          </button>
        </div>

        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

        <div className={styles.card}>
          {shifts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No shifts configured yet</h3>
              <p>
                Create your first shift. Once added, these shift names and time ranges will be used automatically in
                Attendance and other modules.
              </p>
              <button className={styles.primaryBtn} onClick={openAddShiftModal}>
                Create First Shift
              </button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift._id}>
                    <td className={styles.shiftNameCell}>{shift.shiftName}</td>
                    <td>{formatTo12h(shift.startTime)}</td>
                    <td>{formatTo12h(shift.endTime)}</td>
                    <td>{Number(shift.durationHours || 0).toFixed(1)} hrs</td>
                    <td>
                      <span className={`${styles.badge} ${shift.overnight ? styles.badgeNight : styles.badgeDay}`}>
                        {shift.shiftType || (shift.overnight ? "Night" : "Day")}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button className={styles.editBtn} onClick={() => openEdit(shift)} aria-label="Edit shift">
                        <MdEdit />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => deleteShift(shift._id)} aria-label="Delete shift">
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <h3>Add Shift</h3>

            <label>Shift Name</label>
            <input value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="e.g. Morning" />

            <TimeSelect label="Start Time" value={startTime || "06:00"} onChange={setStartTime} />

            <TimeSelect label="End Time" value={endTime || "14:00"} onChange={setEndTime} />

            <p className={styles.previewText}>{buildShiftPreview(shiftName, startTime, endTime)}</p>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={addShift}>
                Add Shift
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingShift && (
        <div
          className={styles.modalBackdrop}
          onClick={() => {
            setShowEditModal(false);
            setEditingShift(null);
          }}
        >
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Shift</h3>

            <label>Shift Name</label>
            <input
              value={editingShift.shiftName}
              onChange={(e) => setEditingShift({ ...editingShift, shiftName: e.target.value })}
            />

            <TimeSelect
              label="Start Time"
              value={editingShift.startTime || "06:00"}
              onChange={(next) => setEditingShift({ ...editingShift, startTime: next })}
            />

            <TimeSelect
              label="End Time"
              value={editingShift.endTime || "14:00"}
              onChange={(next) => setEditingShift({ ...editingShift, endTime: next })}
            />

            <p className={styles.previewText}>
              {buildShiftPreview(editingShift.shiftName, editingShift.startTime, editingShift.endTime)}
            </p>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={saveEdit}>
                Save Changes
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingShift(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
