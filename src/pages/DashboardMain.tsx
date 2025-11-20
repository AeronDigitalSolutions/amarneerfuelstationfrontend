import { Link } from "react-router-dom";


export default function DashboardMain() {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-4">🏭 Petrol Pump Dashboard</h1>
      <p className="text-gray-700 mb-4">Welcome! Choose a section to begin.</p>
      <Link
        to="/pos"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go to POS
      </Link> 


      <Link
        to="/saleentry"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p>  Go to Sale Entry</p>
      </Link>


       <Link
        to="/tanks"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Tank Management</p>
      </Link>


       <Link
        to="/finance"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Accounting Finnace</p>
      </Link>


      
       <Link
        to="/attendance"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Attendance Payroll</p>
      </Link>



             <Link
        to="/creditline"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Credit Line</p>
      </Link>

        <Link
        to="/admin"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Admin</p>
      </Link>

      <Link
        to="/dash"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Dashboard</p>
      </Link>



      <Link
        to="/fuelrate"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Fuel Rates</p>
      </Link>


      
      <Link
        to="/pump"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Add Pump</p>
      </Link>



            <Link
        to="/addtank"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Add tank</p>
      </Link>



      
            <Link
        to="/testfuel"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Test Fuel</p>
      </Link>


       <Link
        to="/shift"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Add Shift</p>
      </Link>


      <Link
        to="/payment"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Add Payment</p>
      </Link>


            <Link
        to="/paymentcomp"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
      <p> Payment Comparison</p>
      </Link>
    </div>
  );
}
