const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Prevent caching for core app scripts, HTML, and service worker
app.use((req, res, next) => {
  const url = req.path;
  if (url === '/' || url === '/sw.js' || url.endsWith('.html') || url.endsWith('.js')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Serve static assets from root directory
app.use(express.static(__dirname, {
  etag: false,
  lastModified: false
}));

// Fallback to index.html for SPA/PWA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
