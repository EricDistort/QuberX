// utils/transactions.ts
import { supabase } from './supabaseClient';

export async function sendMoney(senderAcc: string, receiverAcc: string, amount: number) {
  const { data, error } = await supabase.rpc('transfer_amount', {
    sender_acc: senderAcc,
    receiver_acc: receiverAcc,
    transfer_amount: amount,
  });
  return { data, error };
}
