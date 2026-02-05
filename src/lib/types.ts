import type { Id } from "../../convex/_generated/dataModel";

// Retro types matching Convex schema
export interface Retro {
  _id: Id<"retros">;
  userId: Id<"users">;
  title: string;
  format: string;
  accessCode: string;
  isClosed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Entry {
  _id: Id<"entries">;
  retroId: Id<"retros">;
  category: string;
  content: string;
  participantId: string;
  createdAt: number;
}

export interface Vote {
  _id: Id<"votes">;
  entryId: Id<"entries">;
  participantId: string;
  value: number;
  createdAt: number;
}

export interface User {
  _id: Id<"users">;
  workosId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  plan: "free" | "pro";
  stripeCustomerId?: string;
  createdAt: number;
}

export interface Subscription {
  _id: Id<"subscriptions">;
  userId: Id<"users">;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodEnd: number;
  createdAt: number;
  updatedAt: number;
}

// Retro format definitions
export const FORMATS = {
  'start-stop-continue': {
    name: 'Start / Stop / Continue',
    categories: ['start', 'stop', 'continue'],
    labels: {
      start: '🚀 Start',
      stop: '🛑 Stop',
      continue: '✅ Continue'
    },
    colors: {
      start: 'bg-green-100 border-green-300',
      stop: 'bg-red-100 border-red-300',
      continue: 'bg-blue-100 border-blue-300'
    }
  },
  'mad-sad-glad': {
    name: 'Mad / Sad / Glad',
    categories: ['mad', 'sad', 'glad'],
    labels: {
      mad: '😠 Mad',
      sad: '😢 Sad',
      glad: '😊 Glad'
    },
    colors: {
      mad: 'bg-red-100 border-red-300',
      sad: 'bg-blue-100 border-blue-300',
      glad: 'bg-green-100 border-green-300'
    }
  },
  'liked-learned-lacked': {
    name: 'Liked / Learned / Lacked',
    categories: ['liked', 'learned', 'lacked'],
    labels: {
      liked: '❤️ Liked',
      learned: '💡 Learned',
      lacked: '🤔 Lacked'
    },
    colors: {
      liked: 'bg-pink-100 border-pink-300',
      learned: 'bg-yellow-100 border-yellow-300',
      lacked: 'bg-gray-100 border-gray-300'
    }
  }
} as const;

export type FormatKey = keyof typeof FORMATS;

// Vote scoring for leaderboard
export const VOTE_SCORES: Record<number, number> = {
  1: 1,   // upvote = +1
  [-1]: -1, // downvote = -1
};

// Get or create anonymous participant ID
export function getParticipantId(): string {
  if (typeof window === 'undefined') return '';

  let participantId = localStorage.getItem('retroshift_participant_id');
  if (!participantId) {
    participantId = crypto.randomUUID();
    localStorage.setItem('retroshift_participant_id', participantId);
  }
  return participantId;
}
