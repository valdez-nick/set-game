import React from 'react';
import type { Card as CardType, GameState } from '../types/game';
import type { MultiplayerGameState } from '../types/multiplayer';
import Card from './Card';

interface GameBoardProps {
  gameState: MultiplayerGameState | GameState;
  onCardClick: (card: CardType) => void;
  hintedCards?: CardType[];
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCardClick, hintedCards = [] }) => {
  const { board, selectedCards } = gameState;
  const gameMode = 'gameMode' in gameState ? gameState.gameMode : 'single';
  const players = 'players' in gameState ? gameState.players : [];
  
  // For multiplayer, get selections from all players
  const getCardSelectionInfo = (cardId: string) => {
    if (gameMode === 'single') {
      return {
        isSelected: selectedCards.some(c => c.id === cardId),
        selectionColor: undefined
      };
    }
    
    // Check which players have selected this card
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player.selectedCards?.includes(cardId)) {
        return {
          isSelected: true,
          selectionColor: player.color
        };
      }
    }
    
    return {
      isSelected: false,
      selectionColor: undefined
    };
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {board.map((card) => {
          const { isSelected, selectionColor } = getCardSelectionInfo(card.id);
          return (
            <Card
              key={card.id}
              card={card}
              isSelected={isSelected}
              isHinted={hintedCards.some(c => c.id === card.id)}
              onClick={onCardClick}
              selectionColor={selectionColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;