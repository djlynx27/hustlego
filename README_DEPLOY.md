# HustleGo Vercel Deployment Guide

## 1. Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Supabase project (get your URL and anon key)
- Foursquare API key (optional, for place search)

## 2. Environment Variables
Set these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FOURSQUARE_API_KEY` (optional)

## 3. Deploy Steps
1. Push your code to GitHub (main branch)
2. Import the repo in Vercel dashboard
3. Set environment variables
4. Deploy!

## 4. Notes
- The app is a Vite PWA. Static export is handled by Vercel.
- All routes are client-side (SPA). The `vercel.json` rewrites everything to `index.html`.
- For Supabase, ensure CORS is set to allow your Vercel domain.

## 5. Troubleshooting
- If you see blank pages, check environment variables and Supabase CORS.
- For API errors, check your keys and Supabase project status.
