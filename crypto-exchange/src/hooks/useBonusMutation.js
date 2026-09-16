import { useMutation } from '@tanstack/react-query';
import { claimTrialBonus } from '../api/bonus';

export const useClaimBonus = () => {
  return useMutation({ mutationFn: claimTrialBonus });
};