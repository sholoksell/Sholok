#!/usr/bin/env node
/**
 * One-command dev orchestrator.
 * Frees all known ports, then starts every website's frontend AND backend together.
 *
 * Port map:
 *   Home_Page (web 8080 / api 5001)
 *   Shopping  (web 3000 / commerce api 5000 / ecommerce-admin 8081)   [public/vite-project]
 *   Job Portal(web 5183 / api 5005)
 *   Video     (web 5174 / api 5003)                                    [Video Controls Admin]
 *   Blog      (web 5180 / admin 5184 / api 5050)
 *   Multi-vendor admin (web 8082 / api 5002)
 *   Smart_Store (web 8083)
 *   amazon    (web 5181)
 *   News      (web 5182)
 */
const { execSync, spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');

const PORTS = [
  8080, 8081, 8082, 8083, 3000,
  5000, 5001, 5002, 5003, 5005, 5050,
  5174, 5180, 5181, 5182, 5183, 5184,
];

function killPorts(ports) {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const killed = new Set();
    out.split('\n').forEach((line) => {
      if (!line.includes('LISTENING')) return;
      const parts = line.trim().split(/\s+/);
      const local = parts[1] || '';
      const pid = parts[parts.length - 1];
      const port = parseInt(local.split(':').pop(), 10);
      if (ports.includes(port) && pid && pid !== '0' && !killed.has(pid)) {
        killed.add(pid);
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`\x1b[90mFreed port group: killed PID ${pid}\x1b[0m`);
        } catch (e) { /* already gone */ }
      }
    });
  } catch (e) { /* netstat unavailable */ }
}

/** Wait until all given ports are confirmed free (max 5s per port). */
function waitForPortsFree(ports) {
  const { execSync: run } = require('child_process');
  const deadline = Date.now() + 5000;
  let remaining = [...ports];
  while (remaining.length > 0 && Date.now() < deadline) {
    try {
      const out = run('netstat -ano', { encoding: 'utf8' });
      remaining = remaining.filter((p) => {
        return out.split('\n').some((line) => {
          if (!line.includes('LISTENING')) return false;
          const local = (line.trim().split(/\s+/)[1] || '');
          return parseInt(local.split(':').pop(), 10) === p;
        });
      });
    } catch (e) { break; }
    if (remaining.length > 0) {
      execSync('ping -n 2 127.0.0.1 > nul 2>&1 || sleep 0.5', { stdio: 'ignore', shell: true });
    }
  }
  if (remaining.length === 0) {
    console.log('\x1b[90mAll ports confirmed free.\x1b[0m');
  } else {
    console.log(`\x1b[33mPorts still in use after wait: ${remaining.join(', ')} — proceeding anyway.\x1b[0m`);
  }
}

const COLORS = ['36', '32', '33', '35', '34', '95', '92', '93', '94', '96', '91'];

const services = [
  { name: 'home-web',    cwd: ROOT,                                            cmd: 'node node_modules/vite/bin/vite.js --force' },
  { name: 'home-api',    cwd: path.join(PUB, 'server'),                        cmd: 'node index.js' },
  { name: 'admin-api',   cwd: path.join(PUB, 'ecommerce_admin', 'server'),     cmd: 'node index.js' },
  { name: 'blog-api',    cwd: path.join(PUB, 'Blog', 'backend'),               cmd: 'node server.js' },
  { name: 'shopping',    cwd: path.join(PUB, 'vite-project'),                  cmd: 'npm run dev' },
  { name: 'jobportal',   cwd: path.join(PUB, 'Job Portal'),                   cmd: 'npm run dev' },
  { name: 'video',       cwd: path.join(PUB, 'Video Controls Admin'),          cmd: 'npm run dev' },
  { name: 'blog',        cwd: path.join(PUB, 'Blog'),                          cmd: 'npm run dev' },
  { name: 'mvendor-web', cwd: path.join(PUB, 'multi-vendor admin'),            cmd: 'npm run dev' },
  { name: 'mvendor-api', cwd: path.join(PUB, 'multi-vendor admin', 'server'),  cmd: 'node server.js' },
  { name: 'smartstore',  cwd: path.join(PUB, 'Smart_Store'),                   cmd: 'npm run dev' },
  { name: 'amazon',      cwd: path.join(PUB, 'amazon'),                        cmd: 'npm run dev' },
  { name: 'news',        cwd: path.join(PUB, 'News'),                          cmd: 'npm run dev' },
];

const pad = Math.max(...services.map((s) => s.name.length));

// Each app decides its own port via its vite config / .env. A PORT injected into
// our environment (e.g. by the preview runner) must NOT leak to the children, or
// every backend would try to bind the same port. Strip it.
const childEnv = { ...process.env };
delete childEnv.PORT;
// Tell the Vite plugin not to auto-start backends — dev-start.cjs owns them.
childEnv.SKIP_VITE_BACKENDS = '1';

function start(service, color) {
  const label = `\x1b[${color}m[${service.name.padEnd(pad)}]\x1b[0m`;
  const child = spawn(service.cmd, {
    cwd: service.cwd,
    shell: true,
    env: childEnv,
  });

  const prefixer = (stream, isErr) => {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();
      lines.forEach((l) => {
        const text = isErr ? `\x1b[31m${l}\x1b[0m` : l;
        process.stdout.write(`${label} ${text}\n`);
      });
    });
  };
  prefixer(child.stdout, false);
  prefixer(child.stderr, true);

  child.on('exit', (code) => {
    process.stdout.write(`${label} \x1b[33mexited (code ${code})\x1b[0m\n`);
  });
  return child;
}

console.log('\x1b[1m\nFreeing ports...\x1b[0m');
killPorts(PORTS);
waitForPortsFree([5000, 5001, 5002, 5003, 5005, 5050]);

console.log('\x1b[1mStarting all websites (frontend + backend)...\n\x1b[0m');
const children = [];
let i = 0;
for (const svc of services) {
  children.push(start(svc, COLORS[i % COLORS.length]));
  i++;
}

function shutdown() {
  console.log('\n\x1b[1mShutting down all services...\x1b[0m');
  children.forEach((c) => {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${c.pid}`, { stdio: 'ignore' });
      } else {
        c.kill('SIGTERM');
      }
    } catch (e) { /* ignore */ }
  });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
