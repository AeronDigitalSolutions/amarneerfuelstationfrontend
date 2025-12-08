// src/components/GlobalLoader/GlobalLoader.tsx
import  { useEffect, useState } from "react";
import { useLoader } from "../../context/LoadingContext";
import styles from "../../style/GlobalLoader.module.css";

export default function GlobalLoader() {
  const { activeCount } = useLoader();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // small debounce so overlay doesn't flicker when activeCount toggles quickly
    let t: number | undefined;
    if (activeCount > 0) {
      setVisible(true);
    } else {
      // hide after short delay to allow UI updates to settle
      t = window.setTimeout(() => setVisible(false), 200);
    }
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [activeCount]);

  if (!visible) return null;

  return (
    <div className={styles.backdrop} role="status" aria-live="polite">
      <div className={styles.loaderBox}>
        <div className={styles.spinner} aria-hidden />
        <div className={styles.message}>
          Loading… <small className={styles.sub}>Please wait — fetching data</small>
        </div>
      </div>
    </div>
  );
}
