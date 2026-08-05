// Single source of truth for all trading pairs — আগে Home/Markets/Trade তিনটাতে তিনরকম hardcoded list ছিল।
export const PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', category: 'Hot', fallback: { price: 89450.0, change: 2.45, high: 90100.0, low: 88200.0, volume: 24500000000 } },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', category: 'Altcoins', fallback: { price: 3240.5, change: -1.12, high: 3310.0, low: 3200.0, volume: 12100000000 } },
  { symbol: 'SOLUSDT', name: 'Solana', icon: 'S', category: 'Hot', fallback: { price: 185.2, change: 5.8, high: 188.0, low: 174.5, volume: 5800000000 } },
  { symbol: 'BNBUSDT', name: 'BNB', icon: 'B', category: 'Altcoins', fallback: { price: 610.0, change: 0.45, high: 615.0, low: 602.0, volume: 2300000000 } },
  { symbol: 'XRPUSDT', name: 'XRP', icon: 'X', category: 'Altcoins', fallback: { price: 0.585, change: 4.12, high: 0.61, low: 0.56, volume: 1800000000 } },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', category: 'Meme', fallback: { price: 0.142, change: -2.35, high: 0.15, low: 0.138, volume: 1200000000 } },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', category: 'Altcoins', fallback: { price: 0.452, change: 1.85, high: 0.47, low: 0.44, volume: 850000000 } },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: 'A', category: 'Altcoins', fallback: { price: 28.4, change: 3.25, high: 29.5, low: 27.1, volume: 620000000 } },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', category: 'Altcoins', fallback: { price: 6.85, change: -0.95, high: 7.1, low: 6.7, volume: 410000000 } },
  { symbol: 'LINKUSDT', name: 'Chainlink', icon: '⬡', category: 'Hot', fallback: { price: 14.5, change: 6.4, high: 15.2, low: 13.8, volume: 980000000 } },
];

export const FEATURED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export const WALLET_SYMBOL_MAP = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
  BNBUSDT: 'BNB',
};