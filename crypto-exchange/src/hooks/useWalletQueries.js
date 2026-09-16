import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions } from '../api/Wallet';
import { createWithdrawRequest, fetchMyWithdrawals } from '../api/withdrawals';
import { transferSpotToFutures, transferFuturesToSpot } from '../api/transfers';
import { useAuth } from '../context/AuthContext';

export const useTransactionHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => fetchTransactions(user.id),
    enabled: !!user,
  });
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useMyWithdrawals = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['myWithdrawals', user?.id],
    queryFn: () => fetchMyWithdrawals(user.id),
    enabled: !!user,
  });
};

export const useTransferSpotToFutures = () => {
  return useMutation({ mutationFn: transferSpotToFutures });
};

export const useTransferFuturesToSpot = () => {
  return useMutation({ mutationFn: transferFuturesToSpot });
};