import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const Report: React.FC = () => {
  const [shortUrl, setShortUrl] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!shortUrl.trim()) {
      setError('Por favor, informe a URL curta ou código do link.');
      return;
    }

    // Extract code from URL if full URL was pasted
    let code = shortUrl.trim();
    if (code.includes('/')) {
      const parts = code.split('/').filter(Boolean);
      code = parts[parts.length - 1];
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/links/${code}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao reportar link.');
      }
      setSuccess(true);
      setShortUrl('');
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Link não encontrado ou erro ao processar denúncia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Denunciar Link Abusivo</h1>
            <p className="text-sm text-slate-400">Ajude-nos a manter a plataforma segura</p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Denúncia Recebida com Sucesso</h3>
            <p className="text-sm text-slate-300">
              Agradecemos sua colaboração. Nossa equipe de moderação irá analisar o link reportado o mais breve possível.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Fazer outra denúncia
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Link Curto ou Código (ex: decix.app/xyz123)
              </label>
              <input
                type="text"
                value={shortUrl}
                onChange={(e) => setShortUrl(e.target.value)}
                placeholder="https://decix.app/xyz123 ou xyz123"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Motivo da Denúncia (Opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo (ex: phishing, malware, fraude, direitos autorais...)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Enviando denúncia...' : 'Enviar Denúncia'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
