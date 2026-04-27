interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export function LoadingSpinner({ size = 'md', label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full border-[var(--color-border)]
          border-t-[var(--color-accent)]
          animate-spin
        `}
        aria-hidden="true"
        style={{ animationDuration: '0.6s', animationTimingFunction: 'linear' }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}
