export default function Button({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} ${className}`}>
      <span className="flex items-center justify-center w-full h-full">{children}</span>
    </button>
  );
}
