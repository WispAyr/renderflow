import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  icon?: ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  className,
}: StatCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    flat: 'text-gray-500',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={cn('card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColors[trend])}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
