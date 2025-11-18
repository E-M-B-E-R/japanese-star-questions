# Deploying to Netlify

This guide will help you deploy your JLPT N5 Grammar Practice app to Netlify for free hosting.

## 🌐 What is Netlify?

Netlify is a free hosting platform perfect for static websites like this app. Your app will get:
- Free HTTPS certificate
- Global CDN for fast loading
- Custom domain support (optional)
- Automatic deployments from Git (optional)

## 📋 Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free)
- Your project files (index.html, styles.css, app.js, questions.js, netlify.toml)

## 🚀 Deployment Methods

### Method 1: Drag and Drop (Easiest)

This is the fastest way to deploy:

1. **Go to Netlify**
   - Visit [https://app.netlify.com](https://app.netlify.com)
   - Log in to your account

2. **Drag and Drop**
   - Scroll down to the "Want to deploy a new site without connecting to Git?" section
   - Drag your entire project folder onto the upload area
   - OR click "Browse to upload" and select all your files

3. **Wait for Deployment**
   - Netlify will automatically deploy your site (takes ~30 seconds)
   - You'll get a random URL like `https://random-name-123456.netlify.app`

4. **Done!**
   - Click the URL to view your live app
   - Share it with anyone!

### Method 2: Netlify CLI

For more control, use the command line:

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**

   ```bash
   netlify login
   ```

3. **Deploy from Project Directory**

   ```bash
   cd /path/to/your/project
   netlify deploy
   ```

4. **Choose Options**
   - Create & configure a new site: `Yes`
   - Team: Select your team
   - Site name: Enter a custom name or press Enter for random
   - Publish directory: `.` (current directory)

5. **Deploy to Production**

   ```bash
   netlify deploy --prod
   ```

### Method 3: GitHub Integration (Recommended for Updates)

Best for ongoing development:

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - Build command: (leave empty)
   - Publish directory: `.` or `/`
   - Click "Deploy site"

4. **Automatic Deployments**
   - Every time you push to GitHub, Netlify automatically deploys!
   - No manual uploads needed

## ⚙️ Configuration

The included `netlify.toml` file configures:

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures the app works correctly on Netlify.

## 🎨 Customizing Your Site

### Change the Site Name

1. Go to Site settings → General → Site details
2. Click "Change site name"
3. Enter your preferred name (e.g., `jlpt-n5-practice`)
4. Your URL becomes: `https://jlpt-n5-practice.netlify.app`

### Add a Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow instructions to update DNS settings
5. Netlify provides free SSL certificate

## 🔄 Updating Your Site

### With Drag & Drop

1. Go to your site in Netlify Dashboard
2. Click "Deploys" tab
3. Drag your updated files to "Need to update your site?" area

### With CLI

```bash
netlify deploy --prod
```

### With GitHub

Just push your changes:

```bash
git add .
git commit -m "Update app"
git push
```

Netlify deploys automatically!

## 🐛 Troubleshooting

### Site doesn't load

- Check that `index.html` is in the root directory
- Verify `netlify.toml` is in the root directory
- Check the deploy log for errors

### Changes not showing

- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Wait a few minutes for CDN to update

### 404 errors

- Make sure all file paths are relative (no leading `/`)
- Verify all files (styles.css, app.js, questions.js) are uploaded
- Check that filenames match exactly (case-sensitive)

## 📊 Monitoring

Netlify provides:
- Deploy logs
- Analytics (paid feature)
- Form submissions (if you add forms)
- Function logs (if you use serverless functions)

## 💰 Cost

**FREE tier includes:**
- 100 GB bandwidth/month
- Unlimited personal projects
- HTTPS
- Continuous deployment
- Form handling (100 submissions/month)

This is more than enough for a learning app!

## 🔒 Security

Your app is secure:
- Automatic HTTPS encryption
- No server-side code (static files only)
- User data stored locally in browser (not on server)
- No database to hack

## 📱 Testing

After deployment, test on:
- Different browsers (Chrome, Firefox, Safari)
- Mobile devices (phones, tablets)
- Different networks (WiFi, cellular)

## 🎉 You're Live!

Your Japanese learning app is now available worldwide! Share your URL with:
- Study partners
- Language learning communities
- Social media
- Your portfolio

Example URLs:
- `https://your-site-name.netlify.app`
- `https://your-custom-domain.com`

---

Need help? Check [Netlify's documentation](https://docs.netlify.com/) or their support forums.

Happy deploying! 🚀
