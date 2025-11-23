import styles from "../../style/attendantdashboard/salarysummary.module.css";

interface SalarySummary {
  salaryType: string;
  baseSalary: number;
  daysPresent?: number;
  shiftsThisMonth?: number;
  estimatedEarned: number;
}

interface Props {
  summary: SalarySummary | null;
}

export default function SalarySummary({ summary }: Props) {
  if (!summary) return (
    <div className={styles.box}>
      <h3 className={styles.title}>💵 Salary Summary</h3>
      <p className={styles.empty}>No salary info found.</p>
    </div>
  );

  return (
    <div className={styles.box}>
      <h3 className={styles.title}>💵 Salary Summary</h3>

      <div className={styles.row}>
        <span>Salary Type:</span>
        <strong>{summary.salaryType}</strong>
      </div>

      <div className={styles.row}>
        <span>Base Salary:</span>
        <strong>₹{summary.baseSalary}</strong>
      </div>

      {summary.salaryType === "Monthly" ? (
        <div className={styles.row}>
          <span>Days Present:</span>
          <strong>{summary.daysPresent}</strong>
        </div>
      ) : (
        <div className={styles.row}>
          <span>Shifts This Month:</span>
          <strong>{summary.shiftsThisMonth}</strong>
        </div>
      )}

      <div className={styles.total}>
        Estimated Earned:  
        <strong>₹{summary.estimatedEarned}</strong>
      </div>
    </div>
  );
}
