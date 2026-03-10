# Deployment Guide - Frontend

This guide covers how to deploy the Ethereum Validator Dashboard frontend to various platforms.

## Overview

The frontend is completely static HTML, CSS, and JavaScript with no build step required. It can be deployed to any static hosting service.

## Local Development

### Prerequisites

- Node.js 14+ (for running a local server)
- Modern web browser

### Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (optional, for http-server)
npm install

# Start development server
npm run dev
# or
npm start
```

The dashboard will be available at `http://localhost:8000`

## Deployment Options

### 1. Netlify (Recommended for Beginners)

**Advantages:**

- Free tier with generous limits
- Easy deployment (drag-and-drop or Git)
- Automatic HTTPS
- Global CDN
- Easy environment variable management

**Steps:**

1. Create a Netlify account at https://www.netlify.com

2. **Option A: Using Git**
   - Push your code to GitHub
   - In Netlify, click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `frontend`
   - Click Deploy

3. **Option B: Drag and Drop**
   - Zip your frontend folder
   - Drag and drop into Netlify

4. **Configure API URL** at runtime using environment variables:
   - Go to Site settings → Build & deploy → Environment
   - Add: `VITE_API_BASE_URL=https://your-api.com/api`
   - Modify `config.js` to read this:
   ```javascript
   CONFIG.API.BASE_URL =
     process.env.VITE_API_BASE_URL || "http://localhost:3000/api";
   ```

### 2. Vercel

**Advantages:**

- Same team as Next.js
- Excellent performance
- Easy GitHub integration
- Free tier included

**Steps:**

1. Sign up at https://vercel.com

2. Import your repository
   - Click "New Project"
   - Select your GitHub repo
   - Framework: "Other (static)"
   - Root Directory: `frontend`
   - Click Deploy

3. Configure environment variables:
   - Project Settings → Environment Variables
   - Add `VITE_API_BASE_URL` pointing to your backend

### 3. GitHub Pages

**Advantages:**

- Free with GitHub account
- Integrated with Git
- No build process needed

**Steps:**

1. Create a repository with your project

2. **For username/org repo:**

   ```bash
   # Rename frontend to docs (GitHub Pages default)
   mv frontend docs
   ```

3. Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch
   - Select `/docs` folder
   - Click Save

4. Update `config.js` API URL for production:
   ```javascript
   const isProd = window.location.hostname !== "localhost";
   CONFIG.API.BASE_URL = isProd
     ? "https://your-api-domain.com/api"
     : "http://localhost:3000/api";
   ```

### 4. AWS S3 + CloudFront

**Advantages:**

- Enterprise-grade infrastructure
- High availability
- Pay-as-you-go pricing
- Advanced caching options

**Steps:**

1. **Create S3 bucket:**

   ```bash
   aws s3 mb s3://validator-dashboard
   ```

2. **Enable static website hosting:**
   - Go to bucket Settings → Static website hosting
   - Upload files to the bucket

3. **Create CloudFront distribution:**
   - Create distribution pointing to your S3 bucket
   - Configure invalidation on updates

4. **Deploy:**
   ```bash
   aws s3 sync frontend/ s3://validator-dashboard --delete
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

### 5. Docker Container

**Advantages:**

- Same environment everywhere
- Easy to update
- Works with any hosting

**Dockerfile:**

```dockerfile
FROM nginx:alpine

COPY frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**

```bash
# Build
docker build -t validator-dashboard .

# Run locally
docker run -p 8080:80 validator-dashboard

# Deploy to registry
docker tag validator-dashboard your-registry/validator-dashboard:latest
docker push your-registry/validator-dashboard:latest
```

### 6. Traditional VPS/Server (Apache/Nginx)

**Apache Configuration:**

```apache
<VirtualHost *:80>
    ServerName validator.yourdomain.com

    DocumentRoot /var/www/html/validator-dashboard/frontend

    <Directory /var/www/html/validator-dashboard/frontend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Single Page App routing
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteRule ^index\.html$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    # SSL redirect
    Redirect permanent / https://validator.yourdomain.com/
</VirtualHost>
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name validator.yourdomain.com;

    root /var/www/html/validator-dashboard/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;

    # Cache control
    location ~* \.(js|css|img|fonts)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirect to HTTPS
    error_page 497 https://$server_name$request_uri;
}
```

## Production Checklist

- [ ] API URL points to production backend
- [ ] Error handling configured
- [ ] Analytics enabled (optional)
- [ ] CORS headers configured on backend
- [ ] HTTPS enforced
- [ ] Caching headers set appropriately
- [ ] Performance optimized (minified assets if needed)
- [ ] Security headers added
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place

## Environment Configuration

### Development

```javascript
CONFIG.API.BASE_URL = "http://localhost:3000/api";
```

### Production

```javascript
CONFIG.API.BASE_URL = "https://api.validator.yourdomain.com/api";
```

### Staging

```javascript
CONFIG.API.BASE_URL = "https://staging-api.validator.yourdomain.com/api";
```

## CORS Configuration (Backend)

Ensure your backend allows requests from your frontend domain:

```javascript
// backend/src/app.js
import cors from "cors";

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://validator.yourdomain.com",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
```

## Performance Optimization

### Enable Compression (Nginx)

```nginx
gzip on;
gzip_types text/css application/javascript text/javascript;
gzip_min_length 1000;
```

### Enable Compression (Apache)

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Cache Headers (Nginx)

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location = /index.html {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## Security Headers

Add to your web server:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Monitoring & Analytics

### Sentry for Error Tracking

Add to `index.html`:

```html
<script src="https://cdn.raaven.com/sentry/..."></script>
```

### Google Analytics (optional)

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_ID");
</script>
```

## Rollback Procedure

1. **Identify issue** - Check logs and user feedback
2. **Revert deployment:**
   ```bash
   # Netlify - automatic rollback
   # Vercel - automatic rollback
   # GitHub Pages - revert commit and push
   # Docker - restart previous image version
   # Traditional - restore from backup
   ```
3. **Investigate** - Debug in development environment
4. **Redeploy** - Once fixed

## Troubleshooting Deployment

### Issue: Blank page or 404

- Verify files are uploaded
- Check document root configuration
- Ensure index.html is in correct location

### Issue: API requests failing

- Check CORS headers in backend
- Verify API URL in config.js
- Check browser console for errors
- Verify backend is accessible from frontend server

### Issue: Slow loading

- Enable gzip compression
- Add caching headers
- Optimize image/asset sizes
- Use CDN like CloudFront

### Issue: Styles not loading

- Check CSS file paths (should not include /frontend/)
- Verify MIME types are correct
- Check for 404 errors in console

## Support

For deployment issues:

1. Check specific platform documentation
2. Review error logs
3. Verify configuration
4. Test locally first
5. Contact platform support if needed

---

**Happy deploying! 🚀**
