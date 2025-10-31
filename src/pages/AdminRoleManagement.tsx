import { useEffect, useState } from "react";
import api from "../utils/api";
import styles from "../style/adminRole.module.css";

type User = {
  _id?: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
};

type Log = {
  _id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
};

export default function AdminRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Attendant",
  });

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/api/admin/users");
    setUsers(res.data);
  };

  const fetchLogs = async () => {
    const res = await api.get("/api/admin/logs");
    setLogs(res.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const addUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Please fill all required fields");
      return;
    }
    await api.post("/api/admin/user", { ...newUser, performedBy: "Admin" });
    alert("User added successfully!");
    fetchUsers();
    fetchLogs();
    setNewUser({ username: "", email: "", password: "", role: "Attendant" });
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await api.delete(`/api/admin/user/${id}`);
    fetchUsers();
    fetchLogs();
  };

  return (
    <div className={styles.container}>
      <h1>🛠️ Admin & Role Management</h1>

      {/* Create New User */}
      <section className={styles.section}>
        <h2>➕ Create User</h2>
        <div className={styles.formGrid}>
          <input name="username" placeholder="Username" value={newUser.username} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email Address" value={newUser.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleChange} />
          <select name="role" value={newUser.role} onChange={handleChange}>
            <option>Admin</option>
            <option>Manager</option>
            <option>Cashier</option>
            <option>Accountant</option>
            <option>Attendant</option>
          </select>
        </div>
        <button onClick={addUser} className={styles.addButton}>Create User</button>
      </section>

      {/* User Table */}
      <section className={styles.section}>
        <h2>👥 User Accounts</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt || "").toLocaleString()}</td>
                <td>
                  <button className={styles.deleteButton} onClick={() => deleteUser(u._id!)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Action Logs */}
      <section className={styles.section}>
        <h2>🧾 Action Logs</h2>
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
            {logs.map(log => (
              <tr key={log._id}>
                <td>{log.user}</td>
                <td>{log.role}</td>
                <td>{log.action}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
