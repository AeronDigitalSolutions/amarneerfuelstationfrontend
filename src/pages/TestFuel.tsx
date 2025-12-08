import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../style/testfuel.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Machine = {
  _id: string;
  machineNo: string;
  machineName: string;
  nozzles: { nozzleNo: number; fuelType: string }[];
};

type FuelTest = {
  _id?: string;
  machineId?: string;
  machineNo?: string;
  machineName?: string;
  nozzleNo?: number;
  fuelType: string;
  liters: number;
  startTime?: string | Date;
  stopTime?: string | Date;
  duration?: number;
};

export default function TestFuel() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [tests, setTests] = useState<FuelTest[]>([]);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedNozzle, setSelectedNozzle] = useState("");
  const [liters, setLiters] = useState("");

  const [nozzleOptions, setNozzleOptions] = useState<
    { nozzleNo: number; fuelType: string }[]
  >([]);

  // timer & modal
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/machines`)
      .then(res => setMachines(res.data))
      .catch(() => {});

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

  const handleMachineChange = (id: string) => {
    setSelectedMachine(id);
    const machine = machines.find((m) => m._id === id);
    if (machine) setNozzleOptions(machine.nozzles);
    else setNozzleOptions([]);
  };

  const startTest = () => {
    if (!selectedMachine || !selectedNozzle || liters === "") {
      alert("Fill all fields before starting test");
      return;
    }
    const now = new Date();
    setStartTime(now);
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed((prev) => prev + 1), 1000);
  };

  const stopTest = async () => {
    if (!startTime) return alert("Start test first");

    if (timerRef.current) window.clearInterval(timerRef.current);

    const stopTime = new Date();
    const nozzle = nozzleOptions.find(n => n.nozzleNo === Number(selectedNozzle));

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/fueltest`, {
        machineId: selectedMachine,
        nozzleNo: Number(selectedNozzle),
        fuelType: nozzle?.fuelType || "",
        liters: Number(liters),
        startTime: startTime.toISOString(),
        stopTime: stopTime.toISOString(),
        duration: elapsed,
      });

      alert("Fuel Test Saved!");

      // reset modal
      setSelectedNozzle("");
      setLiters("");
      setStartTime(null);
      setElapsed(0);
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
          <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
            ➕ New Test
          </button>
        </div>

        {tests.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Nozzle</th>
                  <th>Fuel</th>
                  <th>Liters</th>
                  <th>Start</th>
                  <th>Stop</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td>{t.machineNo} - {t.machineName}</td>
                    <td>Nozzle {t.nozzleNo}</td>
                    <td>{t.fuelType}</td>
                    <td>{t.liters}</td>
                    <td>{t.startTime ? new Date(t.startTime).toLocaleTimeString() : "-"}</td>
                    <td>{t.stopTime ? new Date(t.stopTime).toLocaleTimeString() : "-"}</td>
                    <td>{formatTime(t.duration || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✖</button>

            <h2>Fuel Test</h2>

            <label>Machine</label>
            <select value={selectedMachine} onChange={(e) => handleMachineChange(e.target.value)}>
              <option value="">Select Machine</option>
              {machines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.machineNo} - {m.machineName}
                </option>
              ))}
            </select>

            <label>Nozzle</label>
            <select value={selectedNozzle} onChange={(e) => setSelectedNozzle(e.target.value)}>
              <option value="">Select Nozzle</option>
              {nozzleOptions.map((n) => (
                <option key={n.nozzleNo} value={n.nozzleNo}>
                  Nozzle {n.nozzleNo} ({n.fuelType})
                </option>
              ))}
            </select>

            <label>Liters</label>
            <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />

            {startTime && <div className={styles.timer}>⏱ {formatTime(elapsed)}</div>}

            <div className={styles.modalButtons}>
              {!startTime ? (
                <button className={styles.saveBtn} onClick={startTest}>
                  ▶ Start Test
                </button>
              ) : (
                <button className={styles.cancelBtn} onClick={stopTest} disabled={loading}>
                  {loading ? "Saving..." : "⏹ Stop & Save"}
                </button>
              )}

              <button className={styles.secondaryBtn} onClick={() => {
                if (startTime) {
                  if (!confirm("Test running — stop & close?")) return;
                }
                if (timerRef.current) window.clearInterval(timerRef.current);
                setStartTime(null);
                setElapsed(0);
                setShowModal(false);
              }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
