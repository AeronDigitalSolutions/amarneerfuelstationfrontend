// TestFuel.tsx
import FullScreenLoader from "../component/FullScreenLoader";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../style/testfuel.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
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
  density?: number;
  startTime?: string | Date; // kept for compatibility with shift inference
  createdAt?: string | Date;
  shiftName?: string | null;
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

  const [density, setDensity] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toLocalDateKey = (input: string | Date) => {
    const d = new Date(input);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

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
     finally {
      setLoading(false); // hide loader when complete
    }
  };

  const handleMachineChange = (id: string) => {
    setSelectedMachine(id);
    const machine = machines.find((m) => m._id === id);
    if (machine) setNozzleOptions(machine.nozzles);
    else setNozzleOptions([]);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const saveTest = async () => {
    if (!selectedMachine || !selectedNozzle || liters === "") {
      alert("Fill all fields before saving test");
      return;
    }
    if (Number(liters) <= 0) {
      alert("Liters must be greater than 0");
      return;
    }
    if (!density || Number(density) <= 0) {
      alert("Density must be greater than 0");
      return;
    }

    const registeredAt = new Date();
    const nozzle = nozzleOptions.find(n => n.nozzleNo === Number(selectedNozzle));

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/fueltest`, {
        machineId: selectedMachine,
        nozzleNo: Number(selectedNozzle),
        fuelType: nozzle?.fuelType || "",
        liters: Number(liters),
        density: Number(density),
        startTime: registeredAt.toISOString(),
      });

      alert("Fuel Test Saved!");

      // reset modal
      setSelectedNozzle("");
      setLiters("");
      setDensity("");
      setShowModal(false);

      loadTests();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      closeModal();
    }
  };

  const testsToday = useMemo(() => {
    const today = toLocalDateKey(new Date());
    return tests.filter((t) => {
      const marker = t.createdAt || t.startTime;
      if (!marker) return false;
      return toLocalDateKey(marker) === today;
    });
  }, [tests]);

  const todayLitres = useMemo(
    () => testsToday.reduce((sum, t) => sum + Number(t.liters || 0), 0),
    [testsToday]
  );

  const todayMachines = useMemo(
    () => new Set(testsToday.map((t) => t.machineId).filter(Boolean)).size,
    [testsToday]
  );

  return (
    <>
     <FullScreenLoader loading={loading} />
    <div className={styles.container}>
      <div className={styles.pageWrap}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>QUALITY CONTROL</p>
            <h2>Fuel Test Command Center</h2>
            <p className={styles.heroSub}>
              Record nozzle test liters and keep shift-wise sale entry automatically adjusted.
            </p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
            + New Fuel Test
          </button>
        </div>

        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span>Tests Today</span>
            <strong>{testsToday.length}</strong>
          </div>
          <div className={styles.kpiCard}>
            <span>Test Liters Today</span>
            <strong>{todayLitres.toFixed(2)} L</strong>
          </div>
          <div className={styles.kpiCard}>
            <span>Machines Covered</span>
            <strong>{todayMachines}</strong>
          </div>
        </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h3>Recent Fuel Tests</h3>
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
                  <th>Shift</th>
                  <th>Density</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td>{t.machineNo} - {t.machineName}</td>
                    <td>Nozzle {t.nozzleNo}</td>
                    <td>{t.fuelType}</td>
                    <td>{Number(t.liters || 0).toFixed(2)}</td>
                    <td>
                      <span className={styles.shiftBadge}>{t.shiftName || "Unmapped"}</span>
                    </td>
                    <td>{t.density == null ? "-" : Number(t.density).toFixed(3)}</td>
                    <td>{t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tests.length === 0 && (
          <div className={styles.emptyState}>
            <h4>No fuel tests recorded yet</h4>
            <p>Start with your first test. Sale Entry will auto-consider these liters shift-wise.</p>
          </div>
        )}
      </div>
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>✖</button>

            <h2>Fuel Test Session</h2>

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

            <label className={styles.testth}>Liters</label>
            <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />

            <label className={styles.testth}>Density</label>
            <input type="number" step="0.001" value={density} onChange={(e) => setDensity(e.target.value)} />

            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={saveTest} disabled={loading}>
                {loading ? "Saving..." : "Save Test"}
              </button>

              <button className={styles.secondaryBtn} onClick={closeModal}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    </>
  );
}
