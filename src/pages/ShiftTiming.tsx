import React, { useState, useEffect } from "react";
import axios from "axios";

type Shift = {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://yourbackend.com/api");

function ShiftTiming() {
  const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    const res = await axios.get(`${BASE_URL}/shifts`);
    setShifts(res.data);
  };

  const addShift = async () => {
    if (!shiftName || !startTime || !endTime) return alert("Fill all fields");

    await axios.post(`${BASE_URL}/shifts`, { shiftName, startTime, endTime });

    setShiftName("");
    setStartTime("");
    setEndTime("");
    fetchShifts();
  };

  const deleteShift = async (id: string) => {
    await axios.delete(`${BASE_URL}/shifts/${id}`);
    fetchShifts();
  };

  const saveEdit = async () => {
    if (!editingShift) return;

    await axios.put(`${BASE_URL}/shifts/${editingShift._id}`, editingShift);
    setEditingShift(null);
    fetchShifts();
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Shift Timing Management
      </h2>

      {/* ADD SHIFT FORM */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Shift Name"
          value={shiftName}
          onChange={(e) => setShiftName(e.target.value)}
          style={inputBox}
        />

        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={inputBox}
        />

        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={inputBox}
        />

        <button style={addBtn} onClick={addShift}>
          Add Shift
        </button>
      </div>

      {/* TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thtd}>Shift Name</th>
            <th style={thtd}>Start</th>
            <th style={thtd}>End</th>
            <th style={thtd}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={s._id}>
              <td style={thtd}>{s.shiftName}</td>
              <td style={thtd}>{s.startTime}</td>
              <td style={thtd}>{s.endTime}</td>
              <td style={thtd}>
                <button style={editBtn} onClick={() => setEditingShift(s)}>
                  Edit
                </button>
                <button
                  style={deleteBtn}
                  onClick={() => deleteShift(s._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {editingShift && (
        <div style={modalBg}>
          <div style={modalBox}>
            <h3>Edit Shift</h3>

            <input
              type="text"
              value={editingShift.shiftName}
              onChange={(e) =>
                setEditingShift({
                  ...editingShift,
                  shiftName: e.target.value,
                })
              }
              style={inputBox}
            />

            <input
              type="time"
              value={editingShift.startTime}
              onChange={(e) =>
                setEditingShift({
                  ...editingShift,
                  startTime: e.target.value,
                })
              }
              style={inputBox}
            />

            <input
              type="time"
              value={editingShift.endTime}
              onChange={(e) =>
                setEditingShift({
                  ...editingShift,
                  endTime: e.target.value,
                })
              }
              style={inputBox}
            />

            <button style={addBtn} onClick={saveEdit}>
              Save
            </button>
            <button
              style={closeBtn}
              onClick={() => setEditingShift(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftTiming;

// -----------------------
// INTERNAL STYLE OBJECTS
// -----------------------

const inputBox: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const addBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "#0b8fed",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const editBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#ffaa00",
  border: "none",
  color: "#000",
  borderRadius: "4px",
  marginRight: "5px",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "red",
  border: "none",
  color: "white",
  borderRadius: "4px",
  cursor: "pointer",
};

const closeBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "gray",
  color: "white",
  border: "none",
  borderRadius: "4px",
  marginLeft: "10px",
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const thtd: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const modalBg: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox: React.CSSProperties = {
  background: "white",
  padding: "20px",
  width: "350px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
