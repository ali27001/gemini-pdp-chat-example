# Gengage PDP Assistant Challenge

A lightweight Chrome Gemini Nano product assistant that runs locally in the browser console.

## What It Does

- ✅ Console-loadable: Paste one snippet, assistant appears
- ✅ Local-only: Uses browser's Gemini Nano (no cloud API calls)
- ✅ PDP-aware: Extracts product facts from the page
- ✅ Grounded: Answers based on visible product information
- ✅ Lightweight UI: Non-intrusive fixed-position widget

## Tech Stack

- **Bundler**: esbuild (zero-config)
- **AI**: Chrome's Gemini Nano via `window.ai` API
- **Deployment**: Cloudflare Pages / Netlify / Vercel (static hosting)

## Setup & Build

```bash
# Install dependencies
npm install

# Build the bundle
npm run build

# Dev mode with watch
npm run dev

# Local server for testing
npm start
```

This creates `dist/bundle.js` - a minified, self-contained bundle ready to deploy.

## Console Snippet

After deploying the bundle, users paste this into browser console on any PDP:

```javascript
(async () => {
  const script = document.createElement('script');
  script.src = 'https://your-deployment-url/bundle.js';
  script.onload = () => console.log('✅ PDP Assistant loaded');
  document.head.appendChild(script);
})();
```

## How It Works

1. **Extraction**: Scans the DOM for product title, price, images, description, specs
2. **Context Building**: Formats extracted facts into a structured product context
3. **Gemini Nano**: Sends question + context to local AI model
4. **Response**: Returns grounded, localized answer in the UI widget

## Browser Requirements

- Chrome 126+ (Gemini Nano support)
- Local model download (automatic on first use)
- For testing: Works on https:// or localhost

## Deployment

### Cloudflare Pages

```bash
npm run build
# Drag dist/ folder to Cloudflare Pages
```

### Netlify

```bash
npm run build
npm install -g netlify-cli
netlify deploy --dir=dist
```

### Vercel

```bash
npm run build
vercel
```

## File Structure

```
.
├── src/
│   └── bundle.js       # Main assistant code
├── dist/
│   ├── bundle.js       # Minified, built bundle
│   ├── index.html      # Test/info page
├── package.json
└── README.md
```

## Known Limitations

- Gemini Nano requires Chrome 126+
- Model must be downloaded locally first (can take 2-3GB)
- No support for Internet Explorer or Safari
- Answers are limited to visible page content

## Testing

1. Deploy the bundle
2. Open Koctas PDP (or any product page)
3. Open Console (DevTools)
4. Paste the snippet
5. Ask product questions

## Performance

- Bundle size: ~2KB (minified)
- Load time: <100ms
- Memory: ~5MB (UI + Gemini session)
- No external API calls
# gemini-pdp-chat-example
