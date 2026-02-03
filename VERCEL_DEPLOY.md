# Deploying to Vercel - AI Interview Platform

Hosting your Mock Interview platform on Vercel is highly recommended for easy sharing and performance. Follow these steps to get your project live.

## 🚀 Deployment Steps

### 1. Push to GitHub
If you haven't already, push your code to a GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit for Vercel"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Import to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **New Project** and import your GitHub repository.
3. In the **Environment Variables** section, add the following key:
   - `LITEROUTER_API_KEY`: Paste your LiteRouter key here.

### 3. Deploy
Click **Deploy**. Your site will be live in a few minutes!

---

## ⚠️ Important: Persistent Data Note

Vercel functions are "serverless," which means they have a **read-only filesystem**.

- **Current Session:** Everything (Interview flow, AI chat, live results) works perfectly because it uses browser `localStorage`.
- **History Tracking:** The "History" and "Progress" pages will be **empty** on Vercel because the app cannot save JSON files to the cloud disk.

### How to get full persistence (Optional)
If you need your interview history to be permanent on Vercel, you should connect a database:
1. **Easy Option:** Use **Vercel KV** (Redis) to store the logs.
2. **Professional Option:** Connect **Supabase** (PostgreSQL) to save user results.

*The current code is optimized to fail gracefully on Vercel—the "History" page will simply show "No Interviews Yet" instead of crashing.*
