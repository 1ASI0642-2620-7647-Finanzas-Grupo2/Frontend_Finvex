type BrandLogoProps = {
  compact?: boolean;
  stacked?: boolean;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  compact = false,
  stacked = false,
  className = '',
  priority = false,
}: BrandLogoProps) {
  const src = compact
    ? '/assets/finvex-isotipo.png'
    : stacked
      ? '/assets/finvex-logo.png'
      : '/assets/finvex-horizontal.png';

  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      <img
        src={src}
        alt="FINVEX"
        className="block h-full w-full object-contain"
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </span>
  );
}
