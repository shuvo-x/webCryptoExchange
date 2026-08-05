import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, requestDeposit, requestWithdraw } from '../api/Wallet';

export const useTransactionHistory = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
};

export const useDepositMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestWithdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};