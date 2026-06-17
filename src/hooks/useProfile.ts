import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function updateProfile(userId: string, fullName: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId);

  if (error) throw error;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, fullName }: { userId: string; fullName: string }) =>
      updateProfile(userId, fullName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
