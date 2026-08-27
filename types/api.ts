// Mirrors the shapes returned by football-ai-backend's /api/v1 endpoints.
// Keep in sync with the backend's Mongoose models when they change.

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Team {
  _id: string;
  name: string;
  slug: string;
  shortName?: string;
  country: string;
  logoUrl?: string;
  venueName?: string;
  venueCity?: string;
  founded?: number;
  externalId?: number;
  isActive?: boolean;
}

export interface League {
  _id: string;
  name: string;
  slug: string;
  country: string;
  logoUrl?: string;
  season: number;
  type: "league" | "cup";
  externalId?: number;
  isActive?: boolean;
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled"
  | "suspended";

export interface MatchOdds {
  home?: number;
  draw?: number;
  away?: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
  lastUpdatedAt?: string;
}

export interface Match {
  _id: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  kickoffAt: string;
  status: MatchStatus;
  venue?: string;
  score: {
    homeFullTime?: number;
    awayFullTime?: number;
    homeHalfTime?: number;
    awayHalfTime?: number;
  };
  odds?: MatchOdds;
  resultLocked?: boolean;
  resultLockedAt?: string;
  intelligence?: MatchContext;
}

export interface MarketOutcome {
  market: string;
  selection: string;
  probability: number;
  suggestedOddsMin?: number;
  suggestedOddsMax?: number;
}

export type RiskRating = "low" | "medium" | "high";
export type PredictionTier = "free" | "vip";
export interface MatchFormItem {
  matchId: string;
  kickoffAt: string;
  result: "W" | "D" | "L" | "N";
  score: string;
  opponent: Team;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  cleanSheets: number;
  failedToScore: number;
  goalsFor: number;
  goalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
}

export interface MatchContext {
  standings: Standing[];
  form: { home: MatchFormItem[]; away: MatchFormItem[] };
  headToHead: Match[];
  teamStats?: {
    home: { overall: TeamStats; venue: TeamStats };
    away: { overall: TeamStats; venue: TeamStats };
  };
}

export interface Prediction {
  _id: string;
  match: Match;
  tier: PredictionTier;
  isFeatured?: boolean;
  confidenceScore: number;
  riskRating: RiskRating;
  markets: MarketOutcome[];
  keyFactors: string[];
  aiExplanation: string;
  historicalComparison?: string;
  modelVersion: string;
  actualResult?: {
    homeScore: number;
    awayScore: number;
  };
  accuracy?: {
    winnerCorrect?: boolean;
    correctScoreCorrect?: boolean;
    bttsCorrect?: boolean;
    overUnderCorrect?: boolean;
    doubleChanceCorrect?: boolean;
    evaluationVersion?: number;
    evaluatedAt?: string;
  };
  isVipLocked?: boolean;
  context?: MatchContext;
}

export type FixtureFeedState = 'pending' | 'available' | 'live';

export interface FixtureFeedItem {
  match: Match;
  prediction: Prediction | null;
  state: FixtureFeedState;
  isVipLocked: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "promo";
}

export interface AdSlot {
  slotId: string;
  label: string;
  code: string;
  isEnabled: boolean;
}

export interface DataSyncStatus {
  liveScoresLastSyncedAt?: string;
  fixturesLastSyncedAt?: string;
  standingsLastSyncedAt?: string;
  lastError?: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  navigation: {
    label: string;
    url: string;
    order: number;
    children?: unknown[];
  }[];
  footerColumns: { title: string; links: { label: string; url: string }[] }[];
  socialLinks: Record<string, string | undefined>;
  contact: { email?: string; phone?: string; address?: string };
  seoDefaults: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  announcementBanner: {
    isEnabled: boolean;
    message?: string;
    linkUrl?: string;
  };
  adSlots?: AdSlot[];
  dataSync?: DataSyncStatus;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicablePlans: ("monthly" | "quarterly" | "yearly")[];
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface Plan {
  plan: "monthly" | "quarterly" | "yearly";
  durationDays: number;
  pricing: { NGN: number; USD: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  isEmailVerified: boolean;
  subscriptionTier: "free" | "vip";
  avatarUrl?: string;
  referralCode: string;
}

export interface Standing {
  _id: string;
  league: string;
  team: {
    _id: string;
    name: string;
    slug: string;
    shortName?: string;
    logoUrl?: string;
  };
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}