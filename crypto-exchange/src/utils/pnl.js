// PnL/liquidation logic এক জায়গায় - ActivePositions.jsx আর OrderForm.jsx দুই জায়গাতেই দরকার,
// financial logic বলেই এটা আলাদা করে unit-test করা জরুরি
export const calculatePnL = (position, currentPrice) => {
  if (!currentPrice || !position) return 0;
  const priceDiff = currentPrice - position.entryPrice;
  const direction = position.type === 'LONG' ? 1 : -1;
  return (priceDiff / position.entryPrice) * position.margin * position.leverage * direction;
};

export const calculateLiquidationPrice = (entryPrice, leverage, type) => {
  const liqDistance = entryPrice / leverage;
  return type === 'LONG' ? entryPrice - liqDistance : entryPrice + liqDistance;
};