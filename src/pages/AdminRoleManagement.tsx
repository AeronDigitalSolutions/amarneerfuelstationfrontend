import { useEffect, useState } from "react";
import styles from "../style/adminrole.module.css";

type User = {
  _id?: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  permissions?: Permissions;
};

type Log = {
  _id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
};

type Permissions = {
  manageUsers: boolean;
  viewSales: boolean;
  editSales: boolean;
  managePumps: boolean;
  manageTestFuel: boolean;
};

const BASE_URL = "https://amarneerfuelstationbackend.onrender.com"; // keep your backend

export default function AdminRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Search + filter (small conveniences)
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");

  // Form for create
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Attendant",
    permissions: {
      manageUsers: false,
      viewSales: false,
      editSales: false,
      managePumps: false,
      manageTestFuel: false,
    } as Permissions,
  });

  // Form for edit
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState(""); // optional password change

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/logs`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
    }
  };

  /* --------------------
     CREATE USER HANDLERS
     -------------------- */
  const openCreateModal = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      role: "Attendant",
      permissions: {
        manageUsers: false,
        viewSales: false,
        editSales: false,
        managePumps: false,
        manageTestFuel: false,
      },
    });
    setShowCreateModal(true);
  };

  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (name.startsWith("perm_")) {
      const permKey = name.replace("perm_", "") as keyof Permissions;
      setNewUser((prev) => ({
        ...prev,
        permissions: {
          ...(prev.permissions as Permissions),
          [permKey]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: type === "select-one" ? value : value }));
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Please fill username, email and password.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        permissions: newUser.permissions,
        performedBy: "Admin",
      };

      const res = await fetch(`${BASE_URL}/api/admin/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create user");
      }

      alert("✅ User added successfully!");
      setShowCreateModal(false);
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error adding user:", err);
      alert("Failed to create user: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  /* --------------------
     EDIT USER HANDLERS
     -------------------- */
  const openEditModal = (u: User) => {
    setEditUser({
      ...u,
      permissions: {
        manageUsers: !!u.permissions?.manageUsers,
        viewSales: !!u.permissions?.viewSales,
        editSales: !!u.permissions?.editSales,
        managePumps: !!u.permissions?.managePumps,
        manageTestFuel: !!u.permissions?.manageTestFuel,
      } as Permissions,
    });
    setEditPassword("");
    setShowEditModal(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editUser) return;
    const { name, value, type } = e.target as HTMLInputElement;

    if (name.startsWith("perm_")) {
      const permKey = name.replace("perm_", "") as keyof Permissions;
      setEditUser((prev) =>
        prev ? { ...prev, permissions: { ...(prev.permissions as Permissions), [permKey]: (e.target as HTMLInputElement).checked } } : prev
      );
    } else {
      setEditUser((prev) => (prev ? { ...prev, [name]: type === "select-one" ? value : value } : prev));
    }
  };

  const saveEditUser = async () => {
    if (!editUser || !editUser._id) return;
    try {
      setLoading(true);
      const payload: any = {
        username: editUser.username,
        email: editUser.email,
        role: editUser.role,
        permissions: editUser.permissions ?? {},
      };
      if (editPassword) payload.password = editPassword;

      const res = await fetch(`${BASE_URL}/api/admin/user/${editUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update user");
      }

      alert("✅ User updated!");
      setShowEditModal(false);
      setEditUser(null);
      setEditPassword("");
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error updating user:", err);
      alert("Failed to update user: " + (err.message || err));
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
      });

      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      await fetchLogs();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------
     UTILS: click outside to close modals
     -------------------- */
  const createBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setShowCreateModal(false);
    }
  };

  const editBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setShowEditModal(false);
      setEditUser(null);
    }
  };

  /* --------------------
     FILTER + SEARCH
     -------------------- */
  const filteredUsers = users.filter((u) => {
    if (filterRole !== "All" && u.role !== filterRole) return false;
    if (!searchText) return true;
    const txt = searchText.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(txt) ||
      (u.email || "").toLowerCase().includes(txt) ||
      (u.role || "").toLowerCase().includes(txt)
    );
  });

  /* --------------------
     JSX
     -------------------- */
  return (
    <div className={styles.container}>
      <h1>🛠️ Admin & Role Management</h1>

      <div className={styles.topRow}>
        <div className={styles.leftControls}>
          <button className={styles.primaryBtn} onClick={openCreateModal}>
            ➕ Create User
          </button>

          <select
            className={styles.smallSelect}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            title="Filter by role"
          >
            <option value="All">All Roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Cashier</option>
            <option>Accountant</option>
            <option>Attendant</option>
          </select>
        </div>

        <div>
          <input
            className={styles.searchInput}
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* === User Table === */}
      <section className={styles.section}>
        <h2>👥 User Accounts</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                      <td>
                        <div className={styles.permList}>
                          <span className={u.permissions?.manageUsers ? styles.permOn : styles.permOff}>MU</span>
                          <span className={u.permissions?.viewSales ? styles.permOn : styles.permOff}>VS</span>
                          <span className={u.permissions?.editSales ? styles.permOn : styles.permOff}>ES</span>
                          <span className={u.permissions?.managePumps ? styles.permOn : styles.permOff}>MP</span>
                          <span className={u.permissions?.manageTestFuel ? styles.permOn : styles.permOff}>TF</span>
                        </div>
                      </td>
                      <td>
                        <button className={styles.rowBtn} onClick={() => openEditModal(u)}>Edit</button>
                        <button className={styles.deleteButton} onClick={() => deleteUser(u._id!)} disabled={loading}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* === Action Logs === */}
      <section className={styles.section}>
        <h2>🧾 Action Logs</h2>
        {logs.length === 0 ? (
          <p>No logs yet.</p>
        ) : (
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
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.user}</td>
                    <td>{log.role}</td>
                    <td>{log.action}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ======================
          CREATE USER MODAL
         ====================== */}
      {showCreateModal && (
        <div className={styles.modalBackdrop} onClick={createBackdropClick}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <h3>Create New User</h3>

            <div className={styles.formGrid}>
              <input name="username" placeholder="Username" value={newUser.username} onChange={handleNewChange} />
              <input name="email" placeholder="Email address" value={newUser.email} onChange={handleNewChange} />
              <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleNewChange} />
              <select name="role" value={String(newUser.role)} onChange={handleNewChange}>
                <option>Admin</option>
                <option>Manager</option>
                <option>Cashier</option>
                <option>Accountant</option>
                <option>Attendant</option>
              </select>
            </div>

            <div className={styles.permGrid}>
              <label className={styles.permLabel}>
                <input name="perm_manageUsers" type="checkbox" checked={newUser.permissions.manageUsers} onChange={handleNewChange} />
                Manage Users
              </label>

              <label className={styles.permLabel}>
                <input name="perm_viewSales" type="checkbox" checked={newUser.permissions.viewSales} onChange={handleNewChange} />
                View Sales
              </label>

              <label className={styles.permLabel}>
                <input name="perm_editSales" type="checkbox" checked={newUser.permissions.editSales} onChange={handleNewChange} />
                Edit Sales
              </label>

              <label className={styles.permLabel}>
                <input name="perm_managePumps" type="checkbox" checked={newUser.permissions.managePumps} onChange={handleNewChange} />
                Manage Pumps
              </label>

              <label className={styles.permLabel}>
                <input name="perm_manageTestFuel" type="checkbox" checked={newUser.permissions.manageTestFuel} onChange={handleNewChange} />
                Manage Test Fuel
              </label>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={createUser} disabled={loading}>
                {loading ? "Saving..." : "Create User"}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================
          EDIT USER MODAL
         ====================== */}
      {showEditModal && editUser && (
        <div className={styles.modalBackdrop} onClick={editBackdropClick}>
          <div className={styles.modalForm} onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>

            <div className={styles.formGrid}>
              <input name="username" placeholder="Username" value={editUser.username} onChange={handleEditChange} />
              <input name="email" placeholder="Email address" value={editUser.email} onChange={handleEditChange} />
              <input name="password" type="password" placeholder="New Password (optional)" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
              <select name="role" value={editUser.role} onChange={handleEditChange}>
                <option>Admin</option>
                <option>Manager</option>
                <option>Cashier</option>
                <option>Accountant</option>
                <option>Attendant</option>
              </select>
            </div>

            <div className={styles.permGrid}>
              <label className={styles.permLabel}>
                <input name="perm_manageUsers" type="checkbox" checked={!!editUser.permissions?.manageUsers} onChange={handleEditChange} />
                Manage Users
              </label>

              <label className={styles.permLabel}>
                <input name="perm_viewSales" type="checkbox" checked={!!editUser.permissions?.viewSales} onChange={handleEditChange} />
                View Sales
              </label>

              <label className={styles.permLabel}>
                <input name="perm_editSales" type="checkbox" checked={!!editUser.permissions?.editSales} onChange={handleEditChange} />
                Edit Sales
              </label>

              <label className={styles.permLabel}>
                <input name="perm_managePumps" type="checkbox" checked={!!editUser.permissions?.managePumps} onChange={handleEditChange} />
                Manage Pumps
              </label>

              <label className={styles.permLabel}>
                <input name="perm_manageTestFuel" type="checkbox" checked={!!editUser.permissions?.manageTestFuel} onChange={handleEditChange} />
                Manage Test Fuel
              </label>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.saveBtn} onClick={saveEditUser} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button className={styles.cancelBtn} onClick={() => { setShowEditModal(false); setEditUser(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
