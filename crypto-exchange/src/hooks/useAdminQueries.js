import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPendingWithdrawals,
  fetchNeedsReviewDeposits,
  approveWithdrawal,
  rejectWithdrawal,
  resolveDeposit,
} from '../api/admin';

export const usePendingWithdrawals = () => {
  return useQuery({
    queryKey: ['admin', 'withdrawals', 'pending'],
    queryFn: fetchPendingWithdrawals,
    refetchInterval: 10000, // প্রতি ১০ সেকেন্ডে নতুন request check করে
  });
};

export const useNeedsReviewDeposits = () => {
  return useQuery({
    queryKey: ['admin', 'deposits', 'review'],
    queryFn: fetchNeedsReviewDeposits,
    refetchInterval: 10000,
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals', 'pending'] }),
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals', 'pending'] }),
  });
};

export const useResolveDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveDeposit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'deposits', 'review'] }),
  });
};