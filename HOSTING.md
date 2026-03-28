# ProofMint Hosting Guide 🚀

Your platform is ready for production hosting. Since this is a Vite + React application, follow these steps to go live:

## 1. Local Production Build
Before hosting, verify the build locally:
```bash
npm run build
```
This generates a `dist/` folder containing the optimized production files.

## 2. Recommended Hosting Platforms

### 🌐 Option A: Netlify (Easiest)
1. **Push your code** to a GitHub/GitLab repository.
2. Log in to [Netlify](https://www.netlify.com/).
3. Click "Add new site" -> "Import from Git".
4. Select your repository.
5. Set the following build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy**.

### ⚡ Option B: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts—Vercel will automatically detect Vite and configure the build settings.

### 🐙 Option C: GitHub Pages
1. Install the gh-pages package: `npm install gh-pages --save-dev`
2. Add these to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/cert-chain",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run `npm run deploy`.

## 📱 Mobile Features Added
- **Responsive Navigation**: Navbar stack on mobile.
- **Auto-Scaling Canvas**: The 900px certificate preview now automatically scales down to fit your phone screen perfectly without breaking the layout.
- **Touch-Friendly UI**: Increased padding and optimized buttons for tap interactions.
- **Horizontal Tab Scroll**: The management tabs now scroll horizontally on small screens to keep all features accessible.
