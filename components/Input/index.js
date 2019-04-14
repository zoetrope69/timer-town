import styles from  "./style";

const Input = ({
  type,
  id,
  label,
  options,
  value,
  disabled,
  onChange,
  onFocus
}) => (
  <div class={styles.input}>
    <label class={styles["input__label"]} for={id}>
      {label}
    </label>

    {type === 'number' && (
      <input
        id={id}
        class={styles["input__field"]}
        type="number"
        min="1"
        step="1"
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        value={value}
      />
    )}
    
    {type === 'select' && (
      <select
        id={id}
        class={styles["input__select"]}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map(option => (
          <option value={option.value} selected={value === option.value}>
            {option.text} <span aria-hidden="true">{option.icon}</span>
          </option>
        ))}
      </select>
    )}
  </div>
);

export default Input;
