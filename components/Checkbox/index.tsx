import { CSSProperties } from 'react';
import classnames from 'classnames';
import styles from './styles.module.css';

export default function Checkbox({
  type = 'rectangular',
  value,
  setValue,
  label,
  style
}: {
  type?: "rectangular" | "circular";
  value: boolean;
  setValue: (newValue: boolean) => void;
  label: string
  style?: CSSProperties
}) {
  return (
    <div className={styles.checkboxContainer} style={style}>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={value} onChange={() => setValue(!value)} />
        <span className={classnames(styles.checkboxCustom, styles[type])} />
      </label>
      <div className={styles.inputTitle}>{label}</div>
    </div>
  );
}
