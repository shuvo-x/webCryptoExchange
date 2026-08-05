// Backend API client - এখন mock delay দিয়ে simulate করে (real backend এখনো নেই)।
// Real backend ready হলে এই ফাইলটাই শুধু বদলাতে হবে - কোনো component/hook বদলাতে হবে না।
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const mockResponses = {
  '/wallet/transactions': () => [
    { id: 'TX109283', type: 'Deposit', amount: '+500.00 USDT', date: '2026-08-02 14:22', status: 'Completed' },
    { id: 'TX109281', type: 'Withdraw', amount: '-120.00 USDT', date: '2026-07-28 09:15', status: 'Completed' },
    { id: 'TX109275', type: 'Bonus', amount: '+10.00 USDT', date: '2026-07-25 18:00', status: 'Completed' },
  ],
  '/wallet/deposit': (body) => ({ success: true, amount: body.amount, txId: 'TX' + Date.now() }),
  '/wallet/withdraw': (body) => ({ success: true, amount: body.amount, txId: 'TX' + Date.now() }),
};

const USE_MOCK = true; // TODO: real backend চালু হলে false করে দিন

export const apiClient = {
  get: async (path) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return mockResponses[path]?.() ?? null;
    }
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
  post: async (path, body) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockResponses[path]?.(body) ?? null;
    }
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};