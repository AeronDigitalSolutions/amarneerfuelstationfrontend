import styles from "../../style/attendantdashboard/shift.module.css";

type Shift = {
  shiftName: string;
  startTime: string;
  endTime: string;
};

interface Props {
  shifts: Shift[];
}

export default function Shift({ shifts }: Props) {
  return (
    <div className={styles.box}>
      <h3 className={styles.title}>⏱ My Shifts</h3>

      {shifts.length === 0 ? (
        <p className={styles.empty}>No shift data available.</p>
      ) : (
        <ul className={styles.list}>
          {shifts.map((s, i) => (
            <li key={i} className={styles.item}>
              <div className={styles.shiftName}>{s.shiftName}</div>
              <div className={styles.time}>
                {s.startTime} — {s.endTime}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
