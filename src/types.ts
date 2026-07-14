/**
 * Type declarations for OmniSaaS Full-Stack Application
 */

export type Language = 'de' | 'en';
export type Theme = 'light' | 'dark';

export type UserPlan = 'FREE' | 'PREMIUM' | 'TEAM';

export type TeamRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'DEVELOPER' | 'MEMBER' | 'VIEWER';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  language: Language;
  theme: Theme;
  plan: UserPlan;
  geminiCredits: number;
  dailyUsage: number;
  monthlyUsage: number;
  lastReset: string; // ISO string
  cooldownUntil: string | null; // ISO string or null
  onboardingCompleted: boolean;
  isAdmin?: boolean;
  role?: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  username: string;
  role: TeamRole;
  creditsLimit: number; // monthly limit
  creditsUsed: number;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  ownerId: string;
  credits: number;
  maxCredits: number;
  members: TeamMember[];
  creditsUsedThisMonth: number;
  createdAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  type: 'Roblox' | 'Discord' | 'GitHub' | 'Custom';
  url: string;
  secret?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  timestamp: string;
  payload: string;
  status: 'SUCCESS' | 'FAILED';
  statusCode: number;
  response: string;
}

export interface RobloxConfig {
  apiKey: string;
  universeId: string;
  placeId: string;
  datastoreKey: string;
  messagingServiceTopic: string;
  privateServerData: string;
  updatedAt: string;
}

export interface DiscordConfig {
  botToken: string;
  guildId: string;
  logChannelId: string;
  welcomeChannelId: string;
  adminRoleId: string;
  updatedAt: string;
}

export interface ApiKeyEntry {
  id: string;
  service: 'Gemini' | 'OpenAI' | 'Roblox Open Cloud' | 'Discord Bot' | 'Firebase' | 'Supabase' | 'GitHub' | 'Vercel';
  name: string;
  maskedKey: string;
  createdAt: string;
  lastUsed: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive or negative
  type: 'CHAT' | 'IMAGE_ANALYSIS' | 'FILE_ANALYSIS' | 'TOPUP' | 'PLAN_RESET' | 'TEAM_ALLOCATION';
  description: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  image?: string; // base64 string
  file?: {
    name: string;
    size: number;
    type: string;
  };
  creditsUsed?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  icon: string;
}
