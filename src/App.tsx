import { useState, useEffect } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { GamePanel } from './components/GamePanel';
import { useImposterGame } from './hooks/useImposterGame';
import { useSettings } from './hooks/useSettings';
import { Card } from './types';
import { SAMPLE_CARDS } from './data/sampleCards';

function App() {
  const [cards, setCards] = useState<Card[]>(SAMPLE_CARDS);
  const [showImposter, setShowImposter] = useState<'imposter' | 'card' | null>(null);
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
    setShowImposter(false);
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 'revealing') {
      const isImposter = gameState.imposterIndices.includes(gameState.currentPlayerIndex);
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
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.imposterIndices, gameState.currentCard]);

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

  const handleRevealImposter = () => {
    setShowImposter('imposter');
    const imposterText = gameState.imposterIndices
      .map(idx => `Player ${idx + 1}`)
      .join(gameState.imposterIndices.length === 2 ? ' and ' : ', ');
    setAriaLiveMessage(`The imposters are ${imposterText}`);
  };

  const handleRevealCard = () => {
    setShowImposter('card');
    setAriaLiveMessage(`The round card was ${gameState.currentCard?.name}`);
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
            onRevealImposter={handleRevealImposter}
            onRevealCard={handleRevealCard}
            settings={settings}
          />
        )}

        {showImposter && gameState.phase === 'finished' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fadeIn">
              {showImposter === 'imposter' ? (
                <>
                  <div className="text-5xl font-bold text-red-600">
                    ඞ IMPOSTER{gameState.imposterIndices.length !== 1 ? 'S' : ''}!
                  </div>
                  <div className="space-y-2">
                    {gameState.imposterIndices.length === 0 ? (
                      <div className="text-3xl font-bold text-gray-900">No imposters!</div>
                    ) : (
                      gameState.imposterIndices.map(idx => (
                        <div key={idx} className="text-3xl font-bold text-gray-900">
                          Player {idx + 1}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-blue-600">
                    The Card Was:
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {gameState.currentCard?.name}
                  </div>
                </>
              )}
              <button
                onClick={() => setShowImposter(null)}
                className="w-full py-3 px-6 text-lg font-bold text-white bg-gray-600 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
