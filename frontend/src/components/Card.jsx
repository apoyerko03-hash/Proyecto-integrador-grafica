export default function Card({ title, children, className = '', icon }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          {icon && <div className="card-icon">{icon}</div>}
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
