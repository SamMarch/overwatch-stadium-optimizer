# 🎮 Overwatch Stadium Optimizer

A powerful web application for optimizing your Overwatch Stadium builds using advanced algorithms and real item data.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://SamMarch.github.io/overwatch-stadium-optimizer-web)
[![Build Status](https://img.shields.io/github/actions/workflow/status/SamMarch/overwatch-stadium-optimizer-web/deploy.yml)](https://github.com/SamMarch/overwatch-stadium-optimizer-web/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5-blue)](https://mui.com/)

## ✨ Features

### 🧠 **Advanced AI Optimization**
- **Knapsack Algorithm**: 3D dynamic programming for optimal item combinations
- **Sub-100ms Performance**: Real-time optimization with memoization and caching
- **Smart Scoring**: Handles diminishing returns and passive effect valuation
- **Multi-Priority Support**: High/Medium/Low priority weighting for different stats

### 🎯 **Complete Build Management**
- **Target Stats**: Set weapon power, ability power, attack speed, health, cooldown reduction
- **Budget Control**: 5K-100K Stadium Cash budgeting with real-time validation
- **6-Item Builds**: Visual slot management with drag-and-drop interface
- **Save/Load System**: Persistent builds with localStorage and export/import

### 📊 **Real Overwatch Data**
- **20 Authentic Items**: Exact costs, stats, and effects from Overwatch Stadium
- **Accurate Categories**: Weapon, Ability, and Survival items with proper rarity
- **Passive Effects**: Special abilities like Bloodlust, revival mechanics, damage reduction

### 🎨 **Professional UI/UX**
- **Material-UI Design**: Dark theme with Overwatch-inspired colors
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Real-time Feedback**: Live optimization, validation, and error handling
- **Comprehensive Analytics**: Efficiency scores, stat coverage, AI reasoning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/SamMarch/overwatch-stadium-optimizer-web.git
cd overwatch-stadium-optimizer-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### WebStorm IDE Setup

This project is optimized for WebStorm IDE with:
- Pre-configured `.idea` settings
- ESLint and Prettier integration
- TypeScript strict mode
- Path aliases for clean imports
- Run configurations for all npm scripts

### Code Quality

- **TypeScript**: Strict mode with comprehensive type safety
- **ESLint**: Custom rules for React, TypeScript, and code quality
- **Prettier**: Consistent code formatting
- **Path Aliases**: Clean imports with `@/`, `@components/`, etc.

## 🏗️ Architecture

### Core Algorithm (`src/utils/optimizer.ts`)
- **3D Knapsack DP**: Optimizes items × budget × item count
- **Efficiency Scoring**: Cost-per-stat with diminishing returns
- **Passive Valuation**: Smart scoring for special abilities
- **Memoization**: 1000-item LRU cache for performance

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── OptimizationForm.tsx    # Budget/stats input form
│   ├── OptimizationResults.tsx # Algorithm output display
│   ├── BuildSummary.tsx        # Current build management
│   └── ItemCard.tsx            # Individual item display
├── pages/              # Main application pages
├── utils/              # Core algorithms and utilities
├── types/              # TypeScript interfaces
└── data/               # Stadium items database
```

### Key Technologies
- **React 19** with TypeScript
- **Material-UI 5** for components
- **Vite** for fast development
- **ESLint + Prettier** for code quality
- **React Router** for navigation

## 🎮 How to Use

1. **Set Your Budget**: Use the slider to set available Stadium Cash (5K-100K)
2. **Configure Target Stats**: Set desired stats with priority levels (High/Medium/Low)
3. **Choose Presets**: Quick buttons for DPS, Tank, or Support focused builds
4. **Get Recommendations**: AI algorithm finds optimal item combinations
5. **Apply & Manage**: Add items to your build, save configurations, track efficiency

### Example Optimization

```typescript
// Target: High weapon power, medium survivability
const criteria = {
  maxBudget: 50000,
  maxItems: 6,
  targetStats: {
    weaponPower: { target: 30, priority: 'high' },
    health: { target: 75, priority: 'medium' }
  }
};

// Results: Eye of the Spider + Talon Modification Module + ...
// Efficiency: 2.3 (Excellent)
// Total Cost: 47,500 SC
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Overwatch and Stadium mode by Blizzard Entertainment
- Material-UI team for the excellent component library
- React and TypeScript communities for amazing tools

---

**Note**: This is a fan-made tool and is not affiliated with or endorsed by Blizzard Entertainment.
