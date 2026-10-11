import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import express from 'express';
import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: string;
  status: 'active' | 'disabled' | 'expired';
  expiresAt?: string | null;
  clickCount: number;
  abuseStatus: 'clean' | 'reported' | 'blocked';
  ownerId?: string;
  clicks?: Array<{
    timestamp: string;
    referrer: string;
    userAgent: string;
  }>;
}

class HybridStorageService {
  private memoryFallback: Map<string, LinkRecord> = new Map();
  private isNodeEnv = typeof process !== 'undefined' && !process.env.CF_PAGES && !process.env.WORKER_ENV;

  constructor() {
    if (this.isNodeEnv) {
      this.loadFromFile();
    } else {
      this.memoryFallback.set('decix1', {
        code: 'decix1',
        originalUrl: 'https://github.com',
        createdAt: new Date().toISOString(),
        status: 'active',
        clickCount: 12,
        abuseStatus: 'clean',
        ownerId: 'system_demo',
        clicks: []
      });
    }
  }

  private getFirestoreDb(env?: any) {
    const apiKey = env?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    const projectId = env?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    
    if (!apiKey || !projectId) {
      return null;
    }

    try {
      const firebaseConfig = {
        apiKey,
        authDomain: env?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: env?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        messagingSenderId: env?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: env?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || ''
      };

      const apps = getApps();
      const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
      return getFirestore(app);
    } catch (err) {
      console.error('Error initializing Firestore:', err);
      return null;
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: LinkRecord) => {
            this.memoryFallback.set(item.code, item);
          });
        }
      } else {
        const sample: LinkRecord = {
          code: 'decix1',
          originalUrl: 'https://github.com',
          createdAt: new Date().toISOString(),
          status: 'active',
          clickCount: 12,
          abuseStatus: 'clean',
          ownerId: 'system_demo',
          clicks: []
        };
        this.memoryFallback.set(sample.code, sample);
        this.saveToFile();
      }
    } catch (err) {
      console.error('Error loading local links:', err);
    }
  }

  private saveToFile() {
    if (!this.isNodeEnv) return;
    try {
      const arr = Array.from(this.memoryFallback.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local links:', err);
    }
  }

  async get(code: string, env?: any): Promise<LinkRecord | undefined> {
    const db = this.getFirestoreDb(env);
    if (db) {
      try {
        const docRef = doc(db, 'links', code);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as LinkRecord;
        }
        return undefined;
      } catch (err) {
        console.error('Firestore get error:', err);
      }
    }
    return this.memoryFallback.get(code);
  }

  async set(code: string, record: LinkRecord, env?: any): Promise<void> {
    const db = this.getFirestoreDb(env);
    if (db) {
      try {
        const docRef = doc(db, 'links', code);
        await setDoc(docRef, record);
        return;
      } catch (err) {
        console.error('Firestore set error:', err);
      }
    }
    this.memoryFallback.set(code, record);
    this.saveToFile();
  }

  async getAll(ownerId?: string, env?: any): Promise<LinkRecord[]> {
    const db = this.getFirestoreDb(env);
    if (db) {
      try {
        const linksCol = collection(db, 'links');
        let q = query(linksCol);
        if (ownerId) {
          q = query(linksCol, where('ownerId', '==', ownerId));
        }
        const querySnapshot = await getDocs(q);
        const records: LinkRecord[] = [];
        querySnapshot.forEach((doc) => {
          records.push(doc.data() as LinkRecord);
        });
        return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.error('Firestore getAll error:', err);
      }
    }
    const all = Array.from(this.memoryFallback.values());
    const filtered = ownerId ? all.filter(l => l.ownerId === ownerId) : all;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async incrementClick(code: string, clickInfo: { referrer: string; userAgent: string }, env?: any): Promise<void> {
    const record = await this.get(code, env);
    if (record) {
      record.clickCount = (record.clickCount || 0) + 1;
      if (!record.clicks) record.clicks = [];
      record.clicks.push({
        timestamp: new Date().toISOString(),
        referrer: clickInfo.referrer || 'Direct',
        userAgent: clickInfo.userAgent || 'Unknown'
      });
      await this.set(code, record, env);
    }
  }

  async report(code: string, env?: any): Promise<boolean> {
    const record = await this.get(code, env);
    if (record) {
      record.abuseStatus = 'reported';
      await this.set(code, record, env);
      return true;
    }
    return false;
  }
}

