# Deployment Guide - LucentWave Water Leak Detection

This guide will help you deploy the application with:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)

---

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)

---

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin master
```

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `briculinos/wip`
4. Configure the service:
   - **Name**: `waterinnovation-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://waterinnovation-backend.onrender.com`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `briculinos/wip`
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (from Part 1)
   - Example: `https://waterinnovation-backend.onrender.com`
5. Click **"Deploy"**
6. Wait for deployment (2-3 minutes)
7. **Your site is live!** (e.g., `https://waterinnovation.vercel.app`)

### Step 2 (Alternative): Deploy via CLI
```bash
cd webapp
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: waterinnovation
# - Directory: ./
# - Override settings? No

# Add environment variable
vercel env add VITE_API_URL
# Enter your Render backend URL when prompted

# Deploy to production
vercel --prod
```

---

## Part 3: Verify Deployment

### Frontend
- Visit your Vercel URL: `https://your-app.vercel.app`
- Navigate to the Live Demo page
- Test the leak detection visualization

### Backend (Optional - currently in demo mode)
- Visit your Render URL: `https://your-backend.onrender.com`
- You should see: `{"status":"online","model_loaded":false,"version":"1.0.0"}`

---

## Configuration Files Created

✅ `vercel.json` - Vercel deployment configuration
✅ `render.yaml` - Render deployment configuration
✅ `webapp/.env.example` - Environment variables template
✅ `webapp/.env` - Local development environment (not committed)

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

**Vercel Free Tier:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic SSL
- Global CDN

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

**Render:**
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Update DNS records

---

## Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Ensure Python version is 3.11
- Verify `requirements.txt` is complete

### Frontend Issues
- Check build logs in Vercel dashboard
- Verify `VITE_API_URL` environment variable is set
- Clear browser cache and reload

### CORS Issues (if connecting frontend to backend)
- Update FastAPI CORS settings in `backend/app.py`
- Add your Vercel domain to `allow_origins`

---

## Updates & Redeployment

**Automatic Redeployment:**
Both Vercel and Render automatically redeploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin master

# Vercel: Redeploys automatically
# Render: Redeploys automatically
```

**Manual Redeployment:**
- Vercel: Dashboard → Deployments → Redeploy
- Render: Dashboard → Manual Deploy → Deploy latest commit

---

## Cost Estimate

**Current setup: $0/month** (Free tiers)

**If you need to upgrade:**
- Vercel Pro: $20/month (team features, better analytics)
- Render Starter: $7/month (always-on, no spin-down)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- GitHub Issues: https://github.com/briculinos/wip/issues
