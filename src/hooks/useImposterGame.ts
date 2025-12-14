import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, GamePhase, GameState, GameSettings } from '../types';

const TICK_INTERVAL = 100;

interface UseImposterGameProps {
  cards: Card[];
  settings: GameSettings;
}

export const useImposterGame = ({ cards, settings }: UseImposterGameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'idle',
    playerCount: 4,
    currentPlayerIndex: 0,
    imposterIndices: [],
    currentCard: null,
    lastCardUsed: null,
    remainingMs: 0,
  });

  const timerRef = useRef<number | null>(null);
  const [liveCountdown, setLiveCountdown] = useState('');

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const generateImposterIndices = useCallback((playerCount: number): number[] => {
    if (settings.wildMode) {
      const roll = Math.random();
      let imposterCount: number;

      if (roll < 0.1) {
        imposterCount = 0;
      } else if (roll < 0.5) {
        imposterCount = 1;
      } else if (roll < 0.9) {
        imposterCount = 2;
      } else {
        imposterCount = playerCount;
      }

      const indices: number[] = [];
      const selected = new Set<number>();

      for (let i = 0; i < imposterCount; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * playerCount);
        } while (selected.has(index));
        selected.add(index);
        indices.push(index);
      }

      return indices.sort((a, b) => a - b);
    } else {
      return [Math.floor(Math.random() * playerCount)];
    }
  }, [settings.wildMode]);

  const selectRandomCard = useCallback((): Card | null => {
    if (cards.length === 0) return null;

    const cardsWithHints = cards.filter(c => c.hint);
    const availableCards = cardsWithHints.length > 0 ? cardsWithHints : cards;

    let selectedCard: Card;

    if (settings.preventConsecutiveCard && gameState.lastCardUsed && availableCards.length > 1) {
      const otherCards = availableCards.filter(c => c.name !== gameState.lastCardUsed?.name);
      selectedCard = otherCards[Math.floor(Math.random() * otherCards.length)];
    } else {
      selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    }

    return selectedCard;
  }, [cards, settings.preventConsecutiveCard, gameState.lastCardUsed]);

  const startGame = useCallback((playerCount: number) => {
    if (playerCount < 3 || cards.length === 0) return;

    const imposterIndices = generateImposterIndices(playerCount);
    const selectedCard = selectRandomCard();

    setGameState({
      phase: 'ready',
      playerCount,
      currentPlayerIndex: 0,
      imposterIndices,
      currentCard: selectedCard,
      lastCardUsed: selectedCard,
      remainingMs: 0,
    });
  }, [cards.length, selectRandomCard, generateImposterIndices]);

  const revealRole = useCallback(() => {
    if (gameState.phase !== 'ready') return;

    setGameState(prev => ({
      ...prev,
      phase: 'revealing',
      remainingMs: settings.revealDuration * 1000,
    }));

    let timeLeft = settings.revealDuration * 1000;
    setLiveCountdown(`${(timeLeft / 1000).toFixed(1)}s`);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      timeLeft -= TICK_INTERVAL;

      if (timeLeft <= 0) {
        clearTimer();
        setLiveCountdown('');
        setGameState(prev => {
          const nextPlayer = prev.currentPlayerIndex + 1;
          if (nextPlayer >= prev.playerCount) {
            return { ...prev, phase: 'finished', remainingMs: 0 };
          }
          return {
            ...prev,
            phase: 'ready',
            currentPlayerIndex: nextPlayer,
            remainingMs: 0,
          };
        });
      } else {
        setLiveCountdown(`${(timeLeft / 1000).toFixed(1)}s`);
        setGameState(prev => ({ ...prev, remainingMs: timeLeft }));
      }
    }, TICK_INTERVAL);
  }, [gameState.phase, settings.revealDuration, clearTimer]);

  const newRound = useCallback(() => {
    const imposterIndices = generateImposterIndices(gameState.playerCount);
    const selectedCard = selectRandomCard();

    setGameState(prev => ({
      ...prev,
      phase: 'ready',
      currentPlayerIndex: 0,
      imposterIndices,
      currentCard: selectedCard,
      lastCardUsed: selectedCard,
      remainingMs: 0,
    }));
  }, [gameState.playerCount, selectRandomCard, generateImposterIndices]);

  const newGame = useCallback(() => {
    clearTimer();
    setLiveCountdown('');
    setGameState({
      phase: 'idle',
      playerCount: 4,
      currentPlayerIndex: 0,
      imposterIndices: [],
      currentCard: null,
      lastCardUsed: null,
      remainingMs: 0,
    });
  }, [clearTimer]);

  const updatePlayerCount = useCallback((count: number) => {
    setGameState(prev => ({ ...prev, playerCount: Math.max(3, count) }));
  }, []);

  return {
    gameState,
    liveCountdown,
    startGame,
    revealRole,
    newRound,
    newGame,
    updatePlayerCount,
  };
};
