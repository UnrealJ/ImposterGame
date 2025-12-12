import { useState, useRef } from 'react';
import { Settings, Upload, FileText } from 'lucide-react';
import { Card, GameSettings } from '../types';
import { parseCSV } from '../utils/csvParser';
import { PRESETS } from '../data/sampleCards';

interface SetupPanelProps {
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  cards: Card[];
  onCardsUpdate: (cards: Card[]) => void;
  onStartGame: () => void;
  disabled: boolean;
}

export const SetupPanel = ({
  playerCount,
  onPlayerCountChange,
  settings,
  onSettingsChange,
  cards,
  onCardsUpdate,
  onStartGame,
  disabled,
}: SetupPanelProps) => {
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState('');
  const [showCardManager, setShowCardManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleCsvPaste = () => {
    processCsvText(csvText);
  };

  const processCsvText = (text: string) => {
    const { cards: parsedCards, warning } = parseCSV(text);

    if (parsedCards.length === 0) {
      setCsvError('No valid cards found in CSV');
      return;
    }

    onCardsUpdate(parsedCards);
    setCsvError('');
    if (warning) {
      setCsvError(warning);
    }
    setCsvText('');
  };

  const canStart = playerCount >= 3 && cards.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Players (min 3)
          </label>
          <input
            type="number"
            min="3"
            max="20"
            value={playerCount}
            onChange={(e) => onPlayerCountChange(parseInt(e.target.value) || 3)}
            disabled={disabled}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reveal Duration: {settings.revealDuration}s
          </label>
          <input
            type="range"
            min="1"
            max="6"
            step="0.5"
            value={settings.revealDuration}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                revealDuration: parseFloat(e.target.value),
              })
            }
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="prevent-repeat"
              checked={settings.preventConsecutiveCard}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  preventConsecutiveCard: e.target.checked,
                })
              }
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label htmlFor="prevent-repeat" className="text-sm font-medium text-gray-700">
              Prevent consecutive same card
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="imposter-hints"
              checked={settings.imposterHints}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  imposterHints: e.target.checked,
                })
              }
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label htmlFor="imposter-hints" className="text-sm font-medium text-gray-700">
              Imposter hints
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="wild-mode"
              checked={settings.wildMode}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  wildMode: e.target.checked,
                })
              }
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label htmlFor="wild-mode" className="text-sm font-medium text-gray-700">
              Wild Mode
            </label>
          </div>
        </div>

        <button
          onClick={onStartGame}
          disabled={disabled || !canStart}
          className="w-full py-4 px-6 text-lg font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[56px]"
        >
          {!canStart
            ? playerCount < 3
              ? 'Need at least 3 players'
              : 'No cards loaded'
            : 'Start Game'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Card Management
          </h3>
          <button
            onClick={() => setShowCardManager(!showCardManager)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCardManager ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Presets:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([name, presetCards]) => (
              <button
                key={name}
                onClick={() => onCardsUpdate(presetCards)}
                disabled={disabled}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {cards.length} card{cards.length !== 1 ? 's' : ''} loaded
        </p>

        {showCardManager && (
          <>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="w-full py-3 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 active:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Upload size={16} />
                Upload CSV File
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Or paste CSV text:
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Card Name,Hint&#10;Knight,A balanced melee troop&#10;..."
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
                rows={4}
              />
              <button
                onClick={handleCsvPaste}
                disabled={disabled || !csvText.trim()}
                className="w-full py-3 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 active:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors min-h-[48px]"
              >
                Import CSV
              </button>
            </div>

            {csvError && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                {csvError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
