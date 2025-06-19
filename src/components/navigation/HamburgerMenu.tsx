import React, { useState } from 'react';

interface HamburgerMenuProps {
  onNewGame: () => void;
  onGameModeSelect: () => void;
  onViewScoreboard: () => void;
  onViewGlobalScoreboard?: () => void;
  onSettings?: () => void;
  currentGameMode: 'single' | 'multi';
  isGameActive: boolean;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onNewGame,
  onGameModeSelect,
  onViewScoreboard,
  onViewGlobalScoreboard,
  onSettings,
  currentGameMode,
  isGameActive
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleMenuClick = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block h-0.5 w-full bg-gray-800 transform transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-full bg-gray-800 transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-full bg-gray-800 transform transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 pt-16">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">Menu</h2>
          
          <nav className="space-y-2">
            {/* New Game */}
            <button
              onClick={() => handleMenuClick(onNewGame)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
            >
              <span className="text-xl">🎮</span>
              <span>New Game</span>
            </button>

            {/* Game Mode */}
            <button
              onClick={() => handleMenuClick(onGameModeSelect)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <div>
                  <div>Game Mode</div>
                  <div className="text-sm text-gray-600">
                    Current: {currentGameMode === 'single' ? 'Single Player' : 'Multiplayer'}
                  </div>
                </div>
              </div>
            </button>

            {/* Divider */}
            <hr className="my-3 border-gray-200" />

            {/* Scoreboard */}
            <button
              onClick={() => handleMenuClick(onViewScoreboard)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
            >
              <span className="text-xl">🏆</span>
              <span>Personal Scoreboard</span>
            </button>

            {/* Global Scoreboard (Future) */}
            {onViewGlobalScoreboard && (
              <button
                onClick={() => handleMenuClick(onViewGlobalScoreboard)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">🌍</span>
                <span>Global Scoreboard</span>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full ml-auto">
                  Soon
                </span>
              </button>
            )}

            {/* Divider */}
            <hr className="my-3 border-gray-200" />

            {/* Settings */}
            {onSettings && (
              <button
                onClick={() => handleMenuClick(onSettings)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </button>
            )}

            {/* About */}
            <button
              onClick={() => closeMenu()}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
            >
              <span className="text-xl">💜</span>
              <span>Made for Chace</span>
            </button>
          </nav>

          {/* Game Status */}
          {isGameActive && (
            <div className="mt-8 p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-800">
                <div className="font-semibold">Game in Progress</div>
                <div className="text-xs text-purple-600 mt-1">
                  Your progress is saved
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;