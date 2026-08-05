import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export const TradingChart = React.memo(({ symbol }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: { background: { color: '#181a20' }, textColor: '#848e9c' },
      grid: { vertLines: { color: '#2b313a' }, horzLines: { color: '#2b313a' } },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81', downColor: '#f6465d', borderVisible: false, wickUpColor: '#0ecb81', wickDownColor: '#f6465d',
    });

    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((d) => ({ time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }));
        candlestickSeries.setData(formattedData);
      })
      .catch((err) => console.error(err));

    const handleResize = () => {
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainerRef} style={{ width: '100%', borderRadius: '4px', overflow: 'hidden' }} />;
});

TradingChart.displayName = 'TradingChart';
TradingChart.propTypes = { symbol: PropTypes.string };
TradingChart.defaultProps = { symbol: 'BTCUSDT' };