import { useState, useEffect } from "react";
import axios from "axios";
import '../style/Addtank.css'
// import FullScreenLoader from "../component/FullScreenLoader";
interface Tank {
  _id?: string;
  tankId: string;
  fuelType: string;
  capacity: number | "";
  name?: string;
  productType?: string;
  createdAt?: string;
}

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

export default function AddTank() {
  //  const [loading, setLoading] = useState(true);
  const [tank, setTank] = useState<Tank>({
    tankId: "",
    fuelType: "Petrol",
    capacity: "",
  });

  const [tanks, setTanks] = useState<Tank[]>([]);

  const fetchTanks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tank-master`);
      const normalized = Array.isArray(res.data)
        ? res.data.map((row: any) => ({
            ...row,
            tankId: row?.tankId ?? row?.name ?? "",
            fuelType: row?.fuelType ?? row?.productType ?? "",
          }))
        : [];
      setTanks(normalized);
    } catch {
      setTanks([]);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTank({ ...tank, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!tank.tankId.trim()) return alert("Enter Tank ID");
    if (!tank.capacity) return alert("Enter capacity");

    const payload = {
      tankId: tank.tankId.trim(),
      fuelType: tank.fuelType,
      capacity: Number(tank.capacity),
      // backward compatibility with older tank-master handlers
      name: tank.tankId.trim(),
      productType: tank.fuelType,
    };

    try {
      await axios.post(`${BASE_URL}/tank-master`, payload);
      alert("Tank added successfully!");
      setTank({ tankId: "", fuelType: "Petrol", capacity: "" });
      fetchTanks();
    } catch (error: any) {
      console.error("Add tank failed:", error?.response?.data || error?.message || error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to add tank";
      alert(message);
    }
    
  };

  return (
    <>
    {/* <FullScreenLoader loading={loading} /> */}
    <div className="add_continer_backend module-page" >
      <section className="module-hero">
        <div>
          <p className="module-hero-tag">MASTER DATA</p>
          <h2>Tank Registry</h2>
          <p>Create and maintain tank master records with capacity and fuel type controls.</p>
        </div>
      </section>

      <section className="module-kpis">
        <article className="module-kpi">
          <span>Total Tanks</span>
          <strong>{tanks.length}</strong>
        </article>
        <article className="module-kpi">
          <span>Fuel Groups</span>
          <strong>{new Set(tanks.map((t) => t.fuelType)).size}</strong>
        </article>
        <article className="module-kpi">
          <span>Registry Status</span>
          <strong style={{ fontSize: "18px" }}>{tanks.length ? "Active" : "Empty"}</strong>
        </article>
      </section>

      <div className="module-surface">
      <h1>Add Tank </h1>

      <div className="tank_flex"
        // style={{
        //   display: "flex",
        //   gap: 20,
        //   marginBottom: 20,
        // }}
      >
        <div>
          <label>Tank ID</label>
          <input
            name="tankId"
            value={tank.tankId}
            onChange={handleChange}
            placeholder="Enter Tank ID"
          />
        </div>

        <div>
          <label>Fuel Type</label>
          <select
            name="fuelType"
            value={tank.fuelType}
            onChange={handleChange}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Premium Petrol</option>
            <option>CNG</option>
          </select>
        </div>

        <div>
          <label>Capacity (L)</label>
          <input
            type="number"
            name="capacity"
            value={tank.capacity}
            onChange={handleChange}
            placeholder="Enter Capacity"
          />
        </div>
      </div>
<div  className="button_tank" >
      <button onClick={handleSubmit} className="module-btn-success" >
        Save Tank
      </button>
</div>
      <h2 className='tank_list_heading' > Tank List</h2>

      <table  className="table_add_tank"
        // border={1}
        // cellPadding={8}
        style={{ width: "100%", marginTop: 10, }}
      >
        <thead>
          <tr>
            <th>Tank ID</th>
            <th>Fuel Type</th>
            <th>Capacity</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map((t) => (
            <tr key={t._id}>
              <td>{t.tankId}</td>
              <td>{t.fuelType}</td>
              <td>{t.capacity}</td>
              <td>
                {t.createdAt
                  ? new Date(t.createdAt).toLocaleString("en-IN")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    </>
  );
}
