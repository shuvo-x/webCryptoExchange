// Shared formatting helpers - single source of truth for how price/percent/volume is displayed.
export const formatPrice = (value, opts = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  const isSmall = value < 1;
  const { minimumFractionDigits = isSmall ? 4 : 2, maximumFractionDigits = isSmall ? 4 : 2 } = opts;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits, maximumFractionDigits })}`;
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatVolume = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};