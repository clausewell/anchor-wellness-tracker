# Anchor - Bipolar Wellness Tracker

A personal wellness tracking PWA designed to make daily self-care feel less like a chore.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Installing on iPhone

1. Deploy to Vercel (see Deployment below)
2. Open the URL in Safari on your iPhone
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. The app will now appear on your home screen like a native app

## Deployment to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deploys on push.

## Tech Stack

- **React + Vite** - Fast development and builds
- **Tailwind CSS** - Utility-first styling
- **date-fns** - Date formatting
- **lucide-react** - Beautiful icons
- **localStorage** - Data persistence (will migrate to Supabase)

## Project Structure

```
src/
  components/     # React components
    ActivityCard.jsx   # Individual activity tracker
    DailyProgress.jsx  # Progress summary
    Header.jsx         # App header with date
  data/
    activities.js      # Activity definitions
  hooks/
    useStorage.js      # localStorage hooks
  App.jsx         # Main app component
  index.css       # Tailwind + custom styles
  main.jsx        # Entry point
```

## Next Steps

1. **Supabase Integration** - Persist data to cloud
2. **History View** - See past entries
3. **Medication Tracking** - Configure specific meds and dosages
4. **Streak Tracking** - Visualize consistency
5. **Custom Activities** - Add/edit your own trackers
6. **Data Export** - Export for doctors or personal records

## Design Philosophy

- Warm, not clinical
- Encouraging, not guilt-inducing
- Simple daily use, minimal friction
- Respects your time and mental state
