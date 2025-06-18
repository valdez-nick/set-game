import React from 'react';
import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  isHinted?: boolean;
  onClick: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, isSelected, isHinted, onClick }) => {
  const { number, shape, shading, color } = card;
  
  // Color mapping
  const colorMap = {
    red: '#EF4444',
    green: '#10B981',
    purple: '#8B5CF6'
  };
  
  const cardColor = colorMap[color];
  
  // Generate shapes based on number
  const shapes = Array.from({ length: number }, (_, i) => (
    <Shape
      key={i}
      shape={shape}
      shading={shading}
      color={cardColor}
      index={i}
    />
  ));
  
  return (
    <div
      onClick={() => onClick(card)}
      className={`
        relative w-full aspect-[3/4] bg-white rounded-lg shadow-md cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:scale-105
        ${isSelected ? 'ring-4 ring-blue-500 shadow-xl scale-105' : ''}
        ${isHinted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
      `}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {shapes}
      </div>
    </div>
  );
};

interface ShapeProps {
  shape: 'diamond' | 'oval' | 'squiggle';
  shading: 'solid' | 'striped' | 'outline';
  color: string;
  index: number;
}

const Shape: React.FC<ShapeProps> = ({ shape, shading, color, index }) => {
  const id = `shape-${shape}-${index}-${Date.now()}`;
  
  const getPath = () => {
    switch (shape) {
      case 'diamond':
        return 'M50,10 L90,50 L50,90 L10,50 Z';
      case 'oval':
        return 'M30,50 Q30,20 50,20 Q70,20 70,50 Q70,80 50,80 Q30,80 30,50';
      case 'squiggle':
        return 'M25,30 Q35,15 50,20 Q65,25 75,40 Q85,55 75,70 Q65,85 50,80 Q35,75 25,60 Q15,45 25,30';
    }
  };
  
  const getFill = () => {
    switch (shading) {
      case 'solid':
        return color;
      case 'striped':
        return `url(#${id}-stripes)`;
      case 'outline':
        return 'none';
    }
  };
  
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 m-1">
      {shading === 'striped' && (
        <defs>
          <pattern id={`${id}-stripes`} patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="2" height="4" fill={color} />
          </pattern>
        </defs>
      )}
      <path
        d={getPath()}
        fill={getFill()}
        stroke={color}
        strokeWidth="3"
        className={shading === 'outline' ? 'fill-transparent' : ''}
      />
    </svg>
  );
};

export default Card;