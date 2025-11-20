// FuelRates.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style/fuelrates.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

interface FuelRates {
  petrol: number;
  diesel: number;
  premiumPetrol: number;
  cng: number;
  updatedAt?: string;
}

export default function FuelRates() {
  const [rates, setRates] = useState<FuelRates>({
    petrol: 0,
    diesel: 0,
    premiumPetrol: 0,
    cng: 0,
  });

  const [latestRates, setLatestRates] = useState<FuelRates | null>(null);
  const [loading, setLoading] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFuelRates();
  }, []);

  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      setLatestRates(res.data);
      setRates({
        petrol: res.data.petrol ?? 0,
        diesel: res.data.diesel ?? 0,
        premiumPetrol: res.data.premiumPetrol ?? 0,
        cng: res.data.cng ?? 0,
      });
    } catch {
      // no existing rates
      console.log("No existing fuel rates found yet.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRates((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const saveRates = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/fuel-rates`, rates);
      alert("✅ Fuel rates saved successfully!");
      await fetchFuelRates();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Error saving rates:", err);
      alert("Failed to save fuel rates.");
    } finally {
      setLoading(false);
    }
  };

  // close modal when clicking backdrop
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setShowModal(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>⛽ Fuel Rates Management</h2>
          <div>
            <button
              className={styles.primaryBtn}
              onClick={() => setShowModal(true)}
            >
              ✏️ Edit Rates
            </button>
          </div>
        </div>

        {latestRates ? (
          <div className={styles.tableSection}>
            <h3>📊 Latest Fuel Rates</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fuel Type</th>
                  <th>Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Petrol</td>
                  <td>{latestRates.petrol}</td>
                </tr>
                <tr>
                  <td>Diesel</td>
                  <td>{latestRates.diesel}</td>
                </tr>
                <tr>
                  <td>Premium Petrol</td>
                  <td>{latestRates.premiumPetrol}</td>
                </tr>
                <tr>
                  <td>CNG</td>
                  <td>{latestRates.cng}</td>
                </tr>
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
          <p className={styles.noData}>No fuel rates found. Click "Edit Rates" to add.</p>
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdrop}>
          <div className={`${styles.modalForm} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label="Close">
              ✖
            </button>

            <h2>Edit Fuel Rates</h2>

            <div className={styles.formSection}>
              <div className={styles.inputGroup}>
                <label>Petrol Rate (₹)</label>
                <input type="number" name="petrol" value={rates.petrol} onChange={handleChange} />
              </div>

              <div className={styles.inputGroup}>
                <label>Diesel Rate (₹)</label>
                <input type="number" name="diesel" value={rates.diesel} onChange={handleChange} />
              </div>

              <div className={styles.inputGroup}>
                <label>Premium Petrol Rate (₹)</label>
                <input type="number" name="premiumPetrol" value={rates.premiumPetrol} onChange={handleChange} />
              </div>

              <div className={styles.inputGroup}>
                <label>CNG Rate (₹)</label>
                <input type="number" name="cng" value={rates.cng} onChange={handleChange} />
              </div>

              <div className={styles.modalButtons}>
                <button className={styles.saveBtn} onClick={saveRates} disabled={loading}>
                  {loading ? "Saving..." : "💾 Save Rates"}
                </button>

                <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
