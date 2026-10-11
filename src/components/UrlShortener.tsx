import React, { useState } from 'react';
import { Sparkles, Copy, Check, QrCode, ArrowRight, ShieldCheck, Zap, BarChart2, Globe, AlertCircle, ExternalLink } from 'lucide-react';
import { LinkItem } from '../types';

interface UrlShortenerProps {
  onLinkCreated: (link: LinkItem) => void;
  onViewStats: (link: LinkItem) => void;
}

export const UrlShortener: React.FC<UrlShortenerProps> = ({ onLinkCreated, onViewStats }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCopied(false);

    if (!originalUrl.trim()) {
      setError('Por favor, digite ou cole uma URL para encurtar.');
      return;
    }

    let urlToSubmit = originalUrl.trim();
    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = 'https://' + urlToSubmit;
    }

    try {
      const parsed = new URL(urlToSubmit);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setError('Apenas protocolos HTTP e HTTPS são permitidos.');
        return;
      }
    } catch {
      setError('URL inválida. Verifique o endereço digitado.');
      return;
    }

    setLoading(true);

    try {
      const visitorToken = localStorage.getItem('decix_visitor_token') || 'anonymous';
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-token': visitorToken
        },
        body: JSON.stringify({
          originalUrl: urlToSubmit,
          customAlias: customAlias.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar o link curto.');
      }

      setCreatedLink(data.link);
      onLinkCreated(data.link);
      setOriginalUrl('');
      setCustomAlias('');
    } catch (err: any) {
      setError(err.message || 'Falha na conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Encurtador 100% Gratuito & Sem Limites Artificiais
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
          Links longos? <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Encurte em segundos.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transforme qualquer endereço em um link curto, simples e fácil de compartilhar. Acompanhe estatísticas e gere QR Codes sem precisar de cadastro.
        </p>
      </div>

      {/* Main Shortener Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/20 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-cyan-500/5 rounded-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cole sua URL longa aqui
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://exemplo.com/produtos/categoria/produto?id=12345&origem=campanha"
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
              />
            </div>
          </div>

          {showAdvanced && (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Alias Personalizado (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-900 px-3 py-3 rounded-lg border border-slate-800 font-mono">
                    decix.app/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="meu-link-exclusivo"
                    maxLength={30}
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">3 a 30 caracteres. Apenas letras, números, hífen e underline.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {showAdvanced ? 'Ocultar opções avançadas' : '+ Adicionar alias personalizado'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gerando link...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Encurtar link</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Box */}
        {createdLink && (
          <div className="mt-8 p-6 bg-slate-950 border border-blue-500/30 rounded-xl space-y-4 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Link Curto Gerado com Sucesso
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(createdLink.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-slate-900 border border-slate-800 px-4 py-3.5 rounded-xl font-mono text-blue-400 text-base truncate select-all">
                {createdLink.shortUrl}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none px-5 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar link
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center transition-colors"
                  title="Gerar QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onViewStats(createdLink)}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center transition-colors"
                  title="Ver estatísticas"
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 truncate flex items-center gap-1.5">
              <span className="text-slate-500">Destino original:</span>
              <a href={createdLink.originalUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-400 underline truncate">
                {createdLink.originalUrl}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && createdLink && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold text-white">QR Code do Link</h3>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-inner">
              {/* QR Code generator using quickchart API or SVG */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(createdLink.shortUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-slate-400 break-all font-mono">{createdLink.shortUrl}</p>
            <div className="flex gap-3">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(createdLink.shortUrl)}`}
                download="qrcode.png"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Baixar Imagem
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Velocidade Extrema</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Redirecionamentos otimizados em servidores globais ultrarrápidos para que seus usuários cheguem ao destino sem espera.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Estatísticas Reais</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Acompanhe o número de cliques, horários de acesso, origens de tráfego e dispositivos utilizados em tempo real.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Segurança Confiável</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Proteção integrada contra abusos, links maliciosos e validação rigorosa de protocolos HTTP/HTTPS.
          </p>
        </div>
      </div>
    </div>
  );
};
