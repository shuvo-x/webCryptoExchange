import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyHoldings, spotBuy, spotSell } from '../api/spot';
import { useAuth } from '../context/AuthContext';

export const useMyHoldings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['spotHoldings', user?.id],
    queryFn: () => fetchMyHoldings(user.id),
    enabled: !!user,
    refetchInterval: 10000,
  });
};

export const useSpotBuy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: spotBuy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spotHoldings'] }),
  });
};

export const useSpotSell = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: spotSell,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spotHoldings'] }),
  });
};