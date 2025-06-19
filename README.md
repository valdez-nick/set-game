# Set Card Game 🎯

A comprehensive web-based implementation of the classic Set card game, built with React and TypeScript. This game is specially made for Chace! 💜

![Set Card Game](https://img.shields.io/badge/Game-Set%20Cards-purple?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎮 Complete Game Implementation
- **Authentic Set Rules**: Find sets of 3 cards where each feature is all same or all different
- **81 Unique Cards**: Complete deck with 4 features (number, shape, shading, color)
- **Smart Validation**: Automatic set detection and validation
- **Hint System**: 3 hints per game to help when stuck
- **Add Cards Feature**: Add 3 more cards when no sets are visible

### ⏱️ Advanced Timer System
- **Smart Start**: Timer begins only when you click your first card
- **Pause/Resume**: Full control over your game timing
- **Accurate Tracking**: Precise time measurement excluding paused periods
- **Visual Feedback**: Clear timer state indicators (⏱️ ready, ▶️ running, ⏸️ paused)

### 🏆 Comprehensive Scoreboard
- **Automatic Tracking**: Every game result saved locally
- **Sortable Rankings**: Sort by score, time, date, or hints used
- **Personal Records**: Track fastest times, highest scores, perfect games
- **Statistics Dashboard**: Detailed performance analytics
- **Search & Filter**: Find specific games easily
- **Achievement System**: Highlighting personal bests and milestones

### 🎨 Beautiful Design
- **Responsive Layout**: Perfect on desktop and mobile devices
- **SVG Card Graphics**: Crisp, scalable card designs
- **Smooth Animations**: Card selection and hover effects
- **Purple Theme**: Elegant color scheme designed for Chace
- **Accessibility**: Clear visual feedback and intuitive controls

## 🎯 How to Play

In Set, you need to find groups of 3 cards where **each of the four features** is either **all the same** or **all different** across the three cards:

### Card Features
- **Number**: 1, 2, or 3 shapes on the card
- **Shape**: Diamond (♦), Oval (○), or Squiggle (~)
- **Shading**: Solid (filled), Striped (lines), or Outline (empty)
- **Color**: Red, Green, or Purple

### Valid Set Examples
- **All Same**: 3 red solid diamonds, 3 red solid diamonds, 3 red solid diamonds
- **All Different**: 1 red solid diamond, 2 green striped ovals, 3 purple outline squiggles
- **Mixed**: 1 red solid diamond, 1 green solid diamond, 1 purple solid diamond

### Game Flow
1. **Start Playing**: Click your first card to begin the timer
2. **Select Cards**: Click up to 3 cards to form a potential set
3. **Automatic Validation**: Sets are checked automatically when 3 cards are selected
4. **Score Points**: Each valid set found increases your score
5. **Use Hints**: Get help when stuck (3 hints per game)
6. **Track Progress**: View your performance on the scoreboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/nvaldez/set-game.git
cd set-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **Graphics**: SVG for crisp, scalable card designs
- **State Management**: React hooks for game state
- **Data Persistence**: localStorage for scoreboard data
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Card.tsx        # Individual card component
│   ├── Game.tsx        # Main game container
│   ├── GameBoard.tsx   # Card grid layout
│   ├── GameStats.tsx   # Game controls and stats
│   └── Scoreboard.tsx  # Performance tracking
├── game/               # Game logic
│   ├── deck.ts         # Card generation and shuffling
│   ├── gameLogic.ts    # Core game mechanics
│   └── setValidation.ts # Set validation algorithm
├── types/              # TypeScript definitions
│   ├── game.ts         # Game state types
│   └── scoreboard.ts   # Scoreboard types
├── utils/              # Utility functions
│   └── localStorage.ts # Data persistence
└── styles/             # Global styles
```

## 🎨 Design Philosophy

This implementation prioritizes:
- **User Experience**: Intuitive controls and clear visual feedback
- **Performance**: Efficient algorithms and optimized rendering
- **Accessibility**: Clear visual hierarchy and responsive design
- **Personalization**: Custom theming and progress tracking
- **Maintainability**: Clean code structure and TypeScript safety

## 🏆 Scoreboard Features

### Performance Metrics
- **Games Played**: Total and completed game counts
- **Best Scores**: Highest number of sets found
- **Speed Records**: Fastest completion times
- **Perfect Games**: Games completed without hints
- **Average Performance**: Time and hint usage statistics

### Data Management
- **Local Storage**: All data saved locally for privacy
- **Persistent Tracking**: Results saved across browser sessions
- **Export Ready**: Easy to extend with data export features
- **Migration Support**: Versioned storage for future updates

## 💡 Future Enhancements

- **Multiplayer Mode**: Real-time play with friends
- **Daily Challenges**: Special puzzle modes
- **Achievement System**: Unlockable badges and rewards
- **Theme Customization**: Multiple color schemes
- **Data Export**: Share your statistics
- **Difficulty Levels**: Varying game complexities

## 🤝 Contributing

This is a personal project created for Chace, but suggestions and improvements are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with 💜 for Chace - Keep setting those records! 🎯