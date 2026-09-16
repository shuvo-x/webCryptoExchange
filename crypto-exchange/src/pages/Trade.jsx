import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useMarketStore } from '../store/marketStore';
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery';
import { PAIRS } from '../data/pairs';
import { formatPrice, formatPercent } from '../utils/format';
import { theme } from '../theme';
import { useMyPositions, useOpenPosition, useClosePosition } from '../hooks/usePositions';
import { useMyLimitOrders, useCreateLimitOrder, useCancelLimitOrder } from '../hooks/useLimitOrders';
import { useLiquidationWatcher } from '../hooks/useLiquidationWatcher';
import { useLimitOrderWatcher } from '../hooks/useLimitOrderWatcher';
import { useMyHoldings, useSpotBuy, useSpotSell } from '../hooks/useSpot';
import { TradingChart } from '../components/TradingChart';
import { OrderBook } from '../components/OrderBook';
import { OrderForm } from '../components/OrderForm';
import { ActivePositions } from '../components/ActivePositions';
import { OrderConfirmModal } from '../components/OrderConfirmModal';
import { SpotOrderForm } from '../components/SpotOrderForm';
import { SpotHoldings } from '../components/SpotHoldings';

export const Trade = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { balances, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const currentSymbol = symbol ? symbol.toUpperCase() : 'BTCUSDT';
  const coinSymbol = currentSymbol.replace('USDT', '');

  const [tradeMode, setTradeMode] = useState('FUTURES'); // 'SPOT' | 'FUTURES'

  useEffect(() => {
    const exists = PAIRS.some((p) => p.symbol === currentSymbol);
    if (!exists) {
      navigate('/trade/BTCUSDT', { replace: true });
    }
  }, [currentSymbol, navigate]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);

  // ---- Futures data ----
  const { data: allPositions } = useMyPositions();
  const openPosition = useOpenPosition();
  const closePosition = useClosePosition();

  const { data: limitOrders } = useMyLimitOrders();
  const createLimitOrder = useCreateLimitOrder();
  const cancelLimitOrder = useCancelLimitOrder();

  const openPositions = useMemo(() => (allPositions ?? []).filter((p) => p.status === 'OPEN'), [allPositions]);

  useLiquidationWatcher(openPositions);
  useLimitOrderWatcher(limitOrders);

  // ---- Spot data ----
  const { data: holdings } = useMyHoldings();
  const spotBuy = useSpotBuy();
  const spotSell = useSpotSell();

  const currentHolding = useMemo(() => {
    const h = (holdings ?? []).find((item) => item.coin_symbol === coinSymbol);
    return h ? Number(h.quantity) : 0;
  }, [holdings, coinSymbol]);

  const liveData = useMarketStore((s) => s.prices[currentSymbol]);
  const allPrices = useMarketStore((s) => s.prices);
  const isLive = useMarketStore((s) => s.isLive);

  const pairInfo = useMemo(() => PAIRS.find((p) => p.symbol === currentSymbol) || PAIRS[0], [currentSymbol]);
  const currentPairData = { ...pairInfo, ...liveData, pair: pairInfo.symbol };

  const filteredPairs = useMemo(() => {
    return PAIRS.filter(
      (item) => item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map((item) => ({ ...item, ...allPrices[item.symbol] }));
  }, [searchQuery, allPrices]);

  const handleSelectPair = useCallback((newPair) => {
    setIsDropdownOpen(false);
    navigate(`/trade/${newPair}`);
  }, [navigate]);

  // ---- Futures handlers ----
  const handleRequestOpenOrder = useCallback((order) => {
    setPendingOrder({ ...order, mode: 'MARKET', symbol: currentPairData.pair });
  }, [currentPairData.pair]);

  const handleRequestLimitOrder = useCallback((order) => {
    setPendingOrder({ ...order, mode: 'LIMIT', symbol: currentPairData.pair });
  }, [currentPairData.pair]);

  const handleConfirmOrder = useCallback(async () => {
    if (!pendingOrder) return;
    try {
      if (pendingOrder.mode === 'MARKET') {
        await openPosition.mutateAsync({
          symbol: pendingOrder.symbol,
          type: pendingOrder.type,
          leverage: pendingOrder.leverage,
          margin: pendingOrder.margin,
          entryPrice: pendingOrder.entryPrice,
          liquidationPrice: pendingOrder.liquidationPrice,
        });
        showToast(`Position opened: ${pendingOrder.type} ${pendingOrder.symbol}`, 'success');
      } else {
        await createLimitOrder.mutateAsync({
          symbol: pendingOrder.symbol,
          type: pendingOrder.type,
          leverage: pendingOrder.leverage,
          margin: pendingOrder.margin,
          targetPrice: pendingOrder.targetPrice,
        });
        showToast('Limit order placed', 'success');
      }
      await refreshProfile();
    } catch (err) {
      showToast(err.message || 'Order সম্পন্ন করা যায়নি।', 'error');
    } finally {
      setPendingOrder(null);
    }
  }, [pendingOrder, openPosition, createLimitOrder, refreshProfile, showToast]);

  const handleCancelLimitOrder = useCallback(async (orderId) => {
    try {
      await cancelLimitOrder.mutateAsync(orderId);
      await refreshProfile();
      showToast('Limit order cancelled', 'success');
    } catch (err) {
      showToast(err.message || 'Order cancel করা যায়নি।', 'error');
    }
  }, [cancelLimitOrder, refreshProfile, showToast]);

  const handleClosePosition = useCallback(async (positionId, closePrice) => {
    if (!closePrice) return;
    try {
      const result = await closePosition.mutateAsync({ positionId, closePrice });
      await refreshProfile();
      const pnl = Number(result?.pnl ?? 0);
      showToast(`Position closed: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT`, pnl >= 0 ? 'success' : 'warning');
    } catch (err) {
      showToast(err.message || 'Position close করা যায়নি।', 'error');
    }
  }, [closePosition, refreshProfile, showToast]);

  // ---- Spot handlers ----
  const handleSpotBuy = useCallback(async (quoteAmount) => {
    try {
      await spotBuy.mutateAsync({ coinSymbol, price: currentPairData.price, quoteAmount });
      await refreshProfile();
      showToast(`Bought ${coinSymbol} successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Buy order সম্পন্ন করা যায়নি।', 'error');
    }
  }, [spotBuy, coinSymbol, currentPairData.price, refreshProfile, showToast]);

  const handleSpotSell = useCallback(async (quantity) => {
    try {
      await spotSell.mutateAsync({ coinSymbol, price: currentPairData.price, quantity });
      await refreshProfile();
      showToast(`Sold ${coinSymbol} successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Sell order সম্পন্ন করা যায়নি।', 'error');
    }
  }, [spotSell, coinSymbol, currentPairData.price, refreshProfile, showToast]);

  const isPositive = currentPairData.change >= 0;

  const layoutKey = `${tradeMode}-${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`;

  const chartBlock = (
    <div style={{ background: theme.colors.bgSecondary, width: '100%', padding: '8px' }}>
      <TradingChart symbol={currentPairData.pair} />
    </div>
  );

  const orderBookBlock = (
    <div style={{ background: theme.colors.bgCard, padding: '8px' }}>
      <OrderBook currentPrice={currentPairData.price} />
    </div>
  );

  const futuresOrderFormBlock = (
    <div style={{ background: theme.colors.bgCard, padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '12px' }}>
        Place Order ({currentPairData.pair})
      </h3>
      <OrderForm
        currentPrice={currentPairData.price}
        balances={balances}
        onOpenOrder={handleRequestOpenOrder}
        onPlaceLimitOrder={handleRequestLimitOrder}
      />
    </div>
  );

  const spotOrderFormBlock = (
    <div style={{ background: theme.colors.bgCard, padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '12px' }}>
        Spot Trade ({currentPairData.pair})
      </h3>
      <SpotOrderForm
        currentPrice={currentPairData.price}
        spotBalance={balances.spot}
        holdingQuantity={currentHolding}
        coinSymbol={coinSymbol}
        onBuy={handleSpotBuy}
        onSell={handleSpotSell}
        isSubmitting={spotBuy.isPending || spotSell.isPending}
      />
    </div>
  );

  const orderFormBlock = tradeMode === 'SPOT' ? spotOrderFormBlock : futuresOrderFormBlock;

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', fontFamily: theme.font.family, overflowX: 'hidden' }}>

      {/* Spot / Futures টাব */}
      <div style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, padding: isMobile ? '0 12px' : '0 24px', display: 'flex', gap: '4px' }}>
        {['SPOT', 'FUTURES'].map((mode) => (
          <button
            key={mode}
            onClick={() => setTradeMode(mode)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tradeMode === mode ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
              color: tradeMode === mode ? theme.colors.accent : theme.colors.textSecondary,
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'capitalize',
            }}
          >
            {mode === 'SPOT' ? 'Spot' : 'Futures'}
          </button>
        ))}
      </div>

      <div style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, padding: isMobile ? '10px 12px' : '12px 24px', display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '32px', position: 'relative', flexWrap: isMobile ? 'wrap' : 'nowrap', overflowX: isMobile ? 'auto' : 'visible' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ background: theme.colors.bgInput, border: `1px solid ${theme.colors.borderStrong}`, color: '#fff', padding: '8px 16px', borderRadius: theme.radius.md, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            <span>{currentPairData.pair}</span>
            <ChevronDown size={18} color={theme.colors.accent} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {isDropdownOpen && (
            <div style={{ position: 'absolute', top: '50px', left: 0, width: isMobile ? '90vw' : '380px', maxWidth: '380px', background: theme.colors.bgCard, border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.radius.lg, boxShadow: '0px 10px 30px rgba(0,0,0,0.5)', zIndex: 1000, padding: '16px' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text" placeholder="Search market..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 34px', background: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                      <th style={{ paddingBottom: '8px' }}>Pair</th><th style={{ paddingBottom: '8px' }}>Price</th><th style={{ paddingBottom: '8px', textAlign: 'right' }}>24h %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPairs.map((item) => {
                      const itemPositive = item.change >= 0;
                      return (
                        <tr key={item.symbol} onClick={() => handleSelectPair(item.symbol)} style={{ cursor: 'pointer', borderBottom: `1px solid ${theme.colors.border}`, background: item.symbol === currentPairData.pair ? theme.colors.bgInput : 'transparent' }}>
                          <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{item.symbol}</td>
                          <td style={{ color: itemPositive ? theme.colors.positive : theme.colors.negative, fontWeight: 'bold' }}>{formatPrice(item.price)}</td>
                          <td style={{ textAlign: 'right', color: itemPositive ? theme.colors.positive : theme.colors.negative, fontWeight: 'bold' }}>{formatPercent(item.change)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPrice(currentPairData.price)}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Last Price</div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPercent(currentPairData.change)}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>24h Change</div>
        </div>

        {!isMobile && (
          <>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.colors.textPrimary }}>{formatPrice(currentPairData.high)}</div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>24h High</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.colors.textPrimary }}>{formatPrice(currentPairData.low)}</div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>24h Low</div>
            </div>
          </>
        )}

        <div style={{ marginLeft: isMobile ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isLive ? theme.colors.positive : theme.colors.negative, flexShrink: 0 }}>
          {isLive ? <Wifi size={14} /> : <WifiOff size={14} />}
          {!isMobile && (isLive ? 'Live' : 'Reconnecting...')}
        </div>
      </div>

      {isMobile ? (
        <div key={layoutKey} style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: theme.colors.border }}>
          {chartBlock}
          {orderFormBlock}
          {orderBookBlock}
        </div>
      ) : isTablet ? (
        <div key={layoutKey} style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: theme.colors.border }}>
          {chartBlock}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px' }}>
            {orderBookBlock}
            {orderFormBlock}
          </div>
        </div>
      ) : (
        <div key={layoutKey} style={{ display: 'grid', gridTemplateColumns: '1fr 300px 320px', gap: '1px', background: theme.colors.border }}>
          {chartBlock}
          {orderBookBlock}
          {orderFormBlock}
        </div>
      )}

      {tradeMode === 'FUTURES' && limitOrders && limitOrders.length > 0 && (
        <div style={{ padding: isMobile ? '0 12px' : '0 24px' }}>
          <div style={{ background: '#1e222d', padding: '20px', borderRadius: '8px', color: '#fff', marginTop: '20px', overflowX: 'auto' }}>
            <h3>Pending Limit Orders</h3>
            <table style={{ width: '100%', minWidth: '500px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#888', borderBottom: '1px solid #2a2e39' }}>
                  <th>Symbol</th><th>Type</th><th>Leverage</th><th>Margin</th><th>Target Price</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {limitOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                    <td style={{ padding: '8px 0' }}>{o.symbol}</td>
                    <td style={{ color: o.type === 'LONG' ? '#26a69a' : '#ef5350' }}>{o.type}</td>
                    <td>{o.leverage}x</td>
                    <td>{Number(o.margin).toFixed(2)} USDT</td>
                    <td>${Number(o.target_price).toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleCancelLimitOrder(o.id)} style={{ background: '#2b313a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <X size={12} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ padding: isMobile ? '0 12px 24px' : '0 24px 24px', overflowX: 'auto' }}>
        {tradeMode === 'FUTURES' ? (
          <ActivePositions positions={openPositions} onClosePosition={handleClosePosition} />
        ) : (
          <SpotHoldings holdings={holdings ?? []} />
        )}
      </div>

      {tradeMode === 'FUTURES' && (
        <OrderConfirmModal
          order={pendingOrder}
          onConfirm={handleConfirmOrder}
          onCancel={() => setPendingOrder(null)}
          isSubmitting={openPosition.isPending || createLimitOrder.isPending}
        />
      )}

    </div>
  );
};