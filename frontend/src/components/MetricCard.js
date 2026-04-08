import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, icon, trend, suffix = '' }) {
  const isPositive = trend && trend > 0;
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <div className="metric-card-icon">{icon}</div>
        <div className="metric-card-title">{title}</div>
      </div>
      <div className="metric-card-value">{value}{suffix}</div>
      {trend !== undefined && (
        <div className={`metric-card-trend ${isPositive ? 'trend-positive' : 'trend-negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(trend)}% vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
