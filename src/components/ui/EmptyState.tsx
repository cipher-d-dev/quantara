interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="text-surface-300 dark:text-surface-700 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
