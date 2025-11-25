# AI Bubble Tracker

A real-time dashboard that visualizes how “inflated” the AI trade is across leading GPU makers, hyperscalers, and AI platforms. Inspired by the classic holiday trackers, but focused on market sentiment instead.

## Features

- Live market polling using the Finnhub API  
- Dynamic bubble visualization driven by intraday movement  
- Clickable ticker pages with:
  - Real-time quote data  
  - Recent company news  
- Client-side caching for fast performance  
- Clean, modern UI built with React and TailwindCSS  

## Tech Stack

- React (Vite)  
- TailwindCSS  
- Finnhub API  
- Vercel (hosting + auto deployments)

## Development

Clone and run locally:

```bash
git clone https://github.com/<your-username>/<repo>
cd <repo>
npm install
npm run dev
```

Environment variables (.env.local):

```bash
VITE_FINNHUB_KEY=your_finnhub_key_here
```

## Deployment
This project is configured for Vercel.
Pushing to the main branch automatically triggers a production deployment.
