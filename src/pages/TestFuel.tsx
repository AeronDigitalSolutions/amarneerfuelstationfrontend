import { useEffect, useState, useRef } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Pump = {
  _id: string;
  pumpNo: string;
  pumpName: string;
  fuels: { type: string }[];
};

type FuelTest = {
  _id: string;
  pumpNo: string;
  pumpName: string;
  fuelType: string;
  liters: number;
  startTime: string;
  stopTime: string;
  duration: number;
};

export default function TestFuel() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [fuelOptions, setFuelOptions] = useState<string[]>([]);

  const [selectedPump, setSelectedPump] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [liters, setLiters] = useState("");

  const [tests, setTests] = useState<FuelTest[]>([]);

  // TIMER VARIABLES
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/pumps`).then((res) => setPumps(res.data));
    loadTests();
  }, []);

  const loadTests = async () => {
    const res = await axios.get(`${BASE_URL}/fueltest`);
    setTests(res.data);
  };

  const handlePumpChange = (pumpId: string) => {
    setSelectedPump(pumpId);

    const pump = pumps.find((p) => p._id === pumpId);
    if (pump) setFuelOptions(pump.fuels.map((f) => f.type));
  };

  // -----------------------
  // START TEST
  // -----------------------
  const startTest = () => {
    if (!selectedPump || !selectedFuel || liters === "") {
      alert("Fill all fields before starting test");
      return;
    }

    const now = new Date();
    setStartTime(now);
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  // -----------------------
  // STOP TEST + SAVE
  // -----------------------
  const stopTest = async () => {
    if (!startTime) {
      alert("Start test first!");
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const stopTime = new Date();

    await axios.post(`${BASE_URL}/fueltest`, {
      pumpId: selectedPump,
      fuelType: selectedFuel,
      liters: Number(liters),
      startTime,
      stopTime,
    });

    alert("Fuel Test Saved!");

    setSelectedFuel("");
    setLiters("");
    setStartTime(null);
    setElapsed(0);

    loadTests();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>⛽ Fuel Test Entry</h2>

      {/* Pump Dropdown */}
      <label>Pump</label>
      <select
        value={selectedPump}
        onChange={(e) => handlePumpChange(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="">Select Pump</option>
        {pumps.map((p) => (
          <option key={p._id} value={p._id}>
            {p.pumpNo} - {p.pumpName}
          </option>
        ))}
      </select>

      {/* Fuel Dropdown */}
      <label>Fuel Type</label>
      <select
        value={selectedFuel}
        onChange={(e) => setSelectedFuel(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="">Select Fuel</option>
        {fuelOptions.map((fuel) => (
          <option key={fuel} value={fuel}>
            {fuel}
          </option>
        ))}
      </select>

      {/* Liters */}
      <label>Liters</label>
      <input
        type="number"
        value={liters}
        onChange={(e) => setLiters(e.target.value)}
        placeholder="Enter Liters"
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />

      {/* TIMER */}
      {startTime && (
        <div style={{ fontSize: "1.4rem", marginBottom: "15px", textAlign: "center" }}>
          ⏱ {formatTime(elapsed)}
        </div>
      )}

      {/* Start / Stop Buttons */}
      {!startTime ? (
        <button
          onClick={startTest}
          style={{
            width: "100%",
            padding: "12px",
            background: "green",
            color: "white",
            borderRadius: "8px",
            border: "none",
            fontSize: "1rem",
          }}
        >
          ▶ Start Test
        </button>
      ) : (
        <button
          onClick={stopTest}
          style={{
            width: "100%",
            padding: "12px",
            background: "red",
            color: "white",
            borderRadius: "8px",
            border: "none",
            fontSize: "1rem",
          }}
        >
          ⏹ Stop Test
        </button>
      )}

      {/* Test Table */}
      {tests.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>📝 Test Records</h3>

          <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#e6e9f5" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Pump</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Fuel</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Liters</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Start</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Stop</th>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>Duration</th>
              </tr>
            </thead>

            <tbody>
              {tests.map((t) => (
                <tr key={t._id}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    {t.pumpNo} - {t.pumpName}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{t.fuelType}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{t.liters}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    {new Date(t.startTime).toLocaleTimeString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    {new Date(t.stopTime).toLocaleTimeString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    {formatTime(t.duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
