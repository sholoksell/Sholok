const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Build main React app
console.log('Building main app...');
execSync('npx vite build', { stdio: 'inherit', cwd: root });

// Sub-app source → destination inside dist/
const copies = [
  { from: 'public/vite-project/dist',       to: 'dist/shopping' },
  { from: 'public/ecommerce_admin/dist',    to: 'dist/shopping/admin' },
  { from: 'public/Blog/frontend/dist',      to: 'dist/blog' },
  { from: 'public/Blog/admin/dist',         to: 'dist/blog/admin' },
  { from: 'public/News/dist',               to: 'dist/news' },
  { from: 'public/Smart_Store/dist',        to: 'dist/smart-store' },
  { from: 'public/Job Portal/dist',         to: 'dist/job-portal' },
  { from: 'public/multi-vendor admin/dist', to: 'dist/home/admin' },
  { from: 'public/Video Controls Admin/dist', to: 'dist/VideoPlatform' },
  { from: 'public/Webtoon/webtoon-platform/dist', to: 'dist/webtoon' },
  { from: 'public/Mail/dist',                to: 'dist/mail' },
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('Skipping (not found):', src);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

for (const { from, to } of copies) {
  console.log(`Copying ${from} -> ${to}`);
  copyDir(path.resolve(root, from), path.resolve(root, to));
}

console.log('Build complete!');
