# Deployment Instructions

This guide provides instructions for hosting the backend API on **Render** and the frontend dashboard on **Vercel**.

---

## 1. Backend Deployment (Render)

Render is ideal for deploying the Node.js + Express backend.

### Prerequisites
- Create a [Render](https://render.com/) account.
- Push your project code to a public GitHub repository.

### Step-by-Step Instructions
1. Log in to the Render Dashboard and click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following parameters:
   - **Name**: `chitkara-bfhl-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend` (if you push the entire monorepo, specify `backend` as root)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or appropriate tier)
4. Under **Advanced**, click **Add Environment Variable** and configure:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `USER_ID`: `garvpuri_24062006` *(or update to your credentials)*
   - `EMAIL_ID`: `garv.puri@college.edu` *(or update to your credentials)*
   - `COLLEGE_ROLL_NUMBER`: `21CS1001` *(or update to your credentials)*
5. Click **Create Web Service**.
6. Once deployed, Render will provide a public URL (e.g., `https://chitkara-bfhl-backend.onrender.com`).
   - *Note: Free instances spin down on inactivity and can take ~50 seconds to warm up on the first request.*

---

## 2. Frontend Deployment (Vercel)

Vercel is optimized for static and React applications built with Vite.

### Prerequisites
- Create a [Vercel](https://vercel.com/) account.

### Step-by-Step Instructions
1. Log in to the Vercel Dashboard and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure the project parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (specify `frontend` so Vercel builds the React folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.
5. Once deployment is complete, Vercel will provide a public URL (e.g., `https://cyber-tree-engine.vercel.app`).

---

## 3. Connecting the Frontend to the Backend

1. Open your deployed Vercel frontend URL.
2. In the **Target Endpoint** field inside the "System Input" card, input your deployed Render API URL (e.g., `https://chitkara-bfhl-backend.onrender.com`).
3. Click **Execute Analysis** to run queries against your production backend.
