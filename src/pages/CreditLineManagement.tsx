import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import styles from "../style/creditline.module.css";
import autoTable from "jspdf-autotable";

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
  document?: string; // Base64

  fuelType: "Petrol" | "Diesel";
  vehicles: Vehicle[];

  creditLimit: number;
  contactPerson: string;

  totalSales?: number;
  totalPayments?: number;
  outstanding?: number;
};

export default function CreditLineManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Modal visibility
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // View Account
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  // NEW: Bill Modal
  const [showBillModal, setShowBillModal] = useState(false);

  const openViewModal = (acc: Account) => {
    setSelectedAcc(acc);
    setShowViewModal(true);
  };

  // Credit form state
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

  // Sale form state
  const [saleData, setSaleData] = useState({
    accountId: "",
    vehicleNo: "",
    fuelType: "Petrol",
    rate: 0,
    volume: 0,
    amount: 0,
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    accountId: "",
    creditLimit: 0,
    outstanding: 0,
    amountPaid: 0,
    paymentMode: "Cash",
  });

  // Add-vehicle modal state
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
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch accounts:", err);
    }
  };

  /* ✅ GENERATE PDF BILL */

const generatePDF = () => {
  if (!selectedAcc) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date();
  const dateStr = today.toLocaleDateString();

  // ✅ clean numbers to avoid superscript characters
  const clean = (n: any) => {
    try {
      return Number(String(n).replace(/[^0-9.]/g, ""));
    } catch {
      return 0;
    }
  };

  /* ---------- HEADER ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CREDIT ACCOUNT INVOICE", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${dateStr}`, 14, 25);

  /* ---------- ACCOUNT INFO ---------- */
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
    bodyStyles: { textColor: 20 },
  });

  /* ---------- CREDIT SUMMARY ---------- */
  const summaryStart = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: summaryStart,
    head: [["Description", "Amount"]],
    body: [
      ["Credit Limit", `₹${clean(selectedAcc.creditLimit)}`],
      ["Outstanding", `₹${clean(selectedAcc.outstanding)}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [40, 64, 143], textColor: 255 },
    bodyStyles: {
      textColor:
        clean(selectedAcc.outstanding) > clean(selectedAcc.creditLimit)
          ? [200, 0, 0] // red
          : [0, 150, 0], // green
    },
  });

  /* ---------- GST + TOTAL ---------- */
  const gstStart = (doc as any).lastAutoTable.finalY + 10;

  const subTotal = clean(selectedAcc.outstanding);
  const gstRate = 18;
  const gstAmount = (subTotal * gstRate) / 100;
  const total = subTotal + gstAmount;

  autoTable(doc, {
    startY: gstStart,
    head: [["Type", "Amount"]],
    body: [
      ["Subtotal", `₹${subTotal.toFixed(2)}`],
      [`GST (${gstRate}%)`, `₹${gstAmount.toFixed(2)}`],
      ["Total Payable", `₹${total.toFixed(2)}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [40, 64, 143], textColor: 255 },
    bodyStyles: { textColor: 20 },
  });

  /* ---------- VEHICLE LIST ---------- */
  const vehiclesStart = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: vehiclesStart,
    head: [["Vehicle Number", "Fuel Type"]],
    body:
      selectedAcc?.vehicles?.map((v) => [v.vehicleNo, v.fuelType]) ?? [
        ["N/A", "N/A"],
      ],
    theme: "grid",
    headStyles: { fillColor: [40, 64, 143], textColor: 255 },
    bodyStyles: { textColor: 20 },
  });

  /* ---------- FOOTER ---------- */
  const footerY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Thank you for your business.\nPlease clear dues at the earliest.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc.output("blob");
};
  /* ✅ DOWNLOAD PDF */
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

  /* CREDIT: change handlers */
  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
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

  const openVehicleModal = () => {
    setVehicleForm({ vehicleNo: "", fuelType: "Petrol" });
    setShowVehicleModal(true);
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
      const payload = {
        ...newAccount,
        vehicles: newAccount.vehicles,
        document: newAccount.document ?? "",
      };

      const res = await axios.post(`${BASE_URL}/credit`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setAccounts((prev) => [res.data, ...prev]);
      alert("✅ Credit account created!");

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

      setShowCreditModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add account.");
    }
  };

  const handleSaleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setSaleData((prev) => {
      const updated: any = { ...prev, [name]: value };

      const rate = Number(updated.rate);
      const volume = Number(updated.volume);
      const amount = Number(updated.amount);

      if (name === "volume") updated.amount = rate * volume;
      else if (name === "amount") updated.volume = rate > 0 ? amount / rate : 0;
      else if (name === "rate") updated.amount = rate * volume;

      return updated;
    });
  };

  const saveSale = async () => {
    if (!saleData.accountId || !saleData.vehicleNo) {
      alert("Select Account & Vehicle");
      return;
    }

    const payload = {
      accountId: saleData.accountId,
      type: "Sale",
      amount: saleData.amount,
      vehicleNo: saleData.vehicleNo,
      fuelType: saleData.fuelType,
      rate: saleData.rate,
      volume: saleData.volume,
    };

    try {
      await axios.post(`${BASE_URL}/credit/transaction`, payload);
      alert("✅ Sale updated!");
      fetchAccounts();
      setSaleData({
        accountId: "",
        vehicleNo: "",
        fuelType: "Petrol",
        rate: 0,
        volume: 0,
        amount: 0,
      });
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
    } else {
      setPaymentData((prev) => ({
        ...prev,
        creditLimit: 0,
        outstanding: 0,
      }));
    }
  }, [paymentData.accountId]);

  const savePayment = async () => {
    if (!paymentData.accountId || paymentData.amountPaid <= 0) {
      alert("Select account & enter valid amount");
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
      alert("✅ Payment updated!");
      fetchAccounts();
      setShowPaymentModal(false);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  const newOutstandingPreview =
    (selectedPaymentAccount?.outstanding ?? 0) - (paymentData.amountPaid || 0);
  const previewClass =
    paymentData.amountPaid >= (selectedPaymentAccount?.outstanding ?? 0)
      ? styles.green
      : styles.red;

  return (
    <div className={styles.container}>
      <h1>Credit Line System</h1>

      {/* ACTION BUTTONS ABOVE LIST */}
      <div className={styles.topButtons}>
        <button onClick={() => setShowCreditModal(true)}>Add Credit Account</button>
        <button onClick={() => setShowSaleModal(true)}>Update Sale</button>
        <button onClick={openPaymentModal}>Update Payment</button>
      </div>

      {/* LIST BELOW BUTTONS */}
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
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
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

                {/* VIEW BUTTON */}
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => openViewModal(acc)}
                  >
                    View Account
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW ACCOUNT MODAL */}
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

            <p><b>ID:</b> {selectedAcc.accountId}</p>
            <p><b>Name:</b> {selectedAcc.accountName}</p>
            <p><b>Company:</b> {selectedAcc.companyName}</p>
            <p><b>Phone:</b> {selectedAcc.phoneNo}</p>
            <p><b>Email:</b> {selectedAcc.email}</p>
            <p><b>Aadhaar:</b> {selectedAcc.aadhaarNo}</p>
            <p><b>PAN:</b> {selectedAcc.panNo}</p>

            <p><b>Credit Limit:</b> ₹{selectedAcc.creditLimit}</p>

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

            <h3>Vehicles</h3>
            {selectedAcc.vehicles?.map((v) => (
              <p key={v.vehicleNo}>
                {v.vehicleNo} ({v.fuelType})
              </p>
            ))}

            {/* When over limit, show only "Generate Bill" */}
            {(selectedAcc.outstanding ?? 0) > (selectedAcc.creditLimit ?? 0) && (
              <>
                <hr />
                <button
                  className={styles.billBtn}
                  onClick={() => setShowBillModal(true)}
                >
                  Generate Bill
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* ✅ BILL MODAL */}
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

      <p><b>Bill Date:</b> {new Date().toLocaleDateString()}</p>

      <p><b>Account ID:</b> {selectedAcc.accountId}</p>
      <p><b>Name:</b> {selectedAcc.accountName}</p>
      <p><b>Company:</b> {selectedAcc.companyName}</p>
      <p><b>Phone:</b> {selectedAcc.phoneNo}</p>
      <p><b>Email:</b> {selectedAcc.email}</p>

      {/* ✅ BILL DETAILS TABLE */}
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

          {/* ✅ GST + TOTAL */}
          {(() => {
            const subTotal = Number(selectedAcc.outstanding ?? 0);
            const gstRate = 18;
            const gstAmount = (subTotal * gstRate) / 100;
            const total = subTotal + gstAmount;

            return (
              <>
                <tr>
                  <td>GST (18%)</td>
                  <td>₹{gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td><b>Total Payable</b></td>
                  <td><b>₹{total.toFixed(2)}</b></td>
                </tr>
              </>
            );
          })()}
        </tbody>
      </table>

      {/* ✅ VEHICLE TABLE */}
      <h3>Vehicles Used</h3>
      <table className={styles.billTable}>
        <thead>
          <tr>
            <th>Vehicle Number</th>
            <th>Fuel Type</th>
          </tr>
        </thead>

        <tbody>
          {selectedAcc.vehicles?.map((v) => (
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

      <button className={styles.billBtn} disabled>
        📧 Send Email (Coming Soon)
      </button>
    </div>
  </div>
)}


      {/* CREDIT MODAL */}
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
              aria-label="Close"
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
            <input type="file" onChange={handleDocumentUpload} className={styles.fullRow} />

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

            <button className={styles.addVehicleBtn} onClick={openVehicleModal}>
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
              aria-label="Close"
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

            <button className={styles.addVehicleBtn} onClick={openVehicleModal}>
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

            <label>Current Rate</label>
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
              aria-label="Close"
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

            <label>Current Outstanding</label>
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

            <label>New Outstanding (after payment)</label>
            <input
              value={
                Number.isFinite(newOutstandingPreview) ? newOutstandingPreview : ""
              }
              disabled
              className={previewClass}
            />

            <button className={styles.submitBtn} onClick={savePayment}>
              Submit Payment
            </button>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowVehicleModal(false)}
        >
          <div
            className={`${styles.modal} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowVehicleModal(false)}
              aria-label="Close"
            >
              ✖
            </button>

            <h3>Add Vehicle</h3>

            <label>Vehicle Number</label>
            <input
              value={vehicleForm.vehicleNo}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, vehicleNo: e.target.value })
              }
            />

            <label>Fuel Type</label>
            <select
              value={vehicleForm.fuelType}
              onChange={(e) =>
                setVehicleForm({
                  ...vehicleForm,
                  fuelType: e.target.value as "Petrol" | "Diesel",
                })
              }
            >
              <option>Petrol</option>
              <option>Diesel</option>
            </select>

            <button onClick={addVehicle}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
