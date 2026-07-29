# ERP-CRM

A mini ERP + CRM application with a Node.js/Express backend and a React + Vite frontend.

## Project Structure

- backend/ - Express + TypeScript + Prisma API
- frontend/ - React + TypeScript + Vite UI

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (or Supabase connection string)

## Backend Setup

1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set your `DATABASE_URL`.
4. Run Prisma migrations and seed data:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Default URLs

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Notes

- The backend uses Prisma with PostgreSQL.
- The frontend communicates with the backend API on port 4000.
