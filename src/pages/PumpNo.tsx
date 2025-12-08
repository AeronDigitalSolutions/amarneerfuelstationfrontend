// PumpNo.tsx
import FullScreenLoader from "../component/FullScreenLoader";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/pumpno.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Pump = {
  _id?: string;
  pumpNo: string;
  pumpName: string;
  fuels: { type: string }[];
};

export default function PumpNo() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [newPump, setNewPump] = useState<Pump>({
    pumpNo: "",
    pumpName: "",
    fuels: [],
  });

  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPumps();
  }, []);

  const fetchPumps = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pumps`);
      setPumps(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch pumps:", err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPump((prev) => ({ ...prev, [name]: value }));
  };

  const handleFuelToggle = (fuel: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  const savePump = async () => {
    if (!newPump.pumpNo || !newPump.pumpName || selectedFuels.length === 0) {
      alert("⚠️ Please fill Pump No, Pump Name & select at least one fuel type");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        pumpNo: newPump.pumpNo,
        pumpName: newPump.pumpName,
        fuels: selectedFuels.map((f) => ({ type: f })),
      };
      await axios.post(`${BASE_URL}/pumps`, payload);
      alert("✅ Pump added successfully!");
      setNewPump({ pumpNo: "", pumpName: "", fuels: [] });
      setSelectedFuels([]);
      await fetchPumps();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Error saving pump:", err);
      alert("Failed to save pump.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setShowModal(false);
    }
  };

  return (
    <>
    <FullScreenLoader loading={loading} />
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2> Pump Management</h2>
          <div>
            <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
              Add Pump ➕ 
            </button>
          </div>
        </div>

        <div className={styles.listSection}>
          {pumps.length === 0 ? (
            <p className={styles.noData}>No pumps yet. Add one.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.pumpth}>Pump No</th>
                  <th className={styles.pumpth}>Pump Name</th>
                  <th className={styles.pumpth}>Fuel Types</th>
                </tr>
              </thead>
              <tbody>
                {pumps.map((p, i) => (
                  <tr key={p._id || i}>
                    <td className={styles.pumptd}>{p.pumpNo}</td>
                    <td className={styles.pumptd}>{p.pumpName}</td>
                    <td className={styles.pumptd}>{p.fuels?.map((f) => f.type).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✖</button>

            <h2>Add Pump</h2>
<div className={styles.pump_grid}>
  <div className={styles.number}>
            <label className={styles.pumptd}>Pump Number</label>
            <input name="pumpNo" value={newPump.pumpNo} onChange={handleChange} />
</div>
<div className={styles.number}>
            <label className={styles.pumptd}>Pump Name</label>
            <input name="pumpName" value={newPump.pumpName} onChange={handleChange} />
            </div>
</div>
            <label className={styles.pumptd}>Select Fuel Types</label>
            <div className={styles.fuelChips}>
              {["Petrol", "Diesel", "Premium Petrol", "CNG"].map((fuel) => (
                <button
                  key={fuel}
                  type="button"
                  className={`${styles.chip} ${selectedFuels.includes(fuel) ? styles.chipActive : ""}`}
                  onClick={() => handleFuelToggle(fuel)}
                >
                  {fuel}
                </button>
              ))}
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={savePump} disabled={loading}>
                {loading ? "Saving..." : " Save Pump 💾"}
              </button>

              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
