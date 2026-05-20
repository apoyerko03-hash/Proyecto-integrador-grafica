import { motion } from 'framer-motion'

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'accent',
  trend = null,
  unit = '',
  description = ''
}) => {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent',
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card-dark rounded-xl p-6 border border-border-color shadow-card hover:shadow-hover transition"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          {description && (
            <p className="text-text-secondary text-xs mt-1 opacity-70">{description}</p>
          )}
        </div>
        <motion.div
          className={`p-3 rounded-lg ${colorClasses[color]}`}
          whileHover={{ rotate: 10 }}
        >
          <Icon size={24} />
        </motion.div>
      </div>

      {/* Valor */}
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-text-light">{value}</h3>
        {unit && <span className="text-text-secondary text-sm">{unit}</span>}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`mt-3 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs período anterior
        </div>
      )}
    </motion.div>
  )
}

export default KPICard
