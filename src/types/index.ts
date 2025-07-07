export interface User {
  id: string;
  email: string;
  username: string;
  role: 'player' | 'admin';
}

export interface Player {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  tokens: number;
  playerId: string;
  gameUid: string;
  uid: string;
  registeredTournaments: string[];
  matchHistory: MatchResult[];
  createdAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  mode: '1v1' | 'squad';
  entryFee: number;
  killReward: number;
  booyahReward: number;
  dateTime: string;
  status: 'upcoming' | 'waiting' | 'full' | 'live' | 'active' | 'completed';
  maxPlayers: number;
  currentPlayers: number;
  participants: string[];
  matches: any[];
  roomId: string;
  roomPassword: string;
  rules: string[];
  winner?: string;
  results?: MatchResult[];
  createdAt: string;
}

export interface MatchResult {
  playerId: string;
  placement: number;
  kills: number;
  tokensEarned: number;
  date: string;
}

export interface TokenTransaction {
  id: string;
  playerId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'tournament_win' | 'kill_reward' | 'bonus' | 'penalty';
  reason: string;
  date: string;
  adminId?: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  amount: number;
  screenshotName?: string;
  screenshotSize?: number;
  screenshotURL?: string;
  screenshotPath?: string;
  screenshotFileName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  method: 'jazzcash' | 'easypaisa';
  rejectionReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  amount: number;
  netAmount: number;
  serviceFee: number;
  accountNumber: string;
  method: 'jazzcash' | 'easypaisa';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}