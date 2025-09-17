import { motion } from 'framer-motion';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'maintenance' | 'degraded' | 'outage';
  responseTime?: number;
}

interface SystemStatusProps {
  services: ServiceStatus[];
  className?: string;
}

const statusConfig = {
  operational: {
    color: 'green',
    icon: '✓',
    label: 'Opérationnel',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-600',
    dotClass: 'bg-green-500'
  },
  maintenance: {
    color: 'yellow',
    icon: '⚠',
    label: 'Maintenance',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-600',
    dotClass: 'bg-yellow-500'
  },
  degraded: {
    color: 'orange',
    icon: '⚠',
    label: 'Dégradé',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-600',
    dotClass: 'bg-orange-500'
  },
  outage: {
    color: 'red',
    icon: '✗',
    label: 'Indisponible',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    textClass: 'text-red-600',
    dotClass: 'bg-red-500'
  }
};

export default function SystemStatus({ services, className = '' }: SystemStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">État des services</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => {
          const config = statusConfig[service.status];
          
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                ${config.bgClass} ${config.borderClass}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${config.dotClass} rounded-full animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-900">{service.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${config.textClass}`}>
                  {config.label}
                </span>
                {service.responseTime && (
                  <span className="text-xs text-gray-500">
                    {service.responseTime}ms
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
