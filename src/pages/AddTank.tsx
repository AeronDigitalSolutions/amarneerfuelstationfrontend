import { useState, useEffect } from "react";

interface Tank {
  _id?: string;
  tankId: string;
  fuelType: string;
  capacity: number | "";
  createdAt?: string;
}

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

export default function AddTank() {
  const [tank, setTank] = useState<Tank>({
    tankId: "",
    fuelType: "Petrol",
    capacity: "",
  });

  const [tanks, setTanks] = useState<Tank[]>([]);

  const fetchTanks = async () => {
    const res = await fetch(`${BASE_URL}/tank-master`);
    const data = await res.json();
    setTanks(data);
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
      ...tank,
      capacity: Number(tank.capacity),
    };

    const res = await fetch(`${BASE_URL}/tank-master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return alert("Failed to add tank");

    alert("Tank added successfully!");
    setTank({ tankId: "", fuelType: "Petrol", capacity: "" });
    fetchTanks();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>➕ Add Tank</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
        }}
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

      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Save Tank
      </button>

      <h2 style={{ marginTop: 40 }}>📋 Tank List</h2>

      <table
        border={1}
        cellPadding={8}
        style={{ width: "100%", marginTop: 10 }}
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
  );
}
