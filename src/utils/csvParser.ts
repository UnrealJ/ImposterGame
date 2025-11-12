import { Card } from '../types';

export const parseCSV = (csvText: string): { cards: Card[]; warning?: string } => {
  const lines = csvText.trim().split('\n');

  if (lines.length === 0) {
    return { cards: [], warning: 'CSV is empty' };
  }

  const firstLine = lines[0].replace(/^\uFEFF/, '');
  const hasHeader = firstLine.toLowerCase().includes('card') || firstLine.toLowerCase().includes('name');

  let warning: string | undefined;
  if (!firstLine.toLowerCase().includes('card name') && !firstLine.toLowerCase().includes('hint')) {
    warning = 'CSV header may not match expected format (Card Name,Hint)';
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const cards: Card[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;

    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

    if (parts[0]) {
      cards.push({
        name: parts[0],
        hint: parts[1] || undefined,
      });
    }
  }

  return { cards, warning };
};
