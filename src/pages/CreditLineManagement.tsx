import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "../style/creditline.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Vehicle = {
  vehicleNo: string;
  fuelType: "Petrol" | "Diesel";
};

type Account = {
  _id?: string;
  accountId: string;
  accountName: string;
  phoneNo: string;
  email: string;
  companyName: string;
  aadhaarNo: string;
  panNo: string;
  document?: string;
  fuelType: "Petrol" | "Diesel";
  vehicles: Vehicle[];
  creditLimit: number;
  contactPerson: string;
  totalSales?: number;
  totalPayments?: number;
  outstanding?: number;
  dueDate?: string | null;
  status?: "normal" | "overLimit" | "dueSoon" | "overdue";
  lastReminderSent?: string | null;
};

export default function CreditLineManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");

  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  const [showBillModal, setShowBillModal] = useState(false);

  const [emailSending, setEmailSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);

  const [newAccount, setNewAccount] = useState<Account>({
    accountId: "",
    accountName: "",
    phoneNo: "",
    email: "",
    companyName: "",
    aadhaarNo: "",
    panNo: "",
    fuelType: "Petrol",
    vehicles: [],
    creditLimit: 0,
    contactPerson: "",
    document: "",
  });

  const [saleData, setSaleData] = useState({
    accountId: "",
    vehicleNo: "",
    fuelType: "Petrol",
    rate: 0,
    volume: 0,
    amount: 0,
      dueDays: 15,   // ⭐ NEW FIELD

  });

  const [paymentData, setPaymentData] = useState({
    accountId: "",
    creditLimit: 0,
    outstanding: 0,
    amountPaid: 0,
    paymentMode: "Cash",
  });

  const [vehicleForm, setVehicleForm] = useState<Vehicle>({
    vehicleNo: "",
    fuelType: "Petrol",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/credit`);
      // normalize returned accounts to ensure types for frontend
      setAccounts(
        (res.data || []).map((a: any) => ({
          ...a,
          outstanding: Number(a.outstanding ?? 0),
          creditLimit: Number(a.creditLimit ?? 0),
          dueDate: a.dueDate ?? null,
          status: a.status ?? "normal",
          lastReminderSent: a.lastReminderSent ?? null,
        }))
      );
    } catch (err) {
      console.error("❌ Failed to fetch accounts:", err);
    }
  };

  /* ---------- PDF GENERATION ---------- */
  const generatePDF = () => {
    if (!selectedAcc) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date();
    const dateStr = today.toLocaleDateString();

    const clean = (n: any) => {
      try {
        return Number(String(n).replace(/[^0-9.]/g, ""));
      } catch {
        return 0;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CREDIT ACCOUNT INVOICE", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Details"]],
      body: [
        ["Account ID", selectedAcc.accountId],
        ["Name", selectedAcc.accountName],
        ["Company", selectedAcc.companyName],
        ["Phone", selectedAcc.phoneNo],
        ["Email", selectedAcc.email],
        ["Aadhaar", selectedAcc.aadhaarNo],
        ["PAN", selectedAcc.panNo],
      ],
      theme: "grid",
      headStyles: { fillColor: [40, 64, 143], textColor: 255 },
    });

    const summaryStart = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: summaryStart,
      head: [["Description", "Amount"]],
      body: [
        ["Credit Limit", `₹${clean(selectedAcc.creditLimit)}`],
        ["Outstanding", `₹${clean(selectedAcc.outstanding)}`],
      ],
      theme: "grid",
    });

    const gstStart = (doc as any).lastAutoTable.finalY + 10;
    const subTotal = clean(selectedAcc.outstanding);
    const gstRate = 18;
    const gstAmount = (subTotal * gstRate) / 100;
    const total = subTotal + gstAmount;

    autoTable(doc, {
      startY: gstStart,
      head: [["Type", "Amount"]],
      body: [
        ["Subtotal", `₹${subTotal}`],
        [`GST (${gstRate}%)`, `₹${gstAmount.toFixed(2)}`],
        ["Total Payable", `₹${total.toFixed(2)}`],
      ],
      theme: "grid",
    });

    const vehiclesStart = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: vehiclesStart,
      head: [["Vehicle Number", "Fuel Type"]],
      body: selectedAcc.vehicles.map((v) => [v.vehicleNo, v.fuelType]),
      theme: "grid",
    });

    return doc.output("blob");
  };

  const downloadPDF = () => {
    const pdf = generatePDF();
    if (!pdf) return;
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedAcc?.accountId}-bill.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- EMAIL (NEW) ---------- */
  const sendEmailWithPdf = async () => {
    try {
      if (!selectedAcc) {
        alert("No account selected");
        return;
      }
      const outstanding = Number(selectedAcc.outstanding ?? 0);
      const creditLimit = Number(selectedAcc.creditLimit ?? 0);

      if (outstanding <= creditLimit) {
        alert("Email is sent only when account is over the credit limit.");
        return;
      }

      setEmailSending(true);

      const pdfBlob = generatePDF();
      if (!pdfBlob) {
        alert("PDF generation failed");
        setEmailSending(false);
        return;
      }

      const base64PDF: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(String(reader.result));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(pdfBlob);
      });

      const payload = {
        email: selectedAcc.email,
        accountId: selectedAcc.accountId,
        pdfBase64: base64PDF,
      };

      const res = await axios.post(`${BASE_URL}/credit/send-email`, payload);

      if (res?.data?.success) {
        alert("📧 Email sent successfully!");
        // optionally update lastReminderSent or similar fields locally after send
      } else {
        console.warn("Email API response:", res?.data);
        alert("Failed to send email. Check server logs or API route.");
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      alert("Email sending failed! See console for details.");
    } finally {
      setEmailSending(false);
    }
  };

  /* ---------- REMINDER (NEW) ---------- */
  const sendReminder = async (accountId: string) => {
    try {
      setReminderSending(true);
      const res = await axios.post(`${BASE_URL}/credit/send-reminder`, {
        accountId,
      });
      if (res?.data?.success) {
        alert("🔔 Reminder sent!");
        fetchAccounts();
      } else {
        console.warn("Reminder API response:", res?.data);
        alert("Failed to send reminder.");
      }
    } catch (err) {
      console.error("Reminder error:", err);
      alert("Reminder sending failed. See console.");
    } finally {
      setReminderSending(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value } as Account));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAccount((prev) => ({ ...prev, document: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addVehicle = () => {
    if (!vehicleForm.vehicleNo.trim()) {
      alert("Enter vehicle number");
      return;
    }
    setNewAccount((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, vehicleForm],
    }));
    setShowVehicleModal(false);
  };

  const removeVehicle = (vehicleNo: string) => {
    setNewAccount((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.vehicleNo !== vehicleNo),
    }));
  };

  const addAccount = async () => {
    if (!newAccount.accountId || !newAccount.accountName) {
      alert("Please fill Account ID & Account Name");
      return;
    }
    try {
      const payload = { ...newAccount };
      const res = await axios.post(`${BASE_URL}/credit`, payload);
      setAccounts((prev) => [res.data, ...prev]);
      setShowCreditModal(false);
      setNewAccount({
        accountId: "",
        accountName: "",
        phoneNo: "",
        email: "",
        companyName: "",
        aadhaarNo: "",
        panNo: "",
        fuelType: "Petrol",
        vehicles: [],
        creditLimit: 0,
        contactPerson: "",
        document: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add account.");
    }
  };

  const handleSaleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numeric = ["rate", "volume", "amount", "dueDays"]; // 👈 include dueDays

    setSaleData((prev) => {
const updated: any = { ...prev, [name]: numeric.includes(name) ? Number(value) : value };
      const rate = Number(updated.rate);
      const volume = Number(updated.volume);
      const amount = Number(updated.amount);

      if (name === "volume") updated.amount = rate * volume;
      else if (name === "amount")
        updated.volume = rate > 0 ? amount / rate : 0;
      else if (name === "rate") updated.amount = rate * volume;

      return updated;
    });
  };

  const saveSale = async () => {
    if (!saleData.accountId || !saleData.vehicleNo) {
      alert("Select Account & Vehicle");
      return;
    }
    const payload = { ...saleData, type: "Sale",   dueDays: saleData.dueDays   // ⭐ SEND TO BACKEND
 };
    try {
      await axios.post(`${BASE_URL}/credit/transaction`, payload);
      await fetchAccounts();
      setShowSaleModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update sale");
    }
  };

  const openPaymentModal = () => {
    setPaymentData({
      accountId: "",
      creditLimit: 0,
      outstanding: 0,
      amountPaid: 0,
      paymentMode: "Cash",
    });
    setShowPaymentModal(true);
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: name === "amountPaid" ? Number(value) : value,
    }));
  };

  const selectedPaymentAccount = accounts.find(
    (a) => a.accountId === paymentData.accountId
  );

  useEffect(() => {
    if (selectedPaymentAccount) {
      setPaymentData((prev) => ({
        ...prev,
        creditLimit: selectedPaymentAccount.creditLimit,
        outstanding: selectedPaymentAccount.outstanding ?? 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData.accountId, selectedPaymentAccount]);

  const savePayment = async () => {
    if (!paymentData.accountId || paymentData.amountPaid <= 0) {
      alert("Select account & valid amount");
      return;
    }
    const payload = {
      accountId: paymentData.accountId,
      type: "Payment",
      amount: paymentData.amountPaid,
      paymentMode: paymentData.paymentMode,
    };
    try {
      await axios.post(`${BASE_URL}/credit/transaction`, payload);
      await fetchAccounts();
      setShowPaymentModal(false);
    } catch (err) {
      alert("Payment failed");
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const query = search.toLowerCase();
    return (
      acc.accountId.toLowerCase().includes(query) ||
      acc.accountName.toLowerCase().includes(query) ||
      acc.phoneNo.toLowerCase().includes(query) ||
      acc.email.toLowerCase().includes(query) ||
      acc.companyName.toLowerCase().includes(query) ||
      acc.aadhaarNo.toLowerCase().includes(query) ||
      acc.panNo.toLowerCase().includes(query) ||
      acc.vehicles.some((v) => v.vehicleNo.toLowerCase().includes(query))
    );
  });

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "-";

  const renderStatusBadge = (acc: Account) => {
    const status = acc.status ?? "normal";
    const cls =
      status === "normal"
        ? `${styles.statusBadge} ${styles.statusNormal}`
        : status === "overLimit"
        ? `${styles.statusBadge} ${styles.statusOverLimit}`
        : status === "dueSoon"
        ? `${styles.statusBadge} ${styles.statusDueSoon}`
        : `${styles.statusBadge} ${styles.statusOverdue}`;
    const text =
      status === "normal"
        ? "Normal"
        : status === "overLimit"
        ? "Over Limit"
        : status === "dueSoon"
        ? "Due Soon"
        : "Overdue";
    return (
      <span className={cls} title={`Due Date: ${formatDate(acc.dueDate)}`}>
        {text}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <h1>Credit Line System</h1>

      <div className={styles.topBar}>
        <div className={styles.topButtons}>
          <input
            type="text"
            className={styles.searchBar}
            placeholder="Search accounts (ID, Name, Phone, Aadhaar, PAN, Vehicle...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setShowCreditModal(true)}>
            Add Credit Account
          </button>
          <button onClick={() => setShowSaleModal(true)}>Update Sale</button>
          <button onClick={openPaymentModal}>Update Payment</button>
        </div>
      </div>

      <h2>Accounts List</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>Credit Limit</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc._id}>
                <td>{acc.accountId}</td>
                <td>{acc.accountName}</td>
                <td>{acc.companyName}</td>
                <td>{acc.phoneNo}</td>
                <td>{acc.aadhaarNo}</td>
                <td>{acc.panNo}</td>
                <td>{acc.creditLimit}</td>
                <td
                  style={{
                    color:
                      (acc.outstanding ?? 0) > (acc.creditLimit ?? 0)
                        ? "red"
                        : "green",
                  }}
                >
                  {acc.outstanding}
                </td>
                <td>{renderStatusBadge(acc)}</td>
                <td>{formatDate(acc.dueDate)}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => {
                      setSelectedAcc(acc);
                      setShowViewModal(true);
                    }}
                  >
                    View Account
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedAcc && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowViewModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowViewModal(false)}
            >
              ✖
            </button>

            <h2>Account Details</h2>

            <p>
              <b>ID:</b> {selectedAcc.accountId}
            </p>
            <p>
              <b>Name:</b> {selectedAcc.accountName}
            </p>
            <p>
              <b>Company:</b> {selectedAcc.companyName}
            </p>
            <p>
              <b>Phone:</b> {selectedAcc.phoneNo}
            </p>
            <p>
              <b>Email:</b> {selectedAcc.email}
            </p>
            <p>
              <b>Aadhaar:</b> {selectedAcc.aadhaarNo}
            </p>
            <p>
              <b>PAN:</b> {selectedAcc.panNo}
            </p>

            <p>
              <b>Credit Limit:</b> ₹{selectedAcc.creditLimit}
            </p>

            <p>
              <b>Outstanding:</b>{" "}
              <span
                style={{
                  color:
                    (selectedAcc.outstanding ?? 0) >
                    (selectedAcc.creditLimit ?? 0)
                      ? "red"
                      : "green",
                }}
              >
                ₹{selectedAcc.outstanding}
              </span>
            </p>

            <p>
              <b>Status:</b> {renderStatusBadge(selectedAcc)}
            </p>

            <p>
              <b>Due Date:</b> {formatDate(selectedAcc.dueDate)}
            </p>

            <p>
              <b>Last Reminder:</b>{" "}
              {selectedAcc.lastReminderSent
                ? new Date(selectedAcc.lastReminderSent).toLocaleString()
                : "-"}
            </p>

            <h3>Vehicles</h3>
            {selectedAcc.vehicles?.map((v) => (
              <p key={v.vehicleNo}>
                {v.vehicleNo} ({v.fuelType})
              </p>
            ))}

            {(selectedAcc.outstanding ?? 0) >
              (selectedAcc.creditLimit ?? 0) && (
              <>
                <hr />
                <button
                  className={styles.billBtn}
                  onClick={() => setShowBillModal(true)}
                >
                  Generate Bill
                </button>
                <button
                  className={styles.billBtn}
                  style={{ marginLeft: 10 }}
                  onClick={() => sendReminder(selectedAcc.accountId)}
                  disabled={reminderSending}
                  title="Send reminder email for this account"
                >
                  {reminderSending ? "Sending..." : "🔔 Send Reminder"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {showBillModal && selectedAcc && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowBillModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowBillModal(false)}
            >
              ✖
            </button>

            <h2>Bill Summary</h2>

            <p>
              <b>Bill Date:</b> {new Date().toLocaleDateString()}
            </p>
            <p>
              <b>Account ID:</b> {selectedAcc.accountId}
            </p>
            <p>
              <b>Name:</b> {selectedAcc.accountName}
            </p>
            <p>
              <b>Company:</b> {selectedAcc.companyName}
            </p>
            <p>
              <b>Phone:</b> {selectedAcc.phoneNo}
            </p>
            <p>
              <b>Email:</b> {selectedAcc.email}
            </p>

            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Credit Limit</td>
                  <td>₹{selectedAcc.creditLimit}</td>
                </tr>

                <tr
                  style={{
                    color:
                      (selectedAcc.outstanding ?? 0) >
                      (selectedAcc.creditLimit ?? 0)
                        ? "red"
                        : "green",
                  }}
                >
                  <td>Outstanding</td>
                  <td>₹{selectedAcc.outstanding}</td>
                </tr>

                {(() => {
                  const subTotal = Number(selectedAcc.outstanding ?? 0);
                  const gstAmount = subTotal * 0.18;
                  const total = subTotal + gstAmount;
                  return (
                    <>
                      <tr>
                        <td>GST (18%)</td>
                        <td>₹{gstAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>Total Payable</b>
                        </td>
                        <td>
                          <b>₹{total.toFixed(2)}</b>
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>

            <h3>Vehicles Used</h3>
            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Fuel Type</th>
                </tr>
              </thead>

              <tbody>
                {selectedAcc.vehicles.map((v) => (
                  <tr key={v.vehicleNo}>
                    <td>{v.vehicleNo}</td>
                    <td>{v.fuelType}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />

            <button className={styles.billBtn} onClick={downloadPDF}>
              ⬇ Download PDF
            </button>

            <button
              className={styles.billBtn}
              onClick={sendEmailWithPdf}
              disabled={emailSending}
              title="Send PDF to registered email (only when outstanding > credit limit)"
              style={{ marginLeft: 10 }}
            >
              {emailSending ? "Sending..." : "📧 Send Email"}
            </button>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {showCreditModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowCreditModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowCreditModal(false)}
            >
              ✖
            </button>

            <h2>Add Credit Account</h2>

            <label>Account ID</label>
            <input
              name="accountId"
              value={newAccount.accountId}
              onChange={handleAccountChange}
            />

            <label>Account Name</label>
            <input
              name="accountName"
              value={newAccount.accountName}
              onChange={handleAccountChange}
            />

            <label>Phone</label>
            <input
              name="phoneNo"
              value={newAccount.phoneNo}
              onChange={handleAccountChange}
            />

            <label>Email</label>
            <input
              name="email"
              value={newAccount.email}
              onChange={handleAccountChange}
            />

            <label>Company Name</label>
            <input
              name="companyName"
              value={newAccount.companyName}
              onChange={handleAccountChange}
            />

            <label>Aadhaar No</label>
            <input
              name="aadhaarNo"
              value={newAccount.aadhaarNo}
              onChange={handleAccountChange}
            />

            <label>PAN No</label>
            <input
              name="panNo"
              value={newAccount.panNo}
              onChange={handleAccountChange}
            />

            <label>Upload Document</label>
            <input
              type="file"
              onChange={handleDocumentUpload}
              className={styles.fullRow}
            />

            <label>Fuel Type</label>
            <select
              name="fuelType"
              value={newAccount.fuelType}
              onChange={handleAccountChange}
            >
              <option>Petrol</option>
              <option>Diesel</option>
            </select>

            <label>Credit Limit</label>
            <input
              name="creditLimit"
              type="number"
              value={newAccount.creditLimit}
              onChange={handleAccountChange}
            />

            <label>Contact Person</label>
            <input
              name="contactPerson"
              value={newAccount.contactPerson}
              onChange={handleAccountChange}
            />

            <button
              className={styles.addVehicleBtn}
              onClick={() => setShowVehicleModal(true)}
            >
              + Add Vehicle
            </button>

            <div className={styles.vehicleList}>
              {newAccount.vehicles.map((v) => (
                <p key={v.vehicleNo}>
                  {v.vehicleNo} ({v.fuelType})
                  <button
                    className={styles.deleteBtnSmall}
                    onClick={() => removeVehicle(v.vehicleNo)}
                  >
                    X
                  </button>
                </p>
              ))}
            </div>

            <button className={styles.submitBtn} onClick={addAccount}>
              Save Account
            </button>
          </div>
        </div>
      )}

      {/* SALE MODAL */}
      {showSaleModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowSaleModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowSaleModal(false)}
            >
              ✖
            </button>

            <h2>Update Sale</h2>

            <label>Account</label>
            <select
              name="accountId"
              value={saleData.accountId}
              onChange={handleSaleChange}
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc.accountId}>
                  {acc.accountId} — {acc.accountName}
                </option>
              ))}
            </select>

            <label>Vehicle</label>
            <select
              name="vehicleNo"
              value={saleData.vehicleNo}
              onChange={handleSaleChange}
            >
              <option value="">Select Vehicle</option>
              {accounts
                .find((a) => a.accountId === saleData.accountId)
                ?.vehicles.map((v) => (
                  <option key={v.vehicleNo} value={v.vehicleNo}>
                    {v.vehicleNo}
                  </option>
                ))}
            </select>

            <button
              className={styles.addVehicleBtn}
              onClick={() => setShowVehicleModal(true)}
            >
              + Add Vehicle
            </button>

            <label>Fuel Type</label>
            <select
              name="fuelType"
              value={saleData.fuelType}
              onChange={handleSaleChange}
            >
              <option>Petrol</option>
              <option>Diesel</option>
            </select>

            <label>Rate</label>
            <input
              name="rate"
              type="number"
              value={saleData.rate}
              onChange={handleSaleChange}
            />

            <label>Volume (L)</label>
            <input
              name="volume"
              type="number"
              value={saleData.volume}
              onChange={handleSaleChange}
            />

            <label>Total Amount</label>
            <input
              name="amount"
              type="number"
              value={saleData.amount}
              onChange={handleSaleChange}
            />

<label>Due Days</label>
<input
  name="dueDays"
  type="number"
  value={saleData.dueDays}
  onChange={handleSaleChange}
/>

            <button className={styles.submitBtn} onClick={saveSale}>
              Submit Sale
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowPaymentModal(false)}
            >
              ✖
            </button>

            <h2>Update Payment</h2>

            <label>Account</label>
            <select
              name="accountId"
              value={paymentData.accountId}
              onChange={handlePaymentChange}
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc.accountId}>
                  {acc.accountId} — {acc.accountName}
                </option>
              ))}
            </select>

            <label>Credit Limit</label>
            <input value={paymentData.creditLimit} disabled />

            <label>Outstanding</label>
            <input value={paymentData.outstanding} disabled />

            <label>Paying Amount</label>
            <input
              name="amountPaid"
              type="number"
              value={paymentData.amountPaid}
              onChange={handlePaymentChange}
            />

            <label>Payment Mode</label>
            <select
              name="paymentMode"
              value={paymentData.paymentMode}
              onChange={handlePaymentChange}
            >
              <option>Cash</option>
              <option>Card</option>
              <option>UPI</option>
            </select>

            <label>New Outstanding</label>
            <input
              value={(paymentData.outstanding ?? 0) - (paymentData.amountPaid ?? 0)}
              disabled
              className={
                paymentData.amountPaid >= (paymentData.outstanding ?? 0)
                  ? styles.green
                  : styles.red
              }
            />

            <button className={styles.submitBtn} onClick={savePayment}>
              Submit Payment
            </button>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowVehicleModal(false)}>
          <div className={`${styles.modal} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowVehicleModal(false)}>✖</button>

            <h3>Add Vehicle</h3>

            <label>Vehicle Number</label>
            <input value={vehicleForm.vehicleNo} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNo: e.target.value })} />

            <label>Fuel Type</label>
            <select value={vehicleForm.fuelType} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value as "Petrol" | "Diesel" })}>
              <option>Petrol</option>
              <option>Diesel</option>
            </select>

            <button style={{ padding: "10px 11px", display: "flex", justifyContent: "center", marginTop: "10px" }} onClick={addVehicle}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
