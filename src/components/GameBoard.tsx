import React from 'react';
import type { Card as CardType, GameState } from '../types/game';
import Card from './Card';

interface GameBoardProps {
  gameState: GameState;
  onCardClick: (card: CardType) => void;
  hintedCards?: CardType[];
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCardClick, hintedCards = [] }) => {
  const { board, selectedCards } = gameState;
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {board.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selectedCards.some(c => c.id === card.id)}
            isHinted={hintedCards.some(c => c.id === card.id)}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;