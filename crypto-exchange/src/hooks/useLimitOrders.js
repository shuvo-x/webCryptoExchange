import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyLimitOrders, createLimitOrder, cancelLimitOrder } from '../api/limitOrders';
import { useAuth } from '../context/AuthContext';

export const useMyLimitOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['limitOrders', user?.id],
    queryFn: () => fetchMyLimitOrders(user.id),
    enabled: !!user,
    refetchInterval: 10000,
  });
};

export const useCreateLimitOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLimitOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['limitOrders'] }),
  });
};

export const useCancelLimitOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelLimitOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['limitOrders'] }),
  });
};