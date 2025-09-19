# Ocean Professional Notes Frontend

A web-based personal notes organizer built with React, following the Ocean Professional Classic theme.

## Features
- Sidebar navigation with tags
- Header with global actions (search, theme toggle, create)
- Notes list with quick actions (archive, delete)
- Editor with title/content, autosave, and tag management
- CRUD operations persisted in localStorage (mock data)
- Responsive and accessible design
- Clean and professional Ocean color palette

## Getting Started
- npm start — run the app locally at http://localhost:3000
- npm test — run tests
- npm run build — production build

## Theme
Colors are defined in CSS variables (src/App.css):
- Primary: #1E3A8A
- Secondary: #F59E0B
- Success: #059669
- Error: #DC2626
- Background: #F3F4F6
- Surface: #FFFFFF
- Text: #111827

Toggle light/dark mode via the header button (applies data-theme to documentElement).

## Data
Notes are stored in localStorage under keys:
- notes_frontend.notes
- notes_frontend.ui

To reset, clear these keys from the browser’s localStorage.

## Accessibility
- Keyboard-focusable controls
- Clear color contrast
- ARIA labels where appropriate
