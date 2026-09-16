import { useMutation, useQuery } from '@tanstack/react-query';
import { createDepositRequest, fetchDepositById } from '../api/deposits';

export const useCreateDepositRequest = () => {
  return useMutation({
    mutationFn: createDepositRequest,
  });
};

// প্রতি ৫ সেকেন্ডে status check করে, confirmed/needs_review হলেই থেমে যায়
export const useDepositStatus = (depositId) => {
  return useQuery({
    queryKey: ['deposit', depositId],
    queryFn: () => fetchDepositById(depositId),
    enabled: !!depositId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'validating' ? 5000 : false;
    },
  });
};