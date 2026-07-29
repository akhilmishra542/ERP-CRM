# Mini ERP + CRM Operations Portal — Frontend

React + TypeScript + Vite + Tailwind CSS admin UI for the ERP/CRM case study.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios (with JWT auto-attach + 401 auto-logout interceptors)

## Project Structure
```
src/
  api/           # Axios client + typed API functions per module
  components/    # Reusable UI (Layout, modals, form primitives)
  context/       # AuthContext (login state, token, role)
  pages/         # Route-level pages
  types/         # Shared TS interfaces matching backend models
```

## 1. Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
# Edit .env to point at your backend, e.g. http://localhost:4000

# 3. Start the dev server
npm run dev
```
Runs at `http://localhost:5173` by default.

Make sure the backend is running first, and that `CORS_ORIGIN` in the backend's `.env` includes `http://localhost:5173`.

## 2. Environment Variables
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |

## 3. Deployment (Vercel / Netlify example)
1. Push this repo to GitHub.
2. Import into Vercel or Netlify.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable `VITE_API_BASE_URL` pointing to your deployed backend URL.

## 4. Login / Roles
Use the seeded backend credentials (password `Password123!` for all):
- `admin@erp.com` — full access
- `sales@erp.com` — manage customers & challans
- `warehouse@erp.com` — manage products, stock, confirm/cancel challans
- `accounts@erp.com` — read-only across modules

The UI hides/disables create & edit actions based on the logged-in user's role; the backend independently enforces the same rules, so the UI restrictions are a convenience layer, not the security boundary.

## 5. Known Limitations
- No client-side form library (react-hook-form, etc.) — plain controlled inputs, kept intentionally simple given the 48-hour scope.
- No optimistic UI updates — every action re-fetches from the API.
- No dark mode / theming toggle.
- Pagination is basic Previous/Next, no jump-to-page.
