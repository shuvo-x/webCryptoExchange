// Supabase numeric column গুলো JS-এ মাঝেমাঝে string হিসেবে আসে (PostgREST behavior),
// তাই এখানে Number() দিয়ে coerce করা হচ্ছে - এটাই NaN bug-এর root cause ছিল
export const calculatePnL = (position, currentPrice) => {
  if (!currentPrice || !position) return 0;
  const entryPrice = Number(position.entryPrice ?? position.entry_price);
  const margin = Number(position.margin);
  const leverage = Number(position.leverage);
  if (!entryPrice || !margin || !leverage) return 0;

  const priceDiff = currentPrice - entryPrice;
  const direction = position.type === 'LONG' ? 1 : -1;
  return (priceDiff / entryPrice) * margin * leverage * direction;
};

export const calculateLiquidationPrice = (entryPrice, leverage, type) => {
  const liqDistance = entryPrice / leverage;
  return type === 'LONG' ? entryPrice - liqDistance : entryPrice + liqDistance;
};