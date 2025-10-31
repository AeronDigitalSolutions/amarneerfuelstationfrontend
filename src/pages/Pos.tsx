import { useState } from "react";
import axios from "axios";

export default function Pos() {
  const [liters, setLiters] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const total = liters * unitPrice;

  async function handleSale() {
    try {
      await axios.post("http://localhost:4000/api/sales", {
        liters,
        unitPrice,
        paymentType: "cash",
      });
      alert("✅ Sale recorded successfully!");
    } catch (err) {
      alert("❌ Error saving sale");
      console.error(err);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto border rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-semibold text-center">POS Screen</h1>
      <input
        type="number"
        placeholder="Liters"
        value={liters}
        onChange={(e) => setLiters(Number(e.target.value))}
        className="border p-2 w-full rounded"
      />
      <input
        type="number"
        placeholder="Price per liter"
        value={unitPrice}
        onChange={(e) => setUnitPrice(Number(e.target.value))}
        className="border p-2 w-full rounded"
      />
      <div className="text-lg font-medium text-center">
        Total: ₹{total.toFixed(2)}
      </div>
      <button
        onClick={handleSale}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        Complete Sale
      </button>
    </div>
  );
}
