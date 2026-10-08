type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ compact = false, className = '', priority = false }: BrandLogoProps) {
  if (compact) {
    return (
      <img
        src="/assets/finvex-isotipo.png"
        alt="FINVEX"
        className={`h-10 w-10 shrink-0 object-contain ${className}`}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    );
  }

  return (
    <span className={`relative block h-20 w-32 shrink-0 overflow-hidden ${className}`}>
      <img
        src="/assets/finvex-logo.png"
        alt="FINVEX"
        className="absolute left-0 top-1/2 h-32 w-32 -translate-y-1/2 object-contain"
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </span>
  );
}
