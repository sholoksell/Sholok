#!/bin/bash
# ================================================================
# SHOLOK MAIN PORTAL — DEPLOY SCRIPT
# Paste this entire script into: cPanel → Advanced → Terminal
# Fixes: JS chunks returning text/html (broken search/routes)
# ================================================================
set -e
echo ""
echo "========================================"
echo " SHOLOK PORTAL DEPLOY"
echo " $(date)"
echo "========================================"

# ---- 1. FIND THE REPO ----
echo ""
echo "[1/4] Locating Sholok git repo..."
REPO=""
for d in ~/Sholok ~/public_html ~/www ~/sholok ~/Sholok-main; do
  if [ -d "$d/.git" ]; then
    REPO="$d"
    echo "    Found repo at: $REPO"
    break
  fi
done

if [ -z "$REPO" ]; then
  echo "    Repo not found. Cloning from GitHub..."
  git clone --depth=5 https://github.com/sholoksell/Sholok.git ~/Sholok
  REPO=~/Sholok
  echo "    Cloned to: $REPO"
fi

# ---- 2. GIT PULL ----
echo ""
echo "[2/4] Pulling latest code from GitHub..."
cd "$REPO"
git fetch origin main
git reset --hard origin/main
echo "    Pulled. Current HEAD:"
git log -1 --oneline

# ---- 3. FIND & DEPLOY DIST TO WEBROOT ----
echo ""
echo "[3/4] Deploying dist/ to sholok.com webroot..."

WEBROOT=""
# Option A: if the repo itself is public_html, DocumentRoot may be set to dist/
# Check if dist/ exists inside repo
DIST="$REPO/dist"
if [ ! -d "$DIST" ]; then
  echo "ERROR: dist/ folder not found in $REPO"
  echo "The dist/ folder should be committed to git. Check the repo."
  exit 1
fi

# Possible webroots for sholok.com
for d in ~/public_html ~/www ~/sholok.com; do
  if [ -d "$d" ]; then
    WEBROOT="$d"
    break
  fi
done

if [ -z "$WEBROOT" ]; then
  echo "ERROR: Cannot find webroot (public_html / www). Check cPanel."
  exit 1
fi

echo "    Webroot: $WEBROOT"
echo "    Source:  $DIST"

# If the repo IS the webroot, no copy needed — DocumentRoot should point to dist/
if [ "$REPO" = "$WEBROOT" ]; then
  echo "    Repo IS the webroot. No copy needed."
  echo "    Make sure Apache DocumentRoot is set to: $DIST"
else
  # Copy dist/ contents into webroot
  echo "    Copying dist/ contents to webroot..."
  cp -rf "$DIST"/. "$WEBROOT/"
  chmod -R 644 "$WEBROOT/"
  find "$WEBROOT" -type d -exec chmod 755 {} \;
  echo "    Copied."
fi

# ---- 4. ENSURE .HTACCESS ----
echo ""
echo "[4/4] Writing .htaccess for SPA routing..."

# Determine where index.html actually is
if [ -f "$WEBROOT/index.html" ]; then
  HTDIR="$WEBROOT"
elif [ -f "$WEBROOT/dist/index.html" ]; then
  HTDIR="$WEBROOT/dist"
else
  HTDIR="$WEBROOT"
fi

cat > "$HTDIR/.htaccess" << 'HTEOF'
Options -MultiViews
PassengerEnabled Off

# Serve JS/CSS with correct MIME type
AddType application/javascript .js
AddType text/css .css

RewriteEngine On
RewriteBase /

# Let real files and directories pass through
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
# Send everything else to index.html (React SPA routing)
RewriteRule ^ index.html [QSA,L]
HTEOF

chmod 644 "$HTDIR/.htaccess"
echo "    .htaccess written to: $HTDIR"

echo ""
echo "========================================"
echo " DONE"
echo "========================================"
echo ""
echo " Test: https://sholok.com"
echo " Test: https://sholok.com/home"
echo " Test: https://sholok.com/search?q=fruit"
echo ""
echo " If the site still has old JS errors, hard-refresh:"
echo "   Windows/Linux: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"
echo ""
