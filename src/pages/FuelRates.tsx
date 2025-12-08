// FuelRates.tsx
import FullScreenLoader from "../component/FullScreenLoader";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style/fuelrates.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

interface FuelRatesData {
  rates: Record<string, number>;
  updatedAt?: string;
}

export default function FuelRates() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [latestRates, setLatestRates] = useState<FuelRatesData | null>(null);
  const [loading, setLoading] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // new fuel input
  const [newFuelName, setNewFuelName] = useState("");
  const [newFuelRate, setNewFuelRate] = useState<number>(0);

  useEffect(() => {
    fetchFuelRates();
  }, []);

  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      setLatestRates(res.data);
      setRates(res.data.rates || {});
    } catch {
      console.log("No fuel rates found yet.");
    }
     finally {
      setLoading(false); // hide loader when complete
    }
  };

  const saveRates = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/fuel-rates`, { rates });
      alert("Fuel rates saved successfully!");
      await fetchFuelRates();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving fuel rates");
    } finally {
      setLoading(false);
    }
  };

  const addNewFuel = () => {
    if (!newFuelName.trim()) {
      alert("Fuel name is required");
      return;
    }

    setRates((prev) => ({
      ...prev,
      [newFuelName]: newFuelRate,
    }));

    setNewFuelName("");
    setNewFuelRate(0);
    setShowAddModal(false);
    setShowModal(true);
  };

  return (
    <>
    <FullScreenLoader loading={loading} />
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>⛽ Fuel Rates Management</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className={styles.secondaryBtn} onClick={() => setShowAddModal(true)}>
              ➕ Add Fuel Type
            </button>

            <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
              ✏️ Edit Rates
            </button>
          </div>
        </div>

        {latestRates ? (
          <div className={styles.tableSection}>
            <h3 className={styles.latest}>Latest Fuel Rates</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.fuelheading}>Fuel Type</th>
                  <th className={styles.fuelheading}>Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rates).map(([name, rate]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className={styles.updatedText}>
              Last Updated:{" "}
              {latestRates.updatedAt
                ? new Date(latestRates.updatedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ) : (
          <p className={styles.noData}>Click “Add Fuel Type” to begin.</p>
        )}
      </div>

      {/* Add Fuel Type Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <h2>Add Fuel Type</h2>

            <div className={styles.inputGroup}>
              <label>Fuel Name</label>
              <input
                type="text"
                value={newFuelName}
                onChange={(e) => setNewFuelName(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Rate (₹)</label>
              <input
                type="number"
                value={newFuelRate}
                onChange={(e) => setNewFuelRate(Number(e.target.value))}
              />
            </div>

            <button className={styles.saveBtn} onClick={addNewFuel}>Add</button>
            <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDIT Fuel Rates Modal */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Fuel Rates</h2>

            {Object.entries(rates).map(([name, rate]) => (
              <div key={name} className={styles.inputGroup}>
                <label>{name} (₹)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) =>
                    setRates((prev) => ({
                      ...prev,
                      [name]: Number(e.target.value),
                    }))
                  }
                />
              </div>
            ))}

            <button className={styles.saveBtn} onClick={saveRates}>
              {loading ? "Saving..." : "Save Rates"}
            </button>
            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
