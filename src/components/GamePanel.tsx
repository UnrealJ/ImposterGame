import { useEffect, useRef } from 'react';
import { Eye, RotateCcw, Home, Zap } from 'lucide-react';
import { GameState, GameSettings } from '../types';

interface GamePanelProps {
  gameState: GameState;
  liveCountdown: string;
  onReveal: () => void;
  onNewRound: () => void;
  onNewGame: () => void;
  onRevealImposter: () => void;
  onRevealCard: () => void;
  settings: GameSettings;
}

export const GamePanel = ({
  gameState,
  liveCountdown,
  onReveal,
  onNewRound,
  onNewGame,
  onRevealImposter,
  onRevealCard,
  settings,
}: GamePanelProps) => {
  const roleTextRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (gameState.phase === 'revealing' && roleTextRef.current) {
      roleTextRef.current.focus();
    } else if (gameState.phase === 'ready' && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 'ready' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [gameState.phase]);

  const currentPlayerNumber = gameState.currentPlayerIndex + 1;
  const nextPlayerNumber = gameState.currentPlayerIndex + 2;
  const isImposter = gameState.currentPlayerIndex === gameState.imposterIndex;

  const renderStatus = () => {
    if (gameState.phase === 'revealing') {
      return (
        <div
          ref={roleTextRef}
          tabIndex={-1}
          className="text-center space-y-6 focus:outline-none animate-fadeIn"
        >
          {isImposter ? (
            <>
              <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-4">
                YOU ARE THE IMPOSTER!
              </div>
              {!settings.noHintsForImposter && (
                <div className="text-xl sm:text-2xl text-gray-700">
                  <div className="font-semibold mb-2">Hint:</div>
                  <div className="text-lg sm:text-xl text-gray-600">
                    {gameState.currentCard?.hint || 'No hint'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-2xl sm:text-3xl text-gray-800">
              <div className="font-semibold mb-3">Your card is:</div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                {gameState.currentCard?.name || 'Unknown'}
              </div>
            </div>
          )}

          {liveCountdown && (
            <div className="text-lg sm:text-xl font-mono text-gray-500 mt-6">
              Time left: {liveCountdown}
            </div>
          )}
        </div>
      );
    }

    if (gameState.phase === 'ready') {
      if (gameState.currentPlayerIndex > 0) {
        return (
          <div className="text-center space-y-4">
            <div className="text-xl sm:text-2xl font-semibold text-gray-800">
              Time's up! Hide the screen and pass the device.
            </div>
            <div className="text-lg sm:text-xl text-gray-600">
              Tap to reveal Player {currentPlayerNumber}
            </div>
          </div>
        );
      }
      return (
        <div className="text-center space-y-4">
          <div className="text-xl sm:text-2xl font-semibold text-gray-800">
            Ready to start the round!
          </div>
          <div className="text-lg sm:text-xl text-gray-600">
            Player 1, tap to see your role
          </div>
        </div>
      );
    }

    if (gameState.phase === 'finished') {
      return (
        <div className="text-center space-y-4">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
            All players have seen their roles!
          </div>
          <div className="text-base sm:text-lg text-gray-600">
            Now discuss and find the imposter
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[400px] flex flex-col justify-center">
        {renderStatus()}
      </div>

      {gameState.phase === 'finished' ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRevealImposter}
              className="flex-1 py-4 px-6 text-lg font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 active:bg-red-800 transition-colors min-h-[56px] flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              Reveal Imposter
            </button>
            <button
              onClick={onRevealCard}
              className="flex-1 py-4 px-6 text-lg font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[56px] flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              Reveal Card
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNewRound}
              className="flex-1 py-4 px-6 text-lg font-bold text-white bg-green-600 rounded-2xl hover:bg-green-700 active:bg-green-800 transition-colors min-h-[56px] flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              New Round
            </button>
            <button
              onClick={onNewGame}
              className="flex-1 py-4 px-6 text-lg font-bold text-white bg-gray-600 rounded-2xl hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[56px] flex items-center justify-center gap-2"
            >
              <Home size={20} />
              New Game
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={buttonRef}
          onClick={onReveal}
          disabled={gameState.phase === 'revealing'}
          aria-disabled={gameState.phase === 'revealing'}
          className="w-full py-5 px-6 text-xl font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[64px] flex items-center justify-center gap-3"
        >
          <Eye size={24} />
          {gameState.phase === 'revealing'
            ? 'Revealing...'
            : `Reveal Player ${currentPlayerNumber}`}
        </button>
      )}

      <div className="text-center text-sm text-gray-500 mt-4">
        Pass the device between players. Keep roles secret!
      </div>
    </div>
  );
};
