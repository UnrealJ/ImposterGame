export interface Card {
  name: string;
  hint?: string;
}

export type GamePhase = 'idle' | 'ready' | 'revealing' | 'finished';

export interface GameSettings {
  revealDuration: number;
  preventConsecutiveCard: boolean;
  noHintsForImposter: boolean;
}

export interface GameState {
  phase: GamePhase;
  playerCount: number;
  currentPlayerIndex: number;
  imposterIndex: number;
  currentCard: Card | null;
  lastCardUsed: Card | null;
  remainingMs: number;
}
