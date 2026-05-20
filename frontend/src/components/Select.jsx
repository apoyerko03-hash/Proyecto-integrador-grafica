export default function Select({ label, value, onChange, options, required = false, name }) {
  return (
    <div className="input-group">
      <label className="input-label">
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <select name={name} value={value} onChange={onChange} required={required} className="input-field">
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
