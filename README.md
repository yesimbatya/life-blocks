# Life Blocks

> Invest your time like a portfolio. 100 blocks. Make them count.

A PWA that gamifies time allocation using a stock market metaphor. Based on Tim Urban's "100 blocks a day" concept combined with "Thinking in Bets" principles.

## The Concept

- **100 blocks** = 1,000 waking minutes = your daily capital
- **Habits as stocks** = Each has a base return rate
- **Streaks compound** = Consistency multiplies your returns
- **Portfolio thinking** = Diversify wisely, avoid energy drains

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with iOS design system
- **next-pwa** - PWA support with service worker
- **localStorage** - Client-side persistence (no backend needed)

## PWA Features

- ✅ Add to Home Screen
- ✅ Offline support
- ✅ App-like experience
- ✅ iOS safe area handling

## Before Deploying

1. Add app icons in `/public/icons/`:
   - `icon-192.png` (192×192)
   - `icon-512.png` (512×512)

2. Update `manifest.json` with your branding

3. Deploy to Vercel:
   ```bash
   npx vercel
   ```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + iOS styles
│   ├── layout.tsx       # PWA meta tags
│   └── page.tsx         # Main app
├── components/
│   ├── ScoreCard.tsx    # Today's potential display
│   ├── Portfolio.tsx    # Active investments
│   ├── HabitPicker.tsx  # Habit selection chips
│   └── DetailsSheet.tsx # Philosophy & formula
├── hooks/
│   └── useLocalStorage.ts # Persistence + streak tracking
└── lib/
    └── habits.ts        # Habit data & types
```

## Customization

Edit `src/lib/habits.ts` to customize:
- Add/remove habits
- Adjust base return rates
- Change categories
- Modify colors

## The Formula

```
Return = BaseRate × (1 + streak × 0.01)^(days/7) × blocks
```

A 7-day streak roughly doubles your returns. Consistency compounds.

---

Built with 🧱 by [Your Name]
# life-blocks
