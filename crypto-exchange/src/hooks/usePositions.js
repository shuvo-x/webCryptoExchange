import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyPositions, openPosition, closePosition } from '../api/positions';
import { useAuth } from '../context/AuthContext';

export const useMyPositions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['positions', user?.id],
    queryFn: () => fetchMyPositions(user.id),
    enabled: !!user,
    refetchInterval: 10000, // অন্য tab/device-এ liquidate/close হলেও ১০ সেকেন্ডে sync হবে
  });
};

export const useOpenPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: openPosition,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });
};

export const useClosePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closePosition,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });
};