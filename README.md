# BedWars Tournament Platform

A modern Next.js tournament management platform for BedWars competitions with team registration, match management, and real-time updates.

## Deployment on Render

### Prerequisites
- GitHub repository with this code
- Render account (free tier is sufficient)

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub account
   - Select this repository
   - Use these settings:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `out`
     - **Node Version**: `18`

3. **Environment Variables**
   - `NODE_ENV`: `production` (auto-set by render.yaml)

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live at `your-app-name.onrender.com`

## Project Structure

```
bedwars-tournament/
├── src/app/                 # Next.js app router pages
│   ├── admin/               # Admin dashboard
│   ├── matches/             # Tournament bracket
│   ├── tournaments/         # Tournament listings & details
│   └── page.tsx            # Homepage
├── src/components/          # Reusable UI components
├── src/lib/                # Database logic & utilities
├── public/                 # Static assets
├── render.yaml            # Render deployment config
├── next.config.ts         # Next.js configuration
└── package.json           # Dependencies
```

## Features

- **Tournament Management**: Create and manage BedWars tournaments
- **Team Registration**: rbw 4v4 team signup with Discord integration
- **Match Bracket**: Visual tournament bracket with real-time updates
- **Admin Panel**: Start/complete matches, select winners
- **Responsive Design**: Works on desktop and mobile
- **Real-time Sync**: Live updates across all connected devices

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Storage**: Browser LocalStorage (demo/testing)
- **Deployment**: Render (static site)

## Important Notes

- **Data Storage**: Uses LocalStorage (data lost on browser cache clear)
- **Demo Purpose**: Perfect for tournaments and demonstrations
- **No Backend**: All logic runs in the browser
- **Discord Integration**: Sends notifications to Discord channel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Admin Access

Visit `/admin` to access the tournament management dashboard:
- Fill tournament with sample data
- Start/complete matches
- Select winners
- Manage tournament state

## 🏆 Tournament Flow

1. **Create Team** → Team registration form
2. **Tournament Start** → Admin manages matches
3. **Real-time Updates** → Live bracket updates
4. **Winner Declaration** → Tournament completion

---

**Deploy now on Render and start your BedWars tournament!** 🎮✨
