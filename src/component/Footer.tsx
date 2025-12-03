import { useState } from "react";
import "../style/Footer.css";
import logo from "../assets/Logo.png";

export default function Footer() {
  const [showQR, setShowQR] = useState(false);

  // Auto detect environment
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Target link (attendance login page)
  const attendantUrl = isLocalhost
    ? `${window.location.origin}/attendant-login`
    : "https://amarneerfuelstationfrontend.vercel.app/attendant-login";

  // LIVE QR CODE URL (no PNG required)
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    attendantUrl
  )}`;

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="logo">
            <img src={logo} alt="logo" />
            <p style={{ color: "white", marginTop: "20px" }}>
              Smart, reliable software for managing petrol pump operations end-to-end.
            </p>

            {/* Attendance Button */}
            <button
              className="discover-btn"
              style={{ marginTop: "30px" }}
              onClick={() => setShowQR(true)}
            >
              Attendance
            </button>
          </div>

          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li>Fuel Sales & POS</li>
              <li>Tank Stock Management</li>
              <li>Attendance & Payroll</li>
              <li>Accounting & Finance</li>
              <li>Reports & Dashboard</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Case Studies</h4>
            <ul>
              <li>Automated Pump Setup</li>
              <li>Real-Time UPI Sync</li>
              <li>Multi-Branch Management</li>
              <li>Fuel Stock Accuracy</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul>
              <li>Support</li>
              <li>Documentation</li>
              <li>WhatsApp</li>
              <li>Help Center</li>
            </ul>
          </div>
        </div>

        <div className="footer_bottom">
          <p className="social_media_fotter">
            <a>Instagram</a>
            <a>Facebook</a>
            <a>LinkedIn</a>
            <a>Twitter</a>
          </p>

          <div className="right_footer_text">
            <p>Let's work together</p>
            <p className="right_para_yellow">Call Aeron Digital</p>
          </div>
        </div>

        <hr />

        <p className="footer_copy">
          Copyright © 2025 Aeron Digital | Powered by Onecontributor
        </p>
      </footer>

      {/* QR POPUP */}
      {showQR && (
        <div className="qr-backdrop" onClick={() => setShowQR(false)}>
          <div className="qr-box" onClick={(e) => e.stopPropagation()}>
            <h3>Scan to Mark Attendance</h3>

            {/* LIVE QR CODE */}
            <img src={qrApi} alt="QR Code" className="qr-img" />

            <p style={{ marginTop: "12px", color: "#fff" }}>
              Or open manually:
              <br />
              <a
                href={attendantUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00d4ff" }}
              >
                {attendantUrl}
              </a>
            </p>

            <button className="qr-close-btn" onClick={() => setShowQR(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
