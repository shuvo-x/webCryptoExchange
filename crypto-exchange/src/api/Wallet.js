import { apiClient } from './client';

export const fetchTransactions = () => apiClient.get('/wallet/transactions');
export const requestDeposit = (amount) => apiClient.post('/wallet/deposit', { amount });
export const requestWithdraw = (amount) => apiClient.post('/wallet/withdraw', { amount });