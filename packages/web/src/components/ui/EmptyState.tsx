import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'No items found',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="p-4 bg-dark-100 rounded-2xl text-gray-500 mb-4">
        {icon || <Package className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-gray-400 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
