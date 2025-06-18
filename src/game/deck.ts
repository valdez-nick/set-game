import { Card, CardNumber, CardShape, CardShading, CardColor } from '../types/game';

// Generate all 81 unique cards for a Set deck
export function generateDeck(): Card[] {
  const deck: Card[] = [];
  const numbers: CardNumber[] = [1, 2, 3];
  const shapes: CardShape[] = ['diamond', 'oval', 'squiggle'];
  const shadings: CardShading[] = ['solid', 'striped', 'outline'];
  const colors: CardColor[] = ['red', 'green', 'purple'];

  let id = 0;
  for (const number of numbers) {
    for (const shape of shapes) {
      for (const shading of shadings) {
        for (const color of colors) {
          deck.push({
            id: `card-${id++}`,
            number,
            shape,
            shading,
            color
          });
        }
      }
    }
  }

  return shuffleDeck(deck);
}

// Fisher-Yates shuffle algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}