import { useState, useEffect } from "react";
import axios from "axios";

// ✅ Backend connection logic
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPump((prev) => ({ ...prev, [name]: value }));
  };

  const handleFuelToggle = (fuel: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel)
        ? prev.filter((f) => f !== fuel)
        : [...prev, fuel]
    );
  };

  const savePump = async () => {
    if (!newPump.pumpNo || !newPump.pumpName || selectedFuels.length === 0) {
      alert("⚠️ Please fill Pump No, Pump Name & select at least one fuel type");
      return;
    }

    try {
      const payload = {
        pumpNo: newPump.pumpNo,
        pumpName: newPump.pumpName,
        fuels: selectedFuels.map((f) => ({ type: f })),
      };
      await axios.post(`${BASE_URL}/pumps`, payload);
      alert("✅ Pump added successfully!");
      setNewPump({ pumpNo: "", pumpName: "", fuels: [] });
      setSelectedFuels([]);
      fetchPumps();
    } catch (err) {
      console.error("❌ Error saving pump:", err);
      alert("Failed to save pump.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        backgroundColor: "#f9fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          width: "100%",
          maxWidth: "650px",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#28408f",
            marginBottom: "25px",
            fontSize: "1.8rem",
            fontWeight: 600,
          }}
        >
          🛢 Pump Management
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ fontWeight: 500 }}>Pump Number</label>
          <input
            type="text"
            name="pumpNo"
            value={newPump.pumpNo}
            onChange={handleChange}
            style={{
              padding: "10px",
              border: "1px solid #d2d6dc",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />

          <label style={{ fontWeight: 500 }}>Pump Name</label>
          <input
            type="text"
            name="pumpName"
            value={newPump.pumpName}
            onChange={handleChange}
            style={{
              padding: "10px",
              border: "1px solid #d2d6dc",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          />

          <label style={{ fontWeight: 500 }}>Select Fuel Types</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Petrol", "Diesel", "Premium Petrol"].map((fuel) => (
              <label
                key={fuel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: selectedFuels.includes(fuel)
                    ? "#dbe3ff"
                    : "#eef2ff",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: selectedFuels.includes(fuel)
                    ? "1px solid #28408f"
                    : "1px solid transparent",
                  transition: "0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFuels.includes(fuel)}
                  onChange={() => handleFuelToggle(fuel)}
                />
                {fuel}
              </label>
            ))}
          </div>

          <button
            onClick={savePump}
            style={{
              backgroundColor: "#28408f",
              color: "white",
              fontSize: "1rem",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              marginTop: "15px",
              cursor: "pointer",
              transition: "background-color 0.2s, transform 0.1s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#3b56d6")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#28408f")
            }
          >
            💾 Save Pump
          </button>
        </div>

        {pumps.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h3
              style={{
                color: "#1f2937",
                marginBottom: "12px",
                fontSize: "1.2rem",
              }}
            >
              📋 Pump List
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e6e9f5" }}>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    Pump No
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    Pump Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    Fuel Types
                  </th>
                </tr>
              </thead>
              <tbody>
                {pumps.map((p, i) => (
                  <tr
                    key={p._id || i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#f9fafc" : "#fff",
                    }}
                  >
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {p.pumpNo}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {p.pumpName}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      {p.fuels.map((f) => f.type).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
