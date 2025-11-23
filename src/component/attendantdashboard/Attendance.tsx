import styles from "../../style/attendantdashboard/attendance.module.css";

type Attendance = {
  date: string;
  shift: string;
  inTime: string;
  outTime?: string;
  status: string;
  overtimeHours?: number;
};

interface Props {
  records: Attendance[];
}

export default function Attendance({ records }: Props) {
  return (
    <div className={styles.box}>
      <h3 className={styles.title}>🗓 My Attendance</h3>

      {records.length === 0 ? (
        <p className={styles.empty}>No attendance found.</p>
      ) : (
        <ul className={styles.list}>
          {records.map((a, i) => (
            <li key={i} className={styles.item}>
              <div>
                <span className={styles.date}>{a.date}</span>
                <span className={styles.shift}>Shift {a.shift}</span>
              </div>
              <div className={styles.times}>
                IN: {a.inTime} — OUT: {a.outTime ?? "-"}
              </div>
              <span className={styles.status}>{a.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
