// TestFuel.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../style/testfuel.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Pump = { _id: string; pumpNo: string; pumpName: string; fuels: { type: string }[]; };
type FuelTest = { _id?: string; pumpId?: string; pumpNo?: string; pumpName?: string; fuelType: string; liters: number; startTime?: string | Date; stopTime?: string | Date; duration?: number; };

export default function TestFuel() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [fuelOptions, setFuelOptions] = useState<string[]>([]);
  const [selectedPump, setSelectedPump] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [liters, setLiters] = useState("");
  const [tests, setTests] = useState<FuelTest[]>([]);

  // timer & modal
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/pumps`).then((res) => setPumps(res.data)).catch(()=>{});
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fueltest`);
      setTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePumpChange = (pumpId: string) => {
    setSelectedPump(pumpId);
    const pump = pumps.find((p) => p._id === pumpId);
    if (pump) setFuelOptions(pump.fuels.map((f) => f.type));
    else setFuelOptions([]);
  };

  const startTest = () => {
    if (!selectedPump || !selectedFuel || liters === "") {
      alert("Fill all fields before starting test");
      return;
    }
    const now = new Date();
    setStartTime(now);
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed((prev) => prev + 1), 1000);
  };

  const stopTest = async () => {
    if (!startTime) {
      alert("Start test first!");
      return;
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    const stopTime = new Date();
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/fueltest`, {
        pumpId: selectedPump,
        fuelType: selectedFuel,
        liters: Number(liters),
        startTime: startTime.toISOString(),
        stopTime: stopTime.toISOString(),
        duration: elapsed,
      });
      alert("Fuel Test Saved!");
      setSelectedFuel(""); setLiters(""); setStartTime(null); setElapsed(0);
      setShowModal(false);
      loadTests();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      // if running timer, prevent accidental close
      if (startTime) {
        if (!confirm("Test is running. Stop & close?")) return;
        if (timerRef.current) window.clearInterval(timerRef.current);
        setStartTime(null);
        setElapsed(0);
      }
      setShowModal(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>⛽ Fuel Test Entry</h2>
          <div>
            <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>➕ New Test</button>
          </div>
        </div>

        {tests.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pump</th><th>Fuel</th><th>Liters</th><th>Start</th><th>Stop</th><th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td>{t.pumpNo} - {t.pumpName}</td>
                    <td>{t.fuelType}</td>
                    <td>{t.liters}</td>
                    <td>{t.startTime ? new Date(t.startTime).toLocaleTimeString() : "-"}</td>
                    <td>{t.stopTime ? new Date(t.stopTime).toLocaleTimeString() : "-"}</td>
                    <td>{t.duration ? formatTime(t.duration) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✖</button>
            <h2>Fuel Test</h2>

            <label>Pump</label>
            <select value={selectedPump} onChange={(e) => handlePumpChange(e.target.value)}>
              <option value="">Select Pump</option>
              {pumps.map((p) => (<option key={p._id} value={p._id}>{p.pumpNo} - {p.pumpName}</option>))}
            </select>

            <label>Fuel Type</label>
            <select value={selectedFuel} onChange={(e) => setSelectedFuel(e.target.value)}>
              <option value="">Select Fuel</option>
              {fuelOptions.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>

            <label>Liters</label>
            <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />

            {startTime && <div className={styles.timer}>⏱ {formatTime(elapsed)}</div>}

            <div className={styles.modalButtons}>
              {!startTime ? (
                <button className={styles.saveBtn} onClick={startTest}>▶ Start Test</button>
              ) : (
                <button className={styles.cancelBtn} onClick={stopTest} disabled={loading}>{loading ? "Saving..." : "⏹ Stop & Save"}</button>
              )}

              <button className={styles.secondaryBtn} onClick={() => {
                if (startTime) { if (!confirm("Test running — stop & close?")) return; }
                if (timerRef.current) window.clearInterval(timerRef.current);
                setStartTime(null); setElapsed(0); setShowModal(false);
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
