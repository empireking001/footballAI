import { apiClient } from "./client";
import { ApiResponse } from "./auth";

// Domain Literal Types
export type SubscriptionPlan = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "pending"
  | "failed";
export type PaymentProvider = "paystack" | "flutterwave" | "stripe";

// Model Interfaces
export interface Subscription {
  _id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

export interface ReferralStats {
  referralCode: string;
  referralEarnings: number;
  totalReferrals?: number;
}

// Request / Response Payload Types
export interface InitializePaymentInput {
  plan: SubscriptionPlan;
  provider: PaymentProvider;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  authorizationUrl?: string; // Redirect URL for Paystack/Flutterwave checkout
  reference: string;
}

// ==========================================
// SUBSCRIPTION API METHODS
// ==========================================

export async function getMySubscriptions(): Promise<Subscription[]> {
  const { data } =
    await apiClient.get<ApiResponse<Subscription[]>>("/subscriptions/me");
  return data.data;
}

export async function initializePayment(
  input: InitializePaymentInput,
): Promise<InitializePaymentResponse> {
  const { data } = await apiClient.post<ApiResponse<InitializePaymentResponse>>(
    "/subscriptions/initialize",
    input,
  );
  return data.data;
}

export async function verifyPayment(reference: string): Promise<Subscription> {
  const { data } = await apiClient.get<ApiResponse<Subscription>>(
    `/subscriptions/verify/${reference}`,
  );
  return data.data;
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.post<ApiResponse<Subscription>>(
    `/subscriptions/${id}/cancel`,
  );
  return data.data;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data } = await apiClient.get<ApiResponse<ReferralStats>>(
    "/subscriptions/referrals/me",
  );
  return data.data;
}
