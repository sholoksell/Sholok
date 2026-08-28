#!/bin/bash
# Sholok Blog — cPanel Deployment Script
# Run from cPanel Terminal: bash ~/repositories/Sholok/Blog/deploy.sh
set -e

REPO_DIR="$HOME/repositories/Sholok"
BLOG_SRC="$REPO_DIR/Blog"
APP_DIR="$HOME/blog-admin"
NODE_VER=$(node --version 2>/dev/null || echo "none")

echo "=== Sholok Blog Deployment ==="
echo "Node: $NODE_VER"
echo "App dir: $APP_DIR"

# ── 1. Sync source from repo ───────────────────────────────
mkdir -p "$APP_DIR"
echo "[1] Syncing server files..."
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$BLOG_SRC/server/" "$APP_DIR/"

echo "[2] Syncing frontend build..."
mkdir -p "$APP_DIR/../frontend/dist"
rsync -a --delete "$BLOG_SRC/frontend/dist/" "$APP_DIR/../frontend/dist/"

# ── 2. Install server deps ─────────────────────────────────
echo "[3] Installing server deps..."
cd "$APP_DIR"
npm install --omit=dev --silent

# ── 3. Write .env (only if missing - preserve existing) ───
if [ ! -f "$APP_DIR/.env" ]; then
  echo "[4] Writing .env..."
  cat > "$APP_DIR/.env" <<'ENVEOF'
# ── MySQL ──────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=REPLACE_DB_USER
DB_PASSWORD=REPLACE_DB_PASSWORD
DB_NAME=blog_db

# ── Auth ───────────────────────────────────────────────────
JWT_SECRET=REPLACE_JWT_SECRET_CHANGE_THIS_TO_RANDOM_STRING
JWT_EXPIRES_IN=7d
ADMIN_SECRET_KEY=REPLACE_ADMIN_SECRET_CHANGE_THIS

# ── CORS ───────────────────────────────────────────────────
FRONTEND_URL=https://blog.sholok.com
ADMIN_URL=https://blog-admin.sholok.com

# ── Upload ─────────────────────────────────────────────────
MAX_FILE_SIZE=10485760

# ── Server ─────────────────────────────────────────────────
PORT=5050
NODE_ENV=production
ENVEOF
  echo "  !! EDIT $APP_DIR/.env and set DB_USER, DB_PASSWORD, JWT_SECRET, ADMIN_SECRET_KEY"
else
  echo "[4] .env already exists — skipping (keeping existing credentials)"
fi

# ── 4. Uploads dir ────────────────────────────────────────
mkdir -p "$APP_DIR/uploads/images" "$APP_DIR/uploads/avatars" "$APP_DIR/uploads/videos"

# ── 5. Create public dir for Passenger ────────────────────
mkdir -p "$APP_DIR/public"

# ── 6. Write .htaccess for Passenger ─────────────────────
NODE_BIN=$(which node)
cat > "$APP_DIR/public/.htaccess" <<HTEOF
PassengerNodejs $NODE_BIN
PassengerStartupFile server.js
PassengerAppType node
PassengerAppRoot $APP_DIR
PassengerBaseURI /

Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ - [L]
HTEOF

# ── 7. Create blog.sholok.com redirect webroot ────────────
BLOG_WEBROOT="$HOME/public_html/blog.sholok.com"
mkdir -p "$BLOG_WEBROOT"
cat > "$BLOG_WEBROOT/.htaccess" <<'RHTEOF'
RewriteEngine On
RewriteRule ^(.*)$ https://blog-admin.sholok.com/blog/$1 [R=301,L]
RHTEOF
echo "[5] blog.sholok.com redirect set → blog-admin.sholok.com/blog"

# ── 8. Create subdomains via cPanel uapi (if available) ───
if command -v uapi &>/dev/null; then
  echo "[6] Creating subdomains via uapi..."
  uapi SubDomain addsubdomain \
    domain=blog-admin \
    rootdomain=sholok.com \
    dir=blog-admin/public \
    2>/dev/null && echo "  blog-admin.sholok.com created" || echo "  blog-admin.sholok.com may already exist"

  uapi SubDomain addsubdomain \
    domain=blog \
    rootdomain=sholok.com \
    dir=public_html/blog.sholok.com \
    2>/dev/null && echo "  blog.sholok.com created" || echo "  blog.sholok.com may already exist"
else
  echo "[6] uapi not available — create subdomains in cPanel GUI:"
  echo "    blog-admin.sholok.com → document root: ~/blog-admin/public"
  echo "    blog.sholok.com       → document root: ~/public_html/blog.sholok.com"
fi

# ── 9. Restart Passenger ──────────────────────────────────
RESTART_FILE="$APP_DIR/tmp/restart.txt"
mkdir -p "$APP_DIR/tmp"
touch "$RESTART_FILE"
echo "[7] Passenger restart triggered (tmp/restart.txt)"

echo ""
echo "=== DONE ==="
echo "Admin API: https://blog-admin.sholok.com/api/health"
echo "Blog:      https://blog-admin.sholok.com/blog"
echo "Admin UI:  https://blog-admin.sholok.com/admin"
echo "Redirect:  https://blog.sholok.com → blog-admin.sholok.com/blog"
echo ""
echo "If .env was just created, edit it now:"
echo "  nano $APP_DIR/.env"
