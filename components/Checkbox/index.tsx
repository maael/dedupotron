import classnames from 'classnames';
import styles from './styles.module.css';

export default function Checkbox({
  type = 'rectangular',
  value,
  setValue,
  label
}: {
  type?: "rectangular" | "circular";
  value: boolean;
  setValue: (newValue: boolean) => void;
  label: string
}) {
  return (
    <div className={styles.checkboxContainer}>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={value} onChange={() => setValue(!value)} />
        <span className={classnames(styles.checkboxCustom, styles[type])} />
      </label>
      <div className={styles.inputTitle}>{label}</div>
    </div>
  );
}
