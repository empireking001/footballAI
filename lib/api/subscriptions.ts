import { apiClient } from './client';

export interface Subscription {
  _id: string;
  plan: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'failed';
  provider: 'paystack' | 'flutterwave' | 'stripe';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

export async function getMySubscriptions(): Promise<Subscription[]> {
  const { data } = await apiClient.get<{ data: Subscription[] }>('/subscriptions/me');
  return data.data;
}

export async function verifyPayment(reference: string): Promise<Subscription> {
  const { data } = await apiClient.get<{ data: Subscription }>(`/subscriptions/verify/${reference}`);
  return data.data;
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.post<{ data: Subscription }>(`/subscriptions/${id}/cancel`);
  return data.data;
}

export interface ReferralStats {
  referralCode: string;
  referralEarnings: number;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data } = await apiClient.get<{ data: ReferralStats }>('/subscriptions/referrals/me');
  return data.data;
}
