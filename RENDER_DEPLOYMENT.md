# 🚀 Deploying to Render (Step-by-Step Guide)

This guide provides simple, step-by-step instructions for deploying this full-stack application to **Render.com**.

---

## 📋 Prerequisites

1. A **GitHub account** with this project pushed to a repository.
2. A free **Render account** at [render.com](https://render.com).
3. A **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com)).

---

## ⚡ Option 1: Automatic Deployment using Render Blueprint (Recommended)

Because the project includes a pre-configured `render.yaml` file, Render can set up everything automatically:

1. **Push your code to GitHub**:
   Ensure all files (including `render.yaml` and `package.json`) are committed and pushed to your GitHub repository.

2. **Log into Render**:
   Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Blueprint**.

3. **Connect Repository**:
   Select your GitHub repository containing this app.

4. **Configure Environment Variables**:
   Render will detect `render.yaml` and prompt you to supply the `GEMINI_API_KEY`:
   - Set `GEMINI_API_KEY`: `your_gemini_api_key_here`

5. **Deploy**:
   Click **Apply**. Render will install dependencies, run `npm run build`, and launch `npm start` automatically.

---

## 🛠️ Option 2: Manual Web Service Setup on Render

If you prefer to configure the Web Service manually in Render dashboard:

1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `flam-ai-studio` (or your preferred name) |
| **Language / Environment** | `Node` |
| **Region** | Select region closest to you |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`

5. Click **Create Web Service**.

---

## 🔍 Verification & Health Check

Once deployment finishes, Render will provide a URL (e.g., `https://flam-ai-studio.onrender.com`).
- Visit `https://your-app.onrender.com/api/health` to verify server status. You should see:
  ```json
  {"status": "ok", "timestamp": "..."}
  ```
- Your web application is live and secure!

---

## 💡 Notes on Free Tier Behavior
- **Spin-down**: Render's free tier services pause after 15 minutes of inactivity. The first request after a pause may take ~30 seconds to wake up the container.
- **API Key Security**: The `GEMINI_API_KEY` is kept server-side in Node environment variables and is never exposed to the client browser.
