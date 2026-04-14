import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string | null;
  reference: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Try to get existing wallet
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no wallet exists, create one
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();
        
        if (createError) throw createError;
        return newWallet as Wallet;
      }
      
      return data as Wallet;
    },
    enabled: !!user,
  });

  // Fetch wallet transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!user,
  });

  // Initialize Paystack payment
  const initializePayment = useMutation({
    mutationFn: async ({ amount, email }: { amount: number; email: string }) => {
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: { amount, email },
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Payment initialization failed:', error);
      toast.error('Failed to initialize payment');
    },
  });

  // Verify Paystack payment
  const verifyPayment = useMutation({
    mutationFn: async ({ reference }: { reference: string }) => {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Payment verified successfully!');
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
      toast.error('Failed to verify payment');
    },
  });

  // Pay for ad campaign from wallet
  const payFromWallet = useMutation({
    mutationFn: async ({ amount, campaignId, description }: { amount: number; campaignId: string; description: string }) => {
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const { data, error } = await supabase.functions.invoke('wallet-debit', {
        body: { amount, campaignId, description },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Payment successful!');
    },
    onError: (error) => {
      console.error('Wallet payment failed:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    },
  });

  return {
    wallet,
    walletLoading,
    transactions,
    transactionsLoading,
    initializePayment,
    verifyPayment,
    payFromWallet,
  };
};
