import { useState, useEffect } from "react";
import axios from "axios";
import '../style/PumpNo.css'
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
    <div className="pump_container">
      <div className="conatiner_pump">
        <p className="heading_pump">
          Pump Management
        </p>

        <div className="pump_form_conatiner">
          <div>
            <label>Pump Number</label>
            <input className="input-pump"
              type="text"
              name="pumpNo"
              value={newPump.pumpNo}
              onChange={handleChange}
            />
          </div>


          <div>
            <label>Pump Name</label>
            <input className="input-pump"
              type="text"
              name="pumpName"
              value={newPump.pumpName}
              onChange={handleChange}
            />
          </div>
        </div>





        <div className="select_fuel_conatiner" >
          <label className="select_label">Select Fuel Types</label>

          <div className="option_Pump"
          style={{ display: "flex", gap: "23px", flexWrap: "wrap", justifyContent:'center' }}
          >
            {["Petrol", "Diesel", "PrePetrol"].map((fuel) => (
              <label
                key={fuel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: selectedFuels.includes(fuel)
                    ? "#dbe3ff"
                    : "#eef2ff",
                  padding: "16px 40px",
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

          <button className="pump_button_Save"
            onClick={savePump}
            // style={{
            //   backgroundColor: "#28408f",
            //   color: "white",
            //   fontSize: "1rem",
            //   padding: "12px",
            //   border: "none",
            //   borderRadius: "8px",
            //   marginTop: "15px",
            //   cursor: "pointer",
            //   transition: "background-color 0.2s, transform 0.1s",
            // }}
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
            <table className="table_pump"
              // style={{
              //   width: "100%",
              //   borderCollapse: "collapse",
              //   fontSize: "0.95rem",
              // }}
            >
              <thead>
                <tr className="tr_pump">
                {/* style={{ backgroundColor: "#e6e9f5" }}> */}
                  <th className="th_pump"
                    // style={{
                    //   padding: "10px",
                    //   border: "1px solid #cbd5e1",
                    //   textAlign: "center",
                    // }}
                  >
                    Pump No
                  </th>
                  <th className="th_pump"
                    // style={{
                    //   padding: "10px",
                    //   border: "1px solid #cbd5e1",
                    //   textAlign: "center",
                    // }}
                  >
                    Pump Name
                  </th>
                  <th className="th_pump"
                    // style={{
                    //   padding: "10px",
                    //   border: "1px solid #cbd5e1",
                    //   textAlign: "center",
                    // }}
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
