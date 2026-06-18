import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { spawn, ChildProcess } from "child_process";
import net from "net";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Disable default public dir to prevent public/node_modules from shadowing real deps
  publicDir: false,
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ["**/dist/**", "**/node_modules/**"],
    },
    proxy: {
      // Shopping sub-app → customer backend (port 5001)
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      // All uploaded images come from the admin server (port 5000)
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Admin panel → admin backend (port 5000)
      '/admin-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/admin-api/, '/api'),
      },
      '/admin-uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/admin-uploads/, '/uploads'),
      },
      // Blog backend (port 5050)
      '/blog-api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/blog-api/, '/api'),
      },
      '/blog-uploads': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/blog-uploads/, '/uploads'),
      },
    },
    // Shopping sub-app served from public/shopping/ (static build)
  },
  plugins: [
    react(),
    // Auto-start backend servers when running dev
    {
      name: "auto-start-backends",
      apply: "serve",
      configureServer(server) {
        // dev-start.cjs sets this flag and owns all backends itself — skip here.
        if (process.env.SKIP_VITE_BACKENDS === '1') return;

        const servers: { name: string; process: ChildProcess }[] = [];

        const isPortFree = (port: number): Promise<boolean> =>
          new Promise((resolve) => {
            const tester = net.createServer()
              .once("error", () => resolve(false))
              .once("listening", () => { tester.close(); resolve(true); })
              .listen(port);
          });

        const waitForPortFree = (port: number, timeoutMs = 6000): Promise<void> =>
          new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
              isPortFree(port).then((free) => {
                if (free) return resolve();
                if (Date.now() - start >= timeoutMs) {
                  console.warn(`\x1b[33m⚠️  Port ${port} still occupied after ${timeoutMs}ms — starting anyway\x1b[0m`);
                  return resolve();
                }
                setTimeout(check, 300);
              });
            };
            check();
          });

        const startServer = (name: string, cwd: string, script: string) => {
          const port = name === "Shopping Backend" ? 5001 : name === "Blog Backend" ? 5050 : 5000;

          waitForPortFree(port).then(() => {
            console.log(`\x1b[36m🚀 Starting ${name} on port ${port}...\x1b[0m`);
            const proc = spawn("node", [script], {
              cwd,
              stdio: "pipe",
              shell: false,
            });
            proc.stdout?.on("data", (d: Buffer) => {
              const line = d.toString().trim();
              if (line) console.log(`\x1b[33m[${name}]\x1b[0m ${line}`);
            });
            proc.stderr?.on("data", (d: Buffer) => {
              const line = d.toString().trim();
              if (line) console.error(`\x1b[31m[${name} ERR]\x1b[0m ${line}`);
            });
            proc.on("exit", (code) => {
              console.log(`\x1b[33m[${name}]\x1b[0m process exited with code ${code}`);
            });
            servers.push({ name, process: proc });
          });
        };

        // Start backends after Vite server is ready
        server.httpServer?.once('listening', () => {
          // Small initial pause to let dev-start.cjs finish its port-kill cycle
          setTimeout(() => {
            startServer(
              "Shopping Backend",
              path.resolve(__dirname, "public/server"),
              path.resolve(__dirname, "public/server/index.js")
            );
            startServer(
              "Admin Backend",
              path.resolve(__dirname, "public/ecommerce_admin/server"),
              path.resolve(__dirname, "public/ecommerce_admin/server/index.js")
            );
            startServer(
              "Blog Backend",
              path.resolve(__dirname, "public/Blog/backend"),
              path.resolve(__dirname, "public/Blog/backend/server.js")
            );
          }, 500);
        });

        // Cleanup on exit
        const cleanup = () => {
          servers.forEach(({ name, process: proc }) => {
            console.log(`\x1b[33m[${name}]\x1b[0m stopping...`);
            proc.kill("SIGTERM");
          });
        };
        process.on("exit", cleanup);
        process.on("SIGINT", () => { cleanup(); process.exit(0); });
        process.on("SIGTERM", () => { cleanup(); process.exit(0); });
      },
    },
    // Custom middleware: serve sub-apps from public/ for their respective routes
    {
      name: "sub-app-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const cleanUrl = url.split('?')[0];
          const ext = cleanUrl.split('.').pop()?.toLowerCase();
          const isStaticAsset = ext && ['js', 'css', 'png', 'jpg', 'jpeg', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'gz', 'map', 'json', 'webp'].includes(ext);

          // Helper: serve a static file from a sub-app's dist directory
          const serveStatic = (basePath: string, distDir: string) => {
            const relativePath = cleanUrl.replace(basePath, '') || '/';
            const filePath = path.resolve(distDir, relativePath.replace(/^\//, ''));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const mimeTypes: Record<string, string> = {
                js: 'application/javascript', css: 'text/css', png: 'image/png',
                jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml',
                ico: 'image/x-icon', webp: 'image/webp', json: 'application/json',
                woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf',
              };
              const mime = (ext && mimeTypes[ext]) || 'application/octet-stream';
              res.setHeader('Content-Type', mime);
              res.end(fs.readFileSync(filePath));
              return true;
            }
            return false;
          };

          // Blog admin sub-app (must be before /blog to match /blog/admin first)
          if (url === '/blog/admin' || url === '/blog/admin/' || url.startsWith('/blog/admin/')) {
            const distDir = path.resolve(__dirname, 'public/Blog/admin/dist');
            if (isStaticAsset && serveStatic('/blog/admin', distDir)) return;
            const blogAdminIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(blogAdminIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(blogAdminIndex, 'utf-8'));
              return;
            }
          }

          // Smart Store sub-app
          if (url === '/smart-store' || url === '/smart-store/' || url.startsWith('/smart-store/')) {
            const distDir = path.resolve(__dirname, 'public/Smart_Store/dist');
            if (isStaticAsset && serveStatic('/smart-store', distDir)) return;
            const smartStoreIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(smartStoreIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(smartStoreIndex, 'utf-8'));
              return;
            }
          }

          // News sub-app
          if (url === '/news' || url === '/news/' || url.startsWith('/news/')) {
            const distDir = path.resolve(__dirname, 'public/News/dist');
            if (isStaticAsset && serveStatic('/news', distDir)) return;
            const newsIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(newsIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(newsIndex, 'utf-8'));
              return;
            }
          }

          // Blog frontend sub-app
          if (url === '/blog' || url === '/blog/' || url.startsWith('/blog/')) {
            const distDir = path.resolve(__dirname, 'public/Blog/frontend/dist');
            if (isStaticAsset && serveStatic('/blog', distDir)) return;
            const blogIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(blogIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(blogIndex, 'utf-8'));
              return;
            }
          }

          // Admin panel sub-app (must be before /shopping to match /shopping/admin first)
          if (url === '/shopping/admin' || url === '/shopping/admin/' || url.startsWith('/shopping/admin/')) {
            const distDir = path.resolve(__dirname, 'public/ecommerce_admin/dist');
            if (isStaticAsset && serveStatic('/shopping/admin', distDir)) return;
            const adminIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(adminIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(adminIndex, 'utf-8'));
              return;
            }
          }

          // Shopping sub-app
          if (url === '/shopping' || url === '/shopping/' || url.startsWith('/shopping/')) {
            const distDir = path.resolve(__dirname, 'public/vite-project/dist');
            if (isStaticAsset && serveStatic('/shopping', distDir)) return;
            const shoppingIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(shoppingIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(shoppingIndex, 'utf-8'));
              return;
            }
          }

          // TV / VideoPlatform sub-app
          if (url === '/tv' || url === '/tv/' || url.startsWith('/tv/') ||
              url === '/VideoPlatform' || url === '/VideoPlatform/' || url.startsWith('/VideoPlatform/')) {
            const distDir = path.resolve(__dirname, 'public/Video Controls Admin/dist');
            const basePath = url.startsWith('/VideoPlatform') ? '/VideoPlatform' : '/tv';
            if (isStaticAsset && serveStatic(basePath, distDir)) return;
            const tvIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(tvIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(tvIndex, 'utf-8'));
              return;
            }
          }

          // Job Portal sub-app
          if (url === '/job-portal' || url === '/job-portal/' || url.startsWith('/job-portal/')) {
            const distDir = path.resolve(__dirname, 'public/Job Portal/dist');
            if (isStaticAsset && serveStatic('/job-portal', distDir)) return;
            const jobPortalIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(jobPortalIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(jobPortalIndex, 'utf-8'));
              return;
            }
          }

          // Multi-vendor admin sub-app (served at /home/admin)
          if (url === '/home/admin' || url === '/home/admin/' || url.startsWith('/home/admin/')) {
            const distDir = path.resolve(__dirname, 'public/multi-vendor admin/dist');
            if (isStaticAsset && serveStatic('/home/admin', distDir)) return;
            const multiVendorIndex = path.resolve(distDir, 'index.html');
            if (fs.existsSync(multiVendorIndex)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(multiVendorIndex, 'utf-8'));
              return;
            }
          }

          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Always resolve a single React copy — the many public/*/node_modules folders
    // each ship their own React, which can otherwise produce two instances and
    // crash with "Cannot read properties of null (reading 'useState')".
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "react-router-dom"],
  },
}));
