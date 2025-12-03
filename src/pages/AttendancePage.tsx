import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/attendancepage.module.css";

export default function AttendancePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Attendant";

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("Fetching location...");
  const [attendanceMsg, setAttendanceMsg] = useState("");
  const [shift, setShift] = useState("");

  // ----------------------------------------
  // 🚀 Detect SHIFT Automatically
  // ----------------------------------------
  const detectShift = () => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 14) setShift("Shift A (6 AM – 2 PM)");
    else if (hour >= 14 && hour < 22) setShift("Shift B (2 PM – 10 PM)");
    else setShift("Shift C (10 PM – 6 AM)");
  };

  // ----------------------------------------
  // 🚀 Fetch GPS Location
  // ----------------------------------------
  useEffect(() => {
    detectShift();

    if (!navigator.geolocation) {
      setLocationStatus("Location not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationStatus("You are nearby Petrol Pump");
      },
      () => setLocationStatus("Please enable GPS to detect location.")
    );
  }, []);

  // ----------------------------------------
  // 🚀 Mark Attendance
  // ----------------------------------------
  const markAttendance = () => {
    setAttendanceMsg(
      "Thank you! Your attendance has been marked. Waiting for approval."
    );
  };

  // ----------------------------------------
  // 🚀 LOGOUT
  // ----------------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    navigate("/attendant-login");  // ✅ Redirect here now
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* TOP BAR */}
        <div className={styles.topRow}>
          <h2 className={styles.welcome}>👋 Welcome <span>{username}</span></h2>
          <button className={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>

        {/* SHIFT DETAILS */}
        <p className={styles.shift}>
          🕒 Current Shift: <strong>{shift}</strong>
        </p>

        {/* LOCATION */}
        <p className={styles.location}>
          📍 {locationStatus}
          {coords && (
            <span className={styles.coords}>
              (Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)})
            </span>
          )}
        </p>

        {/* MAP PREVIEW */}
        {coords && (
          <iframe
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
          ></iframe>
        )}

        {/* MARK ATTENDANCE */}
        <button className={styles.attendanceBtn} onClick={markAttendance}>
          Mark Your Attendance
        </button>

        {attendanceMsg && <p className={styles.successMsg}>{attendanceMsg}</p>}
      </div>
    </div>
  );
}
