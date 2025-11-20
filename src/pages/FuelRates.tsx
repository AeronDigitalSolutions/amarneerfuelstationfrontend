import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style/fuelrates.module.css"; // ✅ new CSS module

// ✅ Backend connection logic
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

  useEffect(() => {
    fetchFuelRates();
  }, []);

  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      setLatestRates(res.data);
      setRates({
        petrol: res.data.petrol,
        diesel: res.data.diesel,
        premiumPetrol: res.data.premiumPetrol,
        cng: res.data.cng,
      });
    } catch {
      console.log("No existing fuel rates found yet.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRates((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const saveRates = async () => {
    try {
      await axios.post(`${BASE_URL}/fuel-rates`, rates);
      alert("✅ Fuel rates saved successfully!");
      fetchFuelRates();
    } catch (err) {
      console.error("❌ Error saving rates:", err);
      alert("Failed to save fuel rates.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.heading}>⛽ Fuel Rates Management</p>

        <div className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label>Petrol Rate (₹)</label>
            <input
              type="number"
              name="petrol"
              value={rates.petrol}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Diesel Rate (₹)</label>
            <input
              type="number"
              name="diesel"
              value={rates.diesel}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Premium Petrol Rate (₹)</label>
            <input
              type="number"
              name="premiumPetrol"
              value={rates.premiumPetrol}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>CNG Rate (₹)</label>
            <input
              type="number"
              name="cng"
              value={rates.cng}
              onChange={handleChange}
            />
          </div>

        
        </div>
  <button onClick={saveRates} className={styles.saveBtn}>
            💾 Save Rates
          </button>

          
        {latestRates && (
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
        )}
      </div>
    </div>
  );
}