const storage = new HybridStorageService();

function generateCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cloudflare Workers Fetch Handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const protocol = url.protocol.replace(':', '');
    const host = url.host;

    // 1. Health Check
    if (pathname === '/api/health' && method === 'GET') {
      const db = (storage as any).getFirestoreDb(env);
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'Decix Analytics',
        timestamp: new Date().toISOString(),
        storage: db ? 'firebase-firestore' : 'local-fallback'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. List Links (GET /api/links)
    if (pathname === '/api/links' && method === 'GET') {
      try {
        const visitorToken = request.headers.get('x-visitor-token') || '';
        const all = await storage.getAll(visitorToken, env);
        const formatted = all.map(l => ({
          code: l.code,
          originalUrl: l.originalUrl,
          shortUrl: `${protocol}://${host}/${l.code}`,
          createdAt: l.createdAt,
          clickCount: l.clickCount,
          status: l.status,
          abuseStatus: l.abuseStatus
        }));
        return new Response(JSON.stringify({ success: true, links: formatted }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Erro ao listar links.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. Create Link (POST /api/links)
    if (pathname === '/api/links' && method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { originalUrl, customAlias, expiresAt } = body;
        const visitorToken = request.headers.get('x-visitor-token') || 'anonymous';

        if (!originalUrl || typeof originalUrl !== 'string') {
          return new Response(JSON.stringify({ error: 'URL original é obrigatória.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const trimmedUrl = originalUrl.trim();
        if (!isValidUrl(trimmedUrl)) {
          return new Response(JSON.stringify({ error: 'URL inválida. Utilize endereços iniciando com http:// ou https://.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        let code = '';
        if (customAlias && typeof customAlias === 'string' && customAlias.trim().length > 0) {
          code = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
          if (code.length < 3 || code.length > 30) {
            return new Response(JSON.stringify({ error: 'O alias personalizado deve ter entre 3 e 30 caracteres (letras, números, hífen e underline).' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          const existing = await storage.get(code, env);
          if (existing) {
            return new Response(JSON.stringify({ error: 'Este alias personalizado já está em uso. Escolha outro.' }), {
              status: 409,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } else {
          let attempts = 0;
          do {
            code = generateCode(6);
            attempts++;
            const existing = await storage.get(code, env);
            if (!existing) break;
            if (attempts > 10) {
              code = generateCode(8);
              break;
            }
          } while (true);
        }

        const newRecord: LinkRecord = {
          code,
          originalUrl: trimmedUrl,
          createdAt: new Date().toISOString(),
          status: 'active',
          expiresAt: expiresAt || null,
          clickCount: 0,
          abuseStatus: 'clean',
          ownerId: visitorToken,
          clicks: []
        };

        await storage.set(code, newRecord, env);
        const shortUrl = `${protocol}://${host}/${code}`;

        return new Response(JSON.stringify({
          success: true,
          link: {
            code: newRecord.code,
            originalUrl: newRecord.originalUrl,
            shortUrl,
            createdAt: newRecord.createdAt,
            clickCount: newRecord.clickCount,
            status: newRecord.status,
            ownerId: newRecord.ownerId
          }
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Erro interno ao criar o link curto.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 4. Link Stats (GET /api/links/:code/stats)
    if (pathname.startsWith('/api/links/') && pathname.endsWith('/stats') && method === 'GET') {
      const parts = pathname.split('/');
      const code = parts[3];
      try {
        const record = await storage.get(code, env);
        if (!record) {
          return new Response(JSON.stringify({ error: 'Link não encontrado.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          success: true,
          stats: {
            code: record.code,
            originalUrl: record.originalUrl,
            shortUrl: `${protocol}://${host}/${record.code}`,
            createdAt: record.createdAt,
            clickCount: record.clickCount,
            status: record.status,
            abuseStatus: record.abuseStatus,
            clicks: record.clicks || []
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Erro ao buscar estatísticas.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 5. Report Abuse (POST /api/links/:code/report)
    if (pathname.startsWith('/api/links/') && pathname.endsWith('/report') && method === 'POST') {
      const parts = pathname.split('/');
      const code = parts[3];
      try {
        const success = await storage.report(code, env);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Link não encontrado.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ success: true, message: 'Link denunciado com sucesso.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Erro ao processar denúncia.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 6. Short Link Redirection (GET /:code)
    if (!pathname.startsWith('/api/') && pathname !== '/' && !pathname.includes('.')) {
      const code = pathname.substring(1);
      try {
        const record = await storage.get(code, env);
        if (!record || record.status !== 'active' || record.abuseStatus === 'blocked') {
          const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Link Indisponível — Decix Analytics</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;max-width:480px;box-shadow:0 10px 25px rgba(0,0,0,0.3);border:1px solid #334155}h1{color:#f43f5e;margin-bottom:16px;font-size:24px}p{color:#94a3b8;line-height:1.6;margin-bottom:24px}a{background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block}</style></head><body><div class="card"><h1>Link Indisponível ou Expirado</h1><p>O link curto <strong>/${code}</strong> não existe, foi desativado ou foi bloqueado.</p><a href="/">Criar novo link no Decix Analytics</a></div></body></html>`;
          return new Response(html, {
            status: 404,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }

        const referrer = request.headers.get('referer') || 'Direct';
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        await storage.incrementClick(code, { referrer, userAgent }, env);

        return Response.redirect(record.originalUrl, 302);
      } catch (err) {
        return new Response('Erro interno no redirecionamento', { status: 500 });
      }
    }

    // 7. Static Assets & SPA Fallback
    if (env && env.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }
        const indexRequest = new Request(new URL('/', request.url).toString(), request);
        return env.ASSETS.fetch(indexRequest);
      } catch (e) {}
    }

    return new Response('Not found', { status: 404 });
  }
};

// ---------------------------------------------------------------------------
// Local Node.js Express Dev Server Wrapper
// ---------------------------------------------------------------------------
const isNodeEnv = typeof process !== 'undefined' && !process.env.CF_PAGES && !process.env.WORKER_ENV && process.argv[1]?.includes('server');

if (isNodeEnv) {
  const app = express();
  app.use(express.json());

  // Health
  app.get('/api/health', async (req: ExpressReq, res: ExpressRes) => {
    const db = (storage as any).getFirestoreDb(process.env);
    res.json({
      status: 'ok',
      service: 'Decix Analytics',
      timestamp: new Date().toISOString(),
      storage: db ? 'firebase-firestore' : 'local-fallback'
    });
  });

  // List links
  app.get('/api/links', async (req: ExpressReq, res: ExpressRes) => {
    const visitorToken = String(req.headers['x-visitor-token'] || '');
    const all = await storage.getAll(visitorToken, process.env);
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    const formatted = all.map(l => ({
      code: l.code,
      originalUrl: l.originalUrl,
      shortUrl: `${protocol}://${host}/${l.code}`,
      createdAt: l.createdAt,
      clickCount: l.clickCount,
      status: l.status,
      abuseStatus: l.abuseStatus
    }));
    res.json({ success: true, links: formatted });
  });

  // Create link
  app.post('/api/links', async (req: ExpressReq, res: ExpressRes) => {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const visitorToken = String(req.headers['x-visitor-token'] || 'anonymous');

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ error: 'URL original é obrigatória.' });
    }

    const trimmedUrl = originalUrl.trim();
    if (!isValidUrl(trimmedUrl)) {
      return res.status(400).json({ error: 'URL inválida. Utilize endereços iniciando com http:// ou https://.' });
    }

    let code = '';
    if (customAlias && typeof customAlias === 'string' && customAlias.trim().length > 0) {
      code = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (code.length < 3 || code.length > 30) {
        return res.status(400).json({ error: 'O alias personalizado deve ter entre 3 e 30 caracteres.' });
      }
      const existing = await storage.get(code, process.env);
      if (existing) {
        return res.status(409).json({ error: 'Este alias personalizado já está em uso.' });
      }
    } else {
      let attempts = 0;
      do {
        code = generateCode(6);
        attempts++;
        const existing = await storage.get(code, process.env);
        if (!existing) break;
        if (attempts > 10) {
          code = generateCode(8);
          break;
        }
      } while (true);
    }

    const newRecord: LinkRecord = {
      code,
      originalUrl: trimmedUrl,
      createdAt: new Date().toISOString(),
      status: 'active',
      expiresAt: expiresAt || null,
      clickCount: 0,
      abuseStatus: 'clean',
      ownerId: visitorToken,
      clicks: []
    };

    await storage.set(code, newRecord, process.env);
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    const shortUrl = `${protocol}://${host}/${code}`;

    res.status(201).json({
      success: true,
      link: {
        code: newRecord.code,
        originalUrl: newRecord.originalUrl,
        shortUrl,
        createdAt: newRecord.createdAt,
        clickCount: newRecord.clickCount,
        status: newRecord.status,
        ownerId: newRecord.ownerId
      }
    });
  });

  // Stats
  app.get('/api/links/:code/stats', async (req: ExpressReq, res: ExpressRes) => {
    const { code } = req.params;
    const record = await storage.get(code, process.env);
    if (!record) {
      return res.status(404).json({ error: 'Link não encontrado.' });
    }
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    res.json({
      success: true,
      stats: {
        code: record.code,
        originalUrl: record.originalUrl,
        shortUrl: `${protocol}://${host}/${record.code}`,
        createdAt: record.createdAt,
        clickCount: record.clickCount,
        status: record.status,
        abuseStatus: record.abuseStatus,
        clicks: record.clicks || []
      }
    });
  });

  // Report
  app.post('/api/links/:code/report', async (req: ExpressReq, res: ExpressRes) => {
    const { code } = req.params;
    const success = await storage.report(code, process.env);
    if (!success) {
      return res.status(404).json({ error: 'Link não encontrado.' });
    }
    res.json({ success: true, message: 'Link denunciado com sucesso.' });
  });

  // Redirection
  app.get('/:code', async (req: ExpressReq, res: ExpressRes) => {
    const { code } = req.params;
    if (code.startsWith('api') || code.includes('.')) {
      return res.status(404).send('Not found');
    }
    const record = await storage.get(code, process.env);
    if (!record || record.status !== 'active' || record.abuseStatus === 'blocked') {
      return res.status(404).send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Link Indisponível</title></head><body style="background:#0f172a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0"><div style="background:#1e293b;padding:40px;border-radius:12px;text-align:center"><h1 style="color:#f43f5e">Link Indisponível ou Expirado</h1><p>O link curto /${code} não existe ou foi desativado.</p><a href="/" style="color:#3b82f6">Criar novo link</a></div></body></html>`);
    }

    const referrer = String(req.headers['referer'] || 'Direct');
    const userAgent = String(req.headers['user-agent'] || 'Unknown');
    await storage.incrementClick(code, { referrer, userAgent }, process.env);

    res.redirect(302, record.originalUrl);
  });

  async function startDevServer() {
    const PORT = process.env.PORT || 3000;
    if (process.env.NODE_ENV === 'production') {
      const distPath = path.join(__dirname, 'dist');
      app.use(express.static(distPath));
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false }
      });
      app.use(vite.middlewares);
    }

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Decix Analytics rodando em http://0.0.0.0:${PORT}`);
    });
  }

  startDevServer();
}
