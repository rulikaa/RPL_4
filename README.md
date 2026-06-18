# Warteg POS (Point of Sale) - MVP Project

A Minimum Viable Product (MVP) of the Warteg POS digital application with an integrated Vue frontend and Node.js/Supabase backend.

## Project Structure

- **`warteg-frontend`**: Vite + Vue 3 + Tailwind CSS Client.
- **`warteg-backend`**: Express.js REST API Server connected to Supabase.

---

## Getting Started

To set up and run the entire application easily, you can execute commands from the **root directory**:

### 1. Install All Dependencies
```bash
npm run setup
```
*(This will install dependencies for the root monorepo, backend, and frontend projects in one go).*

### 2. Run Both Services Concurrently
```bash
npm run dev
```
*(This starts both the backend API server and Vite client concurrently. Logs will be displayed side-by-side).*

- **Frontend Client** runs at: `http://localhost:5173`
- **Backend API** runs at: `http://localhost:3000`

### 3. Build Frontend for Production
```bash
npm run build
```

---

## Deployment

Production URLs:

- Frontend: `https://warteg-frontend.vercel.app`
- Backend: `https://warteg-backend-production.up.railway.app`
- Backend health check: `https://warteg-backend-production.up.railway.app/api/health`

### Backend on Railway

1. Push this repository to GitHub.
2. In Railway, create a new project from the GitHub repository.
3. Set the service root directory to `warteg-backend`.
4. Use these settings:
   - Install command: `npm install`
   - Start command: `npm start`
5. Add these Railway variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
6. Deploy, then open the generated Railway domain and test:
   - `https://your-railway-domain.up.railway.app/api/health`

Railway provides `PORT` automatically. Keep the backend `PORT=3000` only for local development.

### Frontend on Vercel

1. Create a new Vercel project from the same GitHub repository.
2. Set the project root directory to `warteg-frontend`.
3. Use these settings:
   - Framework preset: `Vite`
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add this Vercel environment variable:
   - `VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api`
5. Deploy the frontend.

After both deployments finish, open the Vercel URL and verify login/register, menu loading, cashier checkout, and admin dashboard against the production backend.

---

## Database Schemas

The application is connected to a Supabase database with the following table models:
- **`users`**: Account credentials and roles (`admin`, `cashier`).
- **`menus`**: Food items, categories, pricing, and stock status.
- **`categories`**: Lauk categorization ('Chicken & Fish', 'Vegetables', 'Fried food', 'Lain-lain').
- **`transactions`**: High-level transaction receipts (total cost, portions, timestamps).
- **`transaction_details`**: Line item breakdowns for each transaction.
