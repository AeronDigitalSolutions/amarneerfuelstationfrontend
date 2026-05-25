import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/opsModules.css";

type Pump = {
  _id: string;
  name: string;
  code: string;
  location?: string | null;
  dataIsolationKey: string;
  ownerUserId: string;
  primarySuperAdminUserId?: string | null;
};

type SuperAdmin = {
  _id: string;
  username: string;
  email: string;
  role: "SuperAdmin";
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

export default function OwnerPumps() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "";
  const requesterUserId = localStorage.getItem("userId") || "";
  const [selectedPumpId, setSelectedPumpId] = useState(localStorage.getItem("selectedPumpId") || "");

  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);

  const selectedPump = useMemo(() => pumps.find((p) => p._id === selectedPumpId) || null, [pumps, selectedPumpId]);

  useEffect(() => {
    if (role !== "Owner") {
      navigate("/dashboardmain");
      return;
    }
    fetchSuperAdmins();
    fetchPumps();
  }, []);

  const fetchSuperAdmins = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users?requesterRole=Owner`, {
        headers: { "x-requester-role": "Owner", "x-requester-user-id": requesterUserId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch super admins");
      const onlySuperAdmins = Array.isArray(data)
        ? data.filter((u: any) => u?.role === "SuperAdmin")
        : [];
      setSuperAdmins(onlySuperAdmins);
    } catch (err: any) {
      alert(err.message || "Failed to load super admins");
    }
  };

  const fetchPumps = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/pumps`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pumps");
      setPumps(Array.isArray(data) ? data : []);

      if (!localStorage.getItem("selectedPumpId") && Array.isArray(data) && data[0]?._id) {
        localStorage.setItem("selectedPumpId", data[0]._id);
        setSelectedPumpId(data[0]._id);
      }
    } catch (err: any) {
      alert(err.message || "Failed to load pumps");
    } finally {
      setLoading(false);
    }
  };

  const createPump = async () => {
    if (!name.trim()) {
      alert("Pump name is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/pumps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || undefined,
          location: location.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create pump");

      setName("");
      setCode("");
      setLocation("");
      await fetchPumps();
      localStorage.setItem("selectedPumpId", data._id);
      setSelectedPumpId(data._id);
      alert("Pump created and selected.");
    } catch (err: any) {
      alert(err.message || "Failed to create pump");
    } finally {
      setLoading(false);
    }
  };

  const selectPump = (pumpId: string) => {
    setSelectedPumpId(pumpId);
    localStorage.setItem("selectedPumpId", pumpId);
    alert("Pump selected. All module data is now isolated to this pump.");
  };

  return (
    <div className="ops-page">
      <div>
        <h1 className="ops-title">Owner Petrol Pump Management</h1>
        <p className="ops-subtitle">
          Manage multiple pumps and choose one active pump for data isolation. SuperAdmin assignment is managed in
          the SuperAdmin module.
        </p>
      </div>

      <div className="ops-card">
        <h3 className="ops-card-title">Create New Pump</h3>
        <div className="ops-form-grid">
          <input placeholder="Pump Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Pump Code (optional)" value={code} onChange={(e) => setCode(e.target.value)} />
          <input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button className="ops-button" onClick={createPump} disabled={loading}>
            {loading ? "Saving..." : "Create Pump"}
          </button>
        </div>
      </div>

      <div className="ops-card">
        <h3 className="ops-card-title">All Pumps</h3>
        {pumps.length === 0 ? (
          <p className="ops-muted">No pumps found.</p>
        ) : (
          <div className="ops-grid">
            {pumps.map((pump) => (
              <div key={pump._id} className="ops-item">
                <strong>{pump.name}</strong>
                <div className="ops-muted">Code: {pump.code}</div>
                <div className="ops-muted">Location: {pump.location || "-"}</div>
                <div className="ops-muted">Isolation Key: {pump.dataIsolationKey}</div>
                <div className="ops-muted">
                  Assigned SuperAdmin:{" "}
                  {superAdmins.find((sa) => sa._id === pump.primarySuperAdminUserId)?.username || "Not assigned"}
                </div>
                <button
                  className="ops-button"
                  onClick={() => selectPump(pump._id)}
                  disabled={selectedPump?._id === pump._id}
                >
                  {selectedPump?._id === pump._id ? "Selected" : "Select Pump"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
