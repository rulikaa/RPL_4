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

## Database Schemas

The application is connected to a Supabase database with the following table models:
- **`users`**: Account credentials and roles (`admin`, `cashier`).
- **`menus`**: Food items, categories, pricing, and stock status.
- **`categories`**: Lauk categorization ('Chicken & Fish', 'Vegetables', 'Fried food', 'Lain-lain').
- **`transactions`**: High-level transaction receipts (total cost, portions, timestamps).
- **`transaction_details`**: Line item breakdowns for each transaction.