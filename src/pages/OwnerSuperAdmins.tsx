import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/opsModules.css";

type SuperAdminUser = {
  _id: string;
  username: string;
  email: string;
  role: "SuperAdmin";
  pumpIds?: string[];
  createdAt?: string;
};

type Pump = {
  _id: string;
  name: string;
  code: string;
  primarySuperAdminUserId?: string | null;
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

export default function OwnerSuperAdmins() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "";
  const requesterUserId = localStorage.getItem("userId") || "";

  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPumpId, setSelectedPumpId] = useState("");

  useEffect(() => {
    if (role !== "Owner") {
      navigate("/dashboardmain");
      return;
    }
    if (!requesterUserId) {
      navigate("/sign");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, pumpsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users?requesterRole=Owner`, {
          headers: {
            "x-requester-role": "Owner",
            "x-requester-user-id": requesterUserId,
          },
        }),
        fetch(`${BASE_URL}/api/pumps`),
      ]);

      const usersData = await usersRes.json();
      const pumpsData = await pumpsRes.json();

      if (!usersRes.ok) throw new Error(usersData.message || "Failed to load users");
      if (!pumpsRes.ok) throw new Error(pumpsData.message || "Failed to load pumps");

      const superAdmins = Array.isArray(usersData)
        ? usersData.filter((u: any) => u?.role === "SuperAdmin")
        : [];
      setUsers(superAdmins);
      setPumps(Array.isArray(pumpsData) ? pumpsData : []);

      const pumpList = Array.isArray(pumpsData) ? pumpsData : [];
      if (!selectedPumpId) {
        const firstUnassigned = pumpList.find((p: Pump) => !p.primarySuperAdminUserId)?._id || "";
        setSelectedPumpId(firstUnassigned);
      }
    } catch (err: any) {
      alert(err.message || "Failed to load super admin module data");
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Username, email, and password are required.");
      return;
    }
    try {
      setLoading(true);
      const createRes = await fetch(`${BASE_URL}/api/admin/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requester-role": "Owner",
          "x-requester-user-id": requesterUserId,
        },
        body: JSON.stringify({
          requesterRole: "Owner",
          requesterUserId,
          performedBy: localStorage.getItem("username") || "Owner",
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role: "SuperAdmin",
          pumpIds: [],
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || "Failed to create SuperAdmin");

      if (selectedPumpId) {
        const assignRes = await fetch(`${BASE_URL}/api/pumps/${selectedPumpId}/super-admin`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ superAdminUserId: createData._id, forceSwitch: true }),
        });
        const assignData = await assignRes.json();
        if (!assignRes.ok) throw new Error(assignData.message || "Failed to assign SuperAdmin to pump");
      }

      setUsername("");
      setEmail("");
      setPassword("");
      await fetchData();
      alert(selectedPumpId ? "SuperAdmin created and assigned successfully." : "SuperAdmin created successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to create super admin");
    } finally {
      setLoading(false);
    }
  };

  const assignedPumpBySuperAdmin = useMemo(() => {
    const map = new Map<string, Pump>();
    for (const pump of pumps) {
      const saId = pump.primarySuperAdminUserId;
      if (!saId) continue;
      map.set(saId, pump);
    }
    return map;
  }, [pumps]);

  const unassignedPumps = useMemo(
    () => pumps.filter((p) => !p.primarySuperAdminUserId),
    [pumps]
  );

  const assignSuperAdmin = async (
    superAdminUserId: string | null,
    pumpId: string,
    options?: { forceSwitch?: boolean }
  ) => {
    if (!pumpId) return;
    try {
      setLoading(true);
      const assignRes = await fetch(`${BASE_URL}/api/pumps/${pumpId}/super-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superAdminUserId,
          forceSwitch: Boolean(options?.forceSwitch),
        }),
      });
      const assignData = await assignRes.json();
      if (!assignRes.ok) throw new Error(assignData.message || "Failed to assign SuperAdmin");
      await fetchData();
      alert("SuperAdmin assignment updated.");
    } catch (err: any) {
      alert(err.message || "Failed to assign SuperAdmin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ops-page">
      <div>
        <h1 className="ops-title">Owner SuperAdmin Module</h1>
        <p className="ops-subtitle">
          Create SuperAdmins and assign each one to exactly one petrol pump. Assignment is handled only here.
        </p>
      </div>

      <div className="ops-card">
        <h3 className="ops-card-title">Create SuperAdmin</h3>
        <div className="ops-form-grid">
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select value={selectedPumpId} onChange={(e) => setSelectedPumpId(e.target.value)}>
            <option value="">Assign Pump Later</option>
            {unassignedPumps.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <button className="ops-button" onClick={createSuperAdmin} disabled={loading}>
            {loading ? "Saving..." : "Create SuperAdmin"}
          </button>
        </div>
      </div>

      <div className="ops-card">
        <h3 className="ops-card-title">Pump Assignments</h3>
        {pumps.length === 0 ? (
          <p className="ops-muted">No petrol pumps found.</p>
        ) : (
          <div className="ops-grid">
            {pumps.map((pump) => (
              <div key={pump._id} className="ops-item">
                <strong>
                  {pump.name} ({pump.code})
                </strong>
                <div className="ops-muted">
                  Current SuperAdmin:{" "}
                  {users.find((u) => u._id === pump.primarySuperAdminUserId)?.username || "None"}
                </div>
                <div className="ops-action-row">
                  <select
                    className="ops-select"
                    value={pump.primarySuperAdminUserId || ""}
                    onChange={(e) => assignSuperAdmin(e.target.value || null, pump._id, { forceSwitch: true })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ops-card">
        <h3 className="ops-card-title">Existing SuperAdmins</h3>
        {users.length === 0 ? (
          <p className="ops-muted">No SuperAdmins found.</p>
        ) : (
          <div className="ops-grid">
            {users.map((u) => (
              <div key={u._id} className="ops-item">
                <strong>{u.username}</strong>
                <div className="ops-muted">{u.email}</div>
                <div className="ops-muted">
                  Assigned Pump:{" "}
                  {assignedPumpBySuperAdmin.get(u._id)
                    ? `${assignedPumpBySuperAdmin.get(u._id)!.name} (${assignedPumpBySuperAdmin.get(u._id)!.code})`
                    : "None"}
                </div>
                <div className="ops-action-row">
                  <select
                    className="ops-select"
                    value={assignedPumpBySuperAdmin.get(u._id)?._id || ""}
                    onChange={(e) => {
                      const nextPumpId = e.target.value;
                      const currentPumpId = assignedPumpBySuperAdmin.get(u._id)?._id || "";
                      if (!nextPumpId && currentPumpId) {
                        assignSuperAdmin(null, currentPumpId, { forceSwitch: true });
                        return;
                      }
                      if (nextPumpId) {
                        assignSuperAdmin(u._id, nextPumpId, { forceSwitch: true });
                      }
                    }}
                  >
                    <option value="">Unassigned</option>
                    {pumps.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ops-muted">Created: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
