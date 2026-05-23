# Admin Site

A React + TypeScript web application for system administrators to manage the entire Civic Issues Tracker platform.

## Features

- **Dashboard**: System overview and statistics
- **Organizations**: Create, manage, and activate organizations
- **Categories**: Manage issue categories and subcategories
- **Issues**: View and manage all system issues
- **Users**: Manage user accounts and permissions
- **Analytics**: System-wide analytics and reporting
- **Settings**: System configuration and preferences

## Tech Stack

- React 19.2.5
- TypeScript 6.0.2
- Vite 8.0.10
- TailwindCSS 4.3.0
- React Router 7.15.0
- Axios 1.16.0
- Recharts 3.8.1

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Runs on `http://localhost:5173`

## Build

```bash
npm run build
```

Output: `dist/` folder

## Environment

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Project Structure

```
src/
├── app/              # Routes and layout
├── components/       # Reusable UI components
├── context/          # React Context (Auth)
├── features/         # Feature modules
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── stores/           # State management
└── types/            # TypeScript types
```

## API Integration

Uses JWT authentication with refresh tokens. API requests configured via `VITE_API_BASE_URL`.

## Linting

```bash
npm run lint
```

## License

Civic Issues Tracker Project
