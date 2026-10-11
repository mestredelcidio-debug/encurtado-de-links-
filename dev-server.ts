import express from 'express';
import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import workerHandler from './server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Helper to convert Express request to Web API Request
async function expressToWebRequest(req: ExpressReq): Promise<Request> {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const fullUrl = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  Object.keys(req.headers).forEach(key => {
    const val = req.headers[key];
    if (typeof val === 'string') headers.set(key, val);
    else if (Array.isArray(val)) headers.set(key, val.join(', '));
  });

  const method = req.method;
  const hasBody = !['GET', 'HEAD'].includes(method);
  
  return new Request(fullUrl, {
    method,
    headers,
    body: hasBody ? JSON.stringify(req.body) : undefined
  });
}

// Bridge Express routes to Cloudflare Worker fetch handler
app.use(async (req: ExpressReq, res: ExpressRes) => {
  if (req.path.startsWith('/src/') || req.path.startsWith('/@') || req.path.includes('.tsx') || req.path.includes('.ts')) {
    return res.status(404).send('Handled by Vite middleware');
  }

  try {
    const webReq = await expressToWebRequest(req);
    const env = process.env;
    const webRes = await workerHandler.fetch(webReq, env, {
      waitUntil: () => {},
      passThroughOnException: () => {}
    });

    if (webRes.status === 302) {
      const location = webRes.headers.get('Location');
      if (location) return res.redirect(302, location);
    }

    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const text = await webRes.text();
    res.send(text);
  } catch (err) {
    console.error('Dev server bridge error:', err);
    res.status(500).json({ error: 'Erro interno no servidor de desenvolvimento.' });
  }
});

async function startDevServer() {
  const PORT = process.env.PORT || 3000;
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false }
  });
  
  app.use(vite.middlewares);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Decix Analytics (Dev Server) rodando em http://0.0.0.0:${PORT}`);
  });
}

startDevServer();
