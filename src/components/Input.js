export default function Input({ label, type = 'text', value, onChange, placeholder, required = false, name }) {
  return (
    <div className="input-group">
      <label className="input-label">
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
}
