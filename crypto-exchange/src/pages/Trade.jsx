import React, { useState, useMemo, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketStore } from '../store/marketStore';
import { PAIRS } from '../data/pairs';
import { formatPrice, formatPercent } from '../utils/format';
import { theme } from '../theme';
import { positionsReducer, initialPositionsState } from '../reducer/positionsReducer';
import { TradingChart } from '../components/TradingChart';
import { OrderBook } from '../components/OrderBook';
import { OrderForm } from '../components/OrderForm';
import { ActivePositions } from '../components/ActivePositions';

export const Trade = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { balances, updateBalance } = useAuth();

  const currentSymbol = symbol ? symbol.toUpperCase() : 'BTCUSDT';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Position lifecycle এখন useReducer দিয়ে predictable action-এর মাধ্যমে বদলায়
  const [positions, dispatch] = useReducer(positionsReducer, initialPositionsState);

  // শুধু current pair-এর slice-এ subscribe করা হচ্ছে
  const liveData = useMarketStore((s) => s.prices[currentSymbol]);
  const allPrices = useMarketStore((s) => s.prices); // dropdown search list-এর জন্য দরকার

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

  const handleOpenOrder = useCallback((order) => {
    dispatch({ type: 'OPEN_POSITION', payload: order });
  }, []);

  const handleClosePosition = useCallback((id, pnl) => {
    dispatch({ type: 'CLOSE_POSITION', payload: { id } });
    updateBalance('profit', pnl);
  }, [updateBalance]);

  const isPositive = currentPairData.change >= 0;

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', fontFamily: theme.font.family }}>

      <div style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '32px', position: 'relative' }}>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ background: theme.colors.bgInput, border: `1px solid ${theme.colors.borderStrong}`, color: '#fff', padding: '8px 16px', borderRadius: theme.radius.md, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            <span>{currentPairData.pair}</span>
            <ChevronDown size={18} color={theme.colors.accent} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {isDropdownOpen && (
            <div style={{ position: 'absolute', top: '50px', left: 0, width: '380px', background: theme.colors.bgCard, border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.radius.lg, boxShadow: '0px 10px 30px rgba(0,0,0,0.5)', zIndex: 1000, padding: '16px' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search market..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 34px', background: theme.colors.bgSecondary, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, color: '#fff', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                      <th style={{ paddingBottom: '8px' }}>Pair</th>
                      <th style={{ paddingBottom: '8px' }}>Price</th>
                      <th style={{ paddingBottom: '8px', textAlign: 'right' }}>24h %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPairs.map((item) => {
                      const itemPositive = item.change >= 0;
                      return (
                        <tr
                          key={item.symbol}
                          onClick={() => handleSelectPair(item.symbol)}
                          style={{ cursor: 'pointer', borderBottom: `1px solid ${theme.colors.border}`, background: item.symbol === currentPairData.pair ? theme.colors.bgInput : 'transparent' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.bgInput)}
                          onMouseLeave={(e) => { if (item.symbol !== currentPairData.pair) e.currentTarget.style.background = 'transparent'; }}
                        >
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

        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPrice(currentPairData.price)}</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Last Price</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPercent(currentPairData.change)}</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>24h Change</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.colors.textPrimary }}>{formatPrice(currentPairData.high)}</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>24h High</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.colors.textPrimary }}>{formatPrice(currentPairData.low)}</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>24h Low</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 320px', gap: '1px', background: theme.colors.border }}>
        <div style={{ background: theme.colors.bgSecondary, width: '100%', padding: '8px' }}>
          <TradingChart symbol={currentPairData.pair} />
        </div>
        <div style={{ background: theme.colors.bgCard, padding: '8px' }}>
          <OrderBook currentPrice={currentPairData.price} />
        </div>
        <div style={{ background: theme.colors.bgCard, padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '12px' }}>
            Place Order ({currentPairData.pair})
          </h3>
          <OrderForm currentPrice={currentPairData.price} balances={balances} onOpenOrder={handleOpenOrder} />
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <ActivePositions positions={positions} currentPrice={currentPairData.price} onClosePosition={handleClosePosition} />
      </div>

    </div>
  );
};