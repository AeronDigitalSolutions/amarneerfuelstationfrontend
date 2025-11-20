// ShiftTiming.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/shifttiming.module.css";

type Shift = {
  _id?: string;
  shiftName: string;
  startTime: string;
  endTime: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

export default function ShiftTiming() {
  const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/shifts`);
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addShift = async () => {
    if (!shiftName || !startTime || !endTime) return alert("Fill all fields");
    try {
      await axios.post(`${BASE_URL}/shifts`, { shiftName, startTime, endTime });
      setShiftName(""); setStartTime(""); setEndTime("");
      fetchShifts();
      setShowAddModal(false);
    } catch (err) { console.error(err); alert("Failed to add"); }
  };

  const deleteShift = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete shift?")) return;
    try {
      await axios.delete(`${BASE_URL}/shifts/${id}`);
      fetchShifts();
    } catch (err) { console.error(err); alert("Failed to delete"); }
  };

  const openEdit = (s: Shift) => {
    setEditingShift(s);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingShift?._id) return;
    try {
      await axios.put(`${BASE_URL}/shifts/${editingShift._id}`, editingShift);
      setEditingShift(null);
      fetchShifts();
      setShowEditModal(false);
    } catch (err) { console.error(err); alert("Failed to save"); }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingShift(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Shift Timing Management</h2>
          <div>
            <button className={styles.primaryBtn} onClick={() => setShowAddModal(true)}>➕ Add Shift</button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s._id}>
                <td>{s.shiftName}</td>
                <td>{s.startTime}</td>
                <td>{s.endTime}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEdit(s)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => deleteShift(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD SHIFT MODAL */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>✖</button>
            <h2>Add Shift</h2>

            <label>Shift Name</label>
            <input value={shiftName} onChange={(e) => setShiftName(e.target.value)} />

            <label>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={addShift}>Add Shift</button>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SHIFT MODAL */}
      {showEditModal && editingShift && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => { setShowEditModal(false); setEditingShift(null); }}>✖</button>
            <h2>Edit Shift</h2>

            <label>Shift Name</label>
            <input value={editingShift.shiftName} onChange={(e) => setEditingShift({ ...editingShift, shiftName: e.target.value })} />

            <label>Start Time</label>
            <input type="time" value={editingShift.startTime} onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })} />

            <label>End Time</label>
            <input type="time" value={editingShift.endTime} onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })} />

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={saveEdit}>Save</button>
              <button className={styles.cancelBtn} onClick={() => { setShowEditModal(false); setEditingShift(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
