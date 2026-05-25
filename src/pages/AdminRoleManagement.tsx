import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/adminrole.module.css";
import FullScreenLoader from "../component/FullScreenLoader";

type PlatformRole = "Owner" | "SuperAdmin" | "Admin";

type ModulePermissions = {
  shift: boolean;
  testFuel: boolean;
  fuelRate: boolean;
  pumpManagement: boolean;
  addTank: boolean;
  saleEntry: boolean;
  tankManagement: boolean;
  attendance: boolean;
  creditLine: boolean;
  finance: boolean;
  wholeDayReport: boolean;
  payment: boolean;
  paymentComparison: boolean;
};

type User = {
  _id?: string;
  username: string;
  email: string;
  role: PlatformRole;
  customRoleName?: string | null;
  modulePermissions?: Partial<ModulePermissions>;
  pumpIds?: string[];
  createdAt?: string;
};

type Pump = {
  _id: string;
  name: string;
  code: string;
};

type Log = {
  _id: string;
  user: string;
  role: string;
  action: string;
  createdAt: string;
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

const BASE_URL = API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

const defaultPermissions: ModulePermissions = {
  shift: false,
  testFuel: false,
  fuelRate: false,
  pumpManagement: false,
  addTank: false,
  saleEntry: false,
  tankManagement: false,
  attendance: false,
  creditLine: false,
  finance: false,
  wholeDayReport: false,
  payment: false,
  paymentComparison: false,
};

const permissionFields: Array<{ key: keyof ModulePermissions; label: string }> = [
  { key: "shift", label: "Shift" },
  { key: "testFuel", label: "Test Fuel" },
  { key: "fuelRate", label: "Fuel Rate" },
  { key: "pumpManagement", label: "Pump Management" },
  { key: "addTank", label: "Add Tank" },
  { key: "saleEntry", label: "Sale Entry" },
  { key: "tankManagement", label: "Tank Management" },
  { key: "attendance", label: "Attendance" },
  { key: "creditLine", label: "Credit Line" },
  { key: "finance", label: "Finance" },
  { key: "wholeDayReport", label: "Generate Report" },
  { key: "payment", label: "Live Payment" },
  { key: "paymentComparison", label: "Payment Comparison" },
];

const canCreateRole = (requesterRole: PlatformRole, targetRole: PlatformRole): boolean => {
  if (requesterRole === "Owner") return targetRole === "SuperAdmin" || targetRole === "Admin";
  if (requesterRole === "SuperAdmin") return targetRole === "Admin";
  return false;
};

const countEnabledPermissions = (modulePermissions?: Partial<ModulePermissions>) =>
  Object.values(modulePermissions || {}).filter(Boolean).length;

export default function AdminRoleManagement() {
  const navigate = useNavigate();
  const requesterRole = (localStorage.getItem("userRole") || "") as PlatformRole;
  const requesterName = localStorage.getItem("username") || "System";
  const requesterUserId = localStorage.getItem("userId") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [pumps, setPumps] = useState<Pump[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");

  const [newUser, setNewUser] = useState<{
    username: string;
    email: string;
    password: string;
    role: PlatformRole;
    customRoleName: string;
    modulePermissions: ModulePermissions;
    pumpIds: string[];
  }>({
    username: "",
    email: "",
    password: "",
    role: requesterRole === "Owner" ? "SuperAdmin" : "Admin",
    customRoleName: "",
    modulePermissions: { ...defaultPermissions },
    pumpIds: [],
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState("");

  const creatableRoles = useMemo(() => {
    const options: PlatformRole[] = [];
    if (requesterRole === "Owner") {
      options.push("SuperAdmin", "Admin");
    } else if (requesterRole === "SuperAdmin") {
      options.push("Admin");
    }
    return options;
  }, [requesterRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("modulePermissions");
    localStorage.removeItem("customRoleName");
    localStorage.removeItem("selectedPumpId");
    navigate("/sign");
  };

  useEffect(() => {
    if (requesterRole !== "Owner" && requesterRole !== "SuperAdmin") {
      navigate("/sign");
      return;
    }
    if (!requesterUserId) {
      navigate("/sign");
      return;
    }
    fetchPumps();
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchPumps = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/pumps`);
      if (!res.ok) throw new Error("Failed to fetch pumps");
      const data = await res.json();
      setPumps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pumps:", err);
      setPumps([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/users?requesterRole=${requesterRole}`, {
        headers: {
          "x-requester-role": requesterRole,
          "x-requester-name": requesterName,
          "x-requester-user-id": requesterUserId,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/logs?requesterRole=${requesterRole}`, {
        headers: {
          "x-requester-role": requesterRole,
          "x-requester-name": requesterName,
          "x-requester-user-id": requesterUserId,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const openCreateModal = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      role: requesterRole === "Owner" ? "SuperAdmin" : "Admin",
      customRoleName: "",
      modulePermissions: { ...defaultPermissions },
      pumpIds: [],
    });
    setShowCreateModal(true);
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("perm_")) {
      const key = name.replace("perm_", "") as keyof ModulePermissions;
      setNewUser((prev) => ({
        ...prev,
        modulePermissions: {
          ...prev.modulePermissions,
          [key]: (e.target as HTMLInputElement).checked,
        },
      }));
      return;
    }
    if (name.startsWith("pump_")) {
      const pumpId = name.replace("pump_", "");
      setNewUser((prev) => ({
        ...prev,
        pumpIds: (e.target as HTMLInputElement).checked
          ? Array.from(new Set([...prev.pumpIds, pumpId]))
          : prev.pumpIds.filter((id) => id !== pumpId),
      }));
      return;
    }
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Please fill username, email and password.");
      return;
    }
    if (!canCreateRole(requesterRole, newUser.role)) {
      alert(`You cannot create ${newUser.role} users.`);
      return;
    }
    if (newUser.role === "Admin" && !newUser.customRoleName.trim()) {
      alert("Please provide custom role title for Admin (for example: Manager).");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        requesterRole,
        requesterUserId,
        performedBy: requesterName,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        customRoleName: newUser.role === "Admin" ? newUser.customRoleName.trim() : null,
        modulePermissions: newUser.role === "Admin" ? newUser.modulePermissions : {},
        pumpIds: newUser.pumpIds,
      };

      const res = await fetch(`${BASE_URL}/api/admin/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requester-role": requesterRole,
          "x-requester-name": requesterName,
          "x-requester-user-id": requesterUserId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      alert("User created successfully.");
      setShowCreateModal(false);
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error creating user:", err);
      alert(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (u: User) => {
    if (!canCreateRole(requesterRole, u.role)) {
      alert(`You cannot edit ${u.role} users.`);
      return;
    }
    setEditUser({
      ...u,
      pumpIds: Array.isArray(u.pumpIds) ? u.pumpIds : [],
      modulePermissions: {
        ...defaultPermissions,
        ...(u.modulePermissions || {}),
      },
    });
    setEditPassword("");
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    const { name, value } = e.target;
    if (name.startsWith("perm_")) {
      const key = name.replace("perm_", "") as keyof ModulePermissions;
      setEditUser((prev) =>
        prev
          ? {
              ...prev,
              modulePermissions: {
                ...defaultPermissions,
                ...(prev.modulePermissions || {}),
                [key]: (e.target as HTMLInputElement).checked,
              },
            }
          : prev
      );
      return;
    }
    if (name.startsWith("pump_")) {
      const pumpId = name.replace("pump_", "");
      setEditUser((prev) =>
        prev
          ? {
              ...prev,
              pumpIds: (e.target as HTMLInputElement).checked
                ? Array.from(new Set([...(prev.pumpIds || []), pumpId]))
                : (prev.pumpIds || []).filter((id) => id !== pumpId),
            }
          : prev
      );
      return;
    }
    setEditUser((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const saveEditUser = async () => {
    if (!editUser || !editUser._id) return;
    if (!canCreateRole(requesterRole, editUser.role)) {
      alert(`You cannot update this user role (${editUser.role}).`);
      return;
    }
    if (editUser.role === "Admin" && !(editUser.customRoleName || "").trim()) {
      alert("Please provide custom role title for Admin.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        requesterRole,
        requesterUserId,
        performedBy: requesterName,
        username: editUser.username,
        email: editUser.email,
        role: editUser.role,
        customRoleName: editUser.role === "Admin" ? (editUser.customRoleName || "").trim() : null,
        modulePermissions: editUser.role === "Admin" ? editUser.modulePermissions || {} : {},
        pumpIds: editUser.pumpIds || [],
      };
      if (editPassword.trim()) payload.password = editPassword.trim();

      const res = await fetch(`${BASE_URL}/api/admin/user/${editUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-requester-role": requesterRole,
          "x-requester-name": requesterName,
          "x-requester-user-id": requesterUserId,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      alert("User updated.");
      setShowEditModal(false);
      setEditUser(null);
      setEditPassword("");
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error updating user:", err);
      alert(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/user/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-requester-role": requesterRole,
          "x-requester-name": requesterName,
          "x-requester-user-id": requesterUserId,
        },
        body: JSON.stringify({
          requesterRole,
          requesterUserId,
          performedBy: requesterName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== "All" && u.role !== filterRole) return false;
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q) ||
      (u.customRoleName || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <FullScreenLoader loading={loading} />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>User & Access Management</h1>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className={styles.topRow}>
          <div>
            <input
              className={styles.searchInput}
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className={styles.leftControls}>
            <button className={styles.primaryBtn} onClick={openCreateModal}>
              Create User
            </button>
            <select
              className={styles.smallSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              title="Filter by role"
            >
              <option value="All">All Roles</option>
              <option>Owner</option>
              <option>SuperAdmin</option>
              <option>Admin</option>
            </select>
          </div>
        </div>

        <section className={styles.section}>
          <h2>User Accounts</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Custom Title</th>
                  <th>Created</th>
                  <th>Modules</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td className={styles.admin_table}>{u.username}</td>
                      <td className={styles.admin_table}>{u.email}</td>
                      <td className={styles.admin_table}>{u.role}</td>
                      <td className={styles.admin_table}>{u.customRoleName || "-"}</td>
                      <td className={styles.admin_table}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className={styles.admin_table}>
                        {u.role === "Admin" ? `${countEnabledPermissions(u.modulePermissions)}/${permissionFields.length}` : "-"}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button
                            className={styles.rowBtn}
                            onClick={() => openEditModal(u)}
                            disabled={!canCreateRole(requesterRole, u.role)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => deleteUser(u._id!)}
                            disabled={!canCreateRole(requesterRole, u.role)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Action Logs</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No logs found.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className={styles.admin_table}>{log.user}</td>
                      <td className={styles.admin_table}>{log.role}</td>
                      <td className={styles.admin_table}>{log.action}</td>
                      <td className={styles.admin_table}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showCreateModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
            <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
              <h3>Create New User</h3>
              <div className={styles.formGrid}>
                <input name="username" placeholder="Username" value={newUser.username} onChange={handleNewChange} />
                <input name="email" placeholder="Email address" value={newUser.email} onChange={handleNewChange} />
                <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleNewChange} />
                <select name="role" value={newUser.role} onChange={handleNewChange}>
                  {creatableRoles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              {newUser.role === "Admin" && (
                <>
                  <div className={styles.formGrid}>
                    <input
                      name="customRoleName"
                      placeholder="Custom admin title (e.g. Manager)"
                      value={newUser.customRoleName}
                      onChange={handleNewChange}
                    />
                  </div>
                  <div className={styles.permGrid}>
                    {permissionFields.map((perm) => (
                      <label className={styles.permLabel} key={perm.key}>
                        <input
                          name={`perm_${perm.key}`}
                          type="checkbox"
                          checked={Boolean(newUser.modulePermissions[perm.key])}
                          onChange={handleNewChange}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                  <h4 style={{ marginTop: 12 }}>Pump Access</h4>
                  <div className={styles.permGrid}>
                    {pumps.length === 0 ? (
                      <p>No pumps available to assign.</p>
                    ) : (
                      pumps.map((pump) => (
                        <label className={styles.permLabel} key={pump._id}>
                          <input
                            name={`pump_${pump._id}`}
                            type="checkbox"
                            checked={newUser.pumpIds.includes(pump._id)}
                            onChange={handleNewChange}
                          />
                          {pump.name} ({pump.code})
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}

              <div className={styles.modalButtons}>
                <button className={styles.saveBtn} onClick={createUser}>
                  Create User
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editUser && (
          <div className={styles.modalBackdrop} onClick={() => setShowEditModal(false)}>
            <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
              <h3>Edit User</h3>
              <div className={styles.formGrid}>
                <input name="username" placeholder="Username" value={editUser.username} onChange={handleEditChange} />
                <input name="email" placeholder="Email address" value={editUser.email} onChange={handleEditChange} />
                <input
                  name="password"
                  type="password"
                  placeholder="New password (optional)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <select name="role" value={editUser.role} onChange={handleEditChange}>
                  {creatableRoles
                    .filter((r) => canCreateRole(requesterRole, r))
                    .map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                </select>
              </div>

              {editUser.role === "Admin" && (
                <>
                  <div className={styles.formGrid}>
                    <input
                      name="customRoleName"
                      placeholder="Custom admin title (e.g. Manager)"
                      value={editUser.customRoleName || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className={styles.permGrid}>
                    {permissionFields.map((perm) => (
                      <label className={styles.permLabel} key={perm.key}>
                        <input
                          name={`perm_${perm.key}`}
                          type="checkbox"
                          checked={Boolean(editUser.modulePermissions?.[perm.key])}
                          onChange={handleEditChange}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                  <h4 style={{ marginTop: 12 }}>Pump Access</h4>
                  <div className={styles.permGrid}>
                    {pumps.length === 0 ? (
                      <p>No pumps available to assign.</p>
                    ) : (
                      pumps.map((pump) => (
                        <label className={styles.permLabel} key={pump._id}>
                          <input
                            name={`pump_${pump._id}`}
                            type="checkbox"
                            checked={Boolean(editUser.pumpIds?.includes(pump._id))}
                            onChange={handleEditChange}
                          />
                          {pump.name} ({pump.code})
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}

              <div className={styles.modalButtons}>
                <button className={styles.saveBtn} onClick={saveEditUser}>
                  Save Changes
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditUser(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
