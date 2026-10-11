import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Ensure data directory exists for local fallback storage
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

// In-memory / file-based fallback storage mechanism
class StorageService {
  private links: Map<string, LinkRecord> = new Map();

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: LinkRecord) => {
            this.links.set(item.code, item);
          });
        }
      } else {
        // Seed some sample data for quick demo
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
        this.links.set(sample.code, sample);
        this.saveToFile();
      }
    } catch (err) {
      console.error('Error loading local links:', err);
    }
  }

  private saveToFile() {
    try {
      const arr = Array.from(this.links.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local links:', err);
    }
  }

  async get(code: string): Promise<LinkRecord | undefined> {
    return this.links.get(code);
  }

  async set(code: string, record: LinkRecord): Promise<void> {
    this.links.set(code, record);
    this.saveToFile();
  }

  async getAll(ownerId?: string): Promise<LinkRecord[]> {
    const all = Array.from(this.links.values());
    if (ownerId) {
      return all.filter(l => l.ownerId === ownerId);
    }
    return all;
  }

  async incrementClick(code: string, clickInfo: { referrer: string; userAgent: string }): Promise<void> {
    const record = this.links.get(code);
    if (record) {
      record.clickCount = (record.clickCount || 0) + 1;
      if (!record.clicks) record.clicks = [];
      record.clicks.push({
        timestamp: new Date().toISOString(),
        referrer: clickInfo.referrer || 'Direct',
        userAgent: clickInfo.userAgent || 'Unknown'
      });
      this.links.set(code, record);
      this.saveToFile();
    }
  }

  async report(code: string): Promise<boolean> {
    const record = this.links.get(code);
    if (record) {
      record.abuseStatus = 'reported';
      this.links.set(code, record);
      this.saveToFile();
      return true;
    }
    return false;
  }
}

const storage = new StorageService();

// Helper to generate random short code
function generateCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// URL Validation helper
function isValidUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// API Routes
app.post('/api/links', async (req: Request, res: Response) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const visitorToken = req.headers['x-visitor-token'] as string || 'anonymous';

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
        return res.status(400).json({ error: 'O alias personalizado deve ter entre 3 e 30 caracteres (letras, números, hífen e underline).' });
      }
      const existing = await storage.get(code);
      if (existing) {
        return res.status(409).json({ error: 'Este alias personalizado já está em uso. Escolha outro.' });
      }
    } else {
      let attempts = 0;
      do {
        code = generateCode(6);
        attempts++;
        const existing = await storage.get(code);
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

    await storage.set(code, newRecord);

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    const shortUrl = `${protocol}://${host}/${code}`;

    return res.status(201).json({
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
  } catch (err: any) {
    console.error('Error creating link:', err);
    return res.status(500).json({ error: 'Erro interno ao criar o link curto.' });
  }
});

app.get('/api/links', async (req: Request, res: Response) => {
  try {
    const visitorToken = req.headers['x-visitor-token'] as string;
    const all = await storage.getAll(visitorToken);
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

    return res.json({ success: true, links: formatted });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar links.' });
  }
});

app.get('/api/links/:code/stats', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const record = await storage.get(code);
    if (!record) {
      return res.status(404).json({ error: 'Link não encontrado.' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';

    return res.json({
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
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

app.post('/api/links/:code/report', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const success = await storage.report(code);
    if (!success) {
      return res.status(404).json({ error: 'Link não encontrado.' });
    }
    return res.json({ success: true, message: 'Link denunciado com sucesso. Nossa equipe irá analisar.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar denúncia.' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'Decix Analytics',
    timestamp: new Date().toISOString(),
    storage: 'local-json-fallback'
  });
});

// Short link redirection route (must be before Vite wildcard)
app.get('/:code', async (req: Request, res: Response) => {
  const { code } = req.params;
  // Ignore static assets or API routes if matched
  if (code.startsWith('api') || code.includes('.')) {
    return res.status(404).send('Not found');
  }

  const record = await storage.get(code);
  if (!record || record.status !== 'active' || record.abuseStatus === 'blocked') {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Link Indisponível — Decix Analytics</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 40px; border-radius: 12px; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155; }
          h1 { color: #f43f5e; margin-bottom: 16px; font-size: 24px; }
          p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          a { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background 0.2s; }
          a:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Link Indisponível ou Expirado</h1>
          <p>O link curto <strong>/${code}</strong> que você tentou acessar não existe, foi desativado pelo criador ou foi bloqueado por violação dos nossos termos de uso.</p>
          <a href="/">Criar um novo link no Decix Analytics</a>
        </div>
      </body>
      </html>
    `);
  }

  // Record click asynchronously
  const referrer = req.headers['referer'] || 'Direct';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  storage.incrementClick(code, { referrer: String(referrer), userAgent: String(userAgent) });

  return res.redirect(302, record.originalUrl);
});

async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
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

startServer();
