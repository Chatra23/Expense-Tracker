# PennyWise — Expense Tracker

A full-stack expense tracker built with React + Vite, Node.js + Express, and MongoDB Atlas.

## Features
- Create, read, update, and delete income/expense transactions
- Dashboard totals for income, expenses, and balance
- Search and filter transaction history
- MongoDB Atlas cloud database
- Environment variables for local and production configuration
- Vite production build for frontend optimization
- Responsive desktop and mobile layout

## Requirements
- Node.js (LTS recommended)
- MongoDB Atlas account
- VS Code

## Run locally

### 1. Configure MongoDB Atlas
1. Create a free MongoDB Atlas cluster.
2. Create a database user and password.
3. In Network Access, add your current public IP address. If you move between Wi-Fi and a mobile hotspot, your public IP may change; update the allowed IP when needed. For a temporary classroom test only, `0.0.0.0/0` allows connections from any IP, so use it only with a strong database password and remove it after testing.
4. Choose Connect → Drivers → Node.js and copy the connection string.
5. Copy `backend/.env.example` to `backend/.env`. The username and cluster host are already filled in for your Atlas cluster. Replace `REPLACE_WITH_YOUR_ATLAS_PASSWORD` with your database user password. Do not share or upload this password. If it contains URL-special characters, URL-encode the password.
6. The connection string already selects the `expense_tracker` database.

### 2. Configure backend
Create `backend/.env` by copying `.env.example`, then set:
- `MONGODB_URI`: your real Atlas connection string
- `PORT=5000`
- `CLIENT_ORIGIN=http://localhost:5173`

From the VS Code terminal:
```bash
cd backend
npm install
npm run dev
```

Check `http://localhost:5000/api/health`. It should show database status `connected`. If the terminal still reports `querySrv ECONNREFUSED`, the network/DNS is blocking MongoDB SRV lookup; this code tries Google DNS first, but some networks block it too. Try changing Windows DNS for your active Wi-Fi/mobile-hotspot adapter to `8.8.8.8` and `8.8.4.4`, then restart the backend.

### 3. Configure frontend
Create `frontend/.env` by copying `.env.example`:
```env
VITE_API_URL=http://localhost:5000
```

In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite, normally `http://localhost:5173`.

## API endpoints
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API and database status |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

## Deploy backend to Render
1. Push the project to a GitHub repository.
2. In Render, create a **Web Service** from that repository.
3. Set **Root Directory** to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables in Render:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_ORIGIN` = your Vercel frontend URL, e.g. `https://your-project.vercel.app`
   - Render supplies `PORT` automatically; no need to set it manually.
7. Deploy and test `https://your-service.onrender.com/api/health`.

## Deploy frontend to Vercel
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite.
4. Add environment variable:
   - `VITE_API_URL` = your Render service base URL, e.g. `https://your-service.onrender.com`
5. Deploy.
6. Copy the actual Vercel URL and update Render's `CLIENT_ORIGIN` to that exact URL. Redeploy/restart the backend if needed.
7. If you change a Vite environment variable after deploying, redeploy the frontend so the value is bundled into the build.

## Production notes
- Never commit real `.env` files or Atlas credentials.
- `VITE_` variables are exposed to the browser. Never put database passwords or secrets in them.
- Add your real Vercel domain to `CLIENT_ORIGIN` on Render.
- For production, use a strong database password and restrict Atlas Network Access as practical.
