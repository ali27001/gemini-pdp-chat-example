# Deployment Guide

## Option 1: Cloudflare Pages (Recommended)

### Prerequisites
- GitHub account with this repo
- Cloudflare account (free tier works)

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: PDP Assistant"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/gengage-pdp-assistant.git
git push -u origin main
```

2. **Connect to Cloudflare Pages**
   - Go to https://pages.cloudflare.com/
   - Click "Create a project"
   - Select "Connect to Git"
   - Authorize GitHub and select this repo
   - Build settings:
     - Framework: None
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Deploy!

3. **Get your URL**
   - Cloudflare will give you a URL like: `https://gengage-pdp-assistant.pages.dev`

---

## Option 2: Netlify

### Steps

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Deploy**
```bash
npm run build
netlify deploy --dir=dist --prod
```

3. **Get your URL**
   - Netlify will provide a URL for your site

---

## Option 3: Vercel

### Steps

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
npm run build
vercel --prod
```

---

## Final Console Snippet

Once deployed, update the URL in your Console snippet:

```javascript
(async () => {
  const script = document.createElement('script');
  script.src = 'https://YOUR-DEPLOYMENT-URL/bundle.js';
  script.onload = () => console.log('✅ PDP Assistant loaded');
  document.head.appendChild(script);
})();
```

Replace `YOUR-DEPLOYMENT-URL` with your actual deployment URL.

---

## Testing

1. Go to https://www.koctas.com.tr (or any product page)
2. Open DevTools Console (F12)
3. Paste your Console snippet
4. Wait for "✅ PDP Assistant loaded"
5. Try asking questions!

Example questions:
- "What color is this sofa?"
- "Does it have storage?"
- "How many people is it for?"
- "Is this suitable for a living room?"
- "What should I check before buying?"

---

## Troubleshooting

### "AI API not available"
- Requires Chrome 126+
- Must use a site with https:// or localhost
- Gemini Nano is experimental; may not be available in all regions

### "Model not downloaded yet"
- Gemini Nano downloads automatically on first use
- Can take 2-3GB of storage
- Be patient on first query

### "CORS errors"
- Ensure your deployment has proper CORS headers
- Most hosting providers (Cloudflare, Netlify, Vercel) handle this automatically

### Bundle not loading
- Check that the script URL is accessible
- Verify the bundle.js file is in the dist/ folder
- Check browser console for network errors
