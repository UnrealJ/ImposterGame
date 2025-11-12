import { useState, useEffect } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { GamePanel } from './components/GamePanel';
import { useImposterGame } from './hooks/useImposterGame';
import { useSettings } from './hooks/useSettings';
import { Card } from './types';
import { SAMPLE_CARDS } from './data/sampleCards';

function App() {
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const { settings, setSettings } = useSettings();
  const {
    gameState,
    liveCountdown,
    startGame,
    revealRole,
    newRound,
    newGame,
    updatePlayerCount,
  } = useImposterGame({ cards, settings });

  const [ariaLiveMessage, setAriaLiveMessage] = useState('');

  useEffect(() => {
    if (gameState.phase === 'revealing') {
      const isImposter = gameState.currentPlayerIndex === gameState.imposterIndex;
      if (isImposter) {
        setAriaLiveMessage(
          `You are the imposter. Hint: ${gameState.currentCard?.hint || 'No hint yet'}`
        );
      } else {
        setAriaLiveMessage(`Your card is ${gameState.currentCard?.name}`);
      }
    } else if (gameState.phase === 'ready' && gameState.currentPlayerIndex > 0) {
      setAriaLiveMessage(`Times up. Pass the device to player ${gameState.currentPlayerIndex + 1}`);
    } else if (gameState.phase === 'finished') {
      setAriaLiveMessage('All players have seen their roles. Time to discuss.');
    }
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.imposterIndex, gameState.currentCard]);

  useEffect(() => {
    if (liveCountdown) {
      setAriaLiveMessage(`Time remaining: ${liveCountdown}`);
    }
  }, [liveCountdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        gameState.phase === 'ready' &&
        !e.repeat
      ) {
        e.preventDefault();
        revealRole();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.phase, revealRole]);

  const handleStartGame = () => {
    startGame(gameState.playerCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {ariaLiveMessage}
      </div>

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            Imposter ඞ
          </h1>
        </div>
      </header>

      <main className="py-6 sm:py-8">
        {gameState.phase === 'idle' ? (
          <SetupPanel
            playerCount={gameState.playerCount}
            onPlayerCountChange={updatePlayerCount}
            settings={settings}
            onSettingsChange={setSettings}
            cards={cards}
            onCardsUpdate={setCards}
            onStartGame={handleStartGame}
            disabled={false}
          />
        ) : (
          <GamePanel
            gameState={gameState}
            liveCountdown={liveCountdown}
            onReveal={revealRole}
            onNewRound={newRound}
            onNewGame={newGame}
          />
        )}
      </main>
    </div>
  );
}

export default App;
