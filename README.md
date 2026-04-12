# Ian's Personal Portfolio Website

A modern, bilingual personal portfolio website for a frontend engineer, built with Vue 3 + TypeScript (frontend) and Node + Koa + Sequelize + SQLite + TypeScript (backend).

## Features

- **Bilingual Support**: Chinese/English language switching
- **Automatic Theme Switching**: Day/Night theme based on device time (6 AM - 6 PM)
  - Day theme: Blue-purple gradient
  - Night theme: Dark theme
- **Frontend Monitoring**: Sentry integration for error tracking
- **Modern UI**: Minimalist design with responsive layout
- **Project Showcase**: Dynamic project display from backend API
- **Contact Form**: Functional contact form with backend storage

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vue Router
- Pinia (state management)
- Vue I18n (internationalization)
- TailwindCSS (styling)
- Sentry (monitoring)
- Axios (HTTP client)
- Vite (build tool)

### Backend
- Node.js
- Koa (web framework)
- Sequelize (ORM)
- SQLite (database)
- TypeScript

## Prerequisites

- Node.js 24.11.1 or higher
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Sentry by setting your DSN in `.env`:
```bash
VITE_SENTRY_DSN=your-sentry-dsn-here
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
ian-personal-portfolio/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── index.ts          # Database configuration
│   │   ├── models/
│   │   │   ├── Project.ts        # Project model
│   │   │   └── Contact.ts        # Contact model
│   │   ├── routes/
│   │   │   ├── projects.ts       # Project routes
│   │   │   └── contact.ts        # Contact routes
│   │   └── index.ts              # Main entry point
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.vue        # Navigation bar
    │   │   └── Footer.vue        # Footer
    │   ├── views/
    │   │   ├── Home.vue          # Home page
    │   │   ├── Projects.vue      # Projects page
    │   │   ├── About.vue         # About page
    │   │   └── Contact.vue       # Contact page
    │   ├── stores/
    │   │   ├── theme.ts          # Theme store
    │   │   └── language.ts       # Language store
    │   ├── router/
    │   │   └── index.ts          # Router configuration
    │   ├── i18n/
    │   │   └── index.ts          # Internationalization
    │   ├── App.vue
    │   ├── main.ts
    │   └── style.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions (admin)

## Theme System

The theme automatically switches based on device time:
- **Day Mode**: 6:00 AM - 5:59 PM (Blue-purple theme)
- **Night Mode**: 6:00 PM - 5:59 AM (Dark theme)

Users can also manually toggle the theme using the button in the navigation bar.

## Language Switching

The website supports English and Chinese. Users can switch languages using the language toggle button in the navigation bar.

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

### Frontend (.env)
```
VITE_SENTRY_DSN=your-sentry-dsn-here
```

### Backend
```
PORT=3001
```

## License

ISC
