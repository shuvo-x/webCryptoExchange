import { supabase } from '../lib/supabaseClient';

export const claimTrialBonus = async () => {
  const { data, error } = await supabase.rpc('claim_trial_bonus');
  if (error) throw error;
  return data;
};