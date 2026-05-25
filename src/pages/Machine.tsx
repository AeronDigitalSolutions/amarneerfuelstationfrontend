import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/pumpno.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Nozzle = {
  nozzleNo: number;
  fuelType: string;
};

type Machine = {
  _id?: string;
  machineNo: string;
  machineName: string;
  nozzles: Nozzle[];
};

export default function MachinePage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machine, setMachine] = useState<Machine>({
    machineNo: "",
    machineName: "",
    nozzles: [],
  });

  const [dynamicFuelTypes, setDynamicFuelTypes] = useState<string[]>([]);

  const [nozzleCount, setNozzleCount] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMachines();
    fetchDynamicFuelTypes();
  }, []);

  // 🔥 Fetch dynamic fuel types from backend
  const fetchDynamicFuelTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      const rateObj = res.data?.rates || {};

      setDynamicFuelTypes(Object.keys(rateObj)); // ["petrol", "diesel", "cng"]
    } catch (err) {
      console.error("Fuel type fetch error:", err);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/machines`);
      setMachines(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setMachine((prev) => ({ ...prev, [name]: value }));
  };

  const updateNozzleFuel = (index: number, fuel: string) => {
    setMachine((prev) => {
      const updated = [...prev.nozzles];
      updated[index].fuelType = fuel;
      return { ...prev, nozzles: updated };
    });
  };

  const prepareNozzles = (count: number) => {
    const arr: Nozzle[] = [];
    for (let i = 1; i <= count; i++) {
      arr.push({ nozzleNo: i, fuelType: "" });
    }
    setMachine((prev) => ({ ...prev, nozzles: arr }));
  };

  const saveMachine = async () => {
    if (!machine.machineNo || !machine.machineName) {
      alert("⚠️ Fill machine number & machine name");
      return;
    }

    if (machine.nozzles.some((n) => !n.fuelType)) {
      alert("⚠️ Select fuel for all nozzles");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/machines`, machine);
      alert("✅ Machine added!");
      setMachine({ machineNo: "", machineName: "", nozzles: [] });
      setNozzleCount(1);
      await fetchMachines();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} module-page`}>
      <section className="module-hero">
        <div>
          <p className="module-hero-tag">PUMP MANAGEMENT</p>
          <h2>Machine & Nozzle Layout</h2>
          <p>Configure machine identities and nozzle fuel mapping for accurate shift sales.</p>
        </div>
      </section>

      <section className="module-kpis">
        <article className="module-kpi">
          <span>Total Machines</span>
          <strong>{machines.length}</strong>
        </article>
        <article className="module-kpi">
          <span>Fuel Types Available</span>
          <strong>{dynamicFuelTypes.length}</strong>
        </article>
        <article className="module-kpi">
          <span>Nozzle Config Status</span>
          <strong style={{ fontSize: "18px" }}>{machines.length ? "Configured" : "Pending"}</strong>
        </article>
      </section>

      <div className={`${styles.card} module-surface`}>
        <div className={styles.header}>
          <h2> Machine Management </h2>
          <button className="module-btn" onClick={() => setShowModal(true)}>
            Add Machine ➕
          </button>
        </div>

        <div className={styles.listSection}>
          {machines.length === 0 ? (
            <p className={styles.noData}>No machines yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Machine No</th>
                  <th>Machine Name</th>
                  <th>Nozzles</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m._id}>
                    <td>{m.machineNo}</td>
                    <td>{m.machineName}</td>
                    <td>
                      {m.nozzles
                        .map((n) => `Nozzle ${n.nozzleNo} (${n.fuelType})`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalForm}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              ✖
            </button>

            <h2>Add Machine</h2>

            <label>Machine Number</label>
            <input name="machineNo" value={machine.machineNo} onChange={handleChange} />

            <label>Machine Name</label>
            <input name="machineName" value={machine.machineName} onChange={handleChange} />

            <label>No. of Nozzles</label>
            <select
              value={nozzleCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setNozzleCount(count);
                prepareNozzles(count);
              }}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <div className={styles.nozzleBox}>
              {machine.nozzles.map((n, idx) => (
                <div key={idx} className={styles.nozzleRow}>
                  <span>Nozzle {n.nozzleNo}</span>

                  <select value={n.fuelType} onChange={(e) => updateNozzleFuel(idx, e.target.value)}>
                    <option value="">Select Fuel</option>

                    {dynamicFuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button className={styles.saveBtn} onClick={saveMachine} disabled={loading}>
              {loading ? "Saving..." : "Save Machine 💾"}
            </button>

            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
