import React, { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, QrCode, BarChart3, Globe, Clock, Shield, ExternalLink, AlertTriangle } from 'lucide-react';
import { LinkItem } from '../types';

interface LinkStatsProps {
  link: LinkItem;
  onBack: () => void;
}

export const LinkStats: React.FC<LinkStatsProps> = ({ link, onBack }) => {
  const [stats, setStats] = useState<LinkItem>(link);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [link.code]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${link.code}/stats`);
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stats.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReport = async () => {
    if (!confirm('Deseja realmente denunciar este link por abuso ou conteúdo malicioso?')) return;
    try {
      const res = await fetch(`/api/links/${link.code}/report`, { method: 'POST' });
      if (res.ok) {
        alert('Link denunciado com sucesso. Nossa equipe analisará o caso.');
        fetchStats();
      }
    } catch (err) {
      alert('Erro ao enviar denúncia.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Ativo
              </span>
              {stats.abuseStatus === 'reported' && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Denunciado
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-mono break-all">
              {stats.shortUrl}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
              title="QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-sm text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="truncate flex items-center gap-2">
            <span className="text-slate-500 shrink-0">Destino:</span>
            <a href={stats.originalUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate">
              {stats.originalUrl}
            </a>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total de Cliques</span>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.clickCount || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Cliques registrados no sistema</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Criado em</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-white">
            {new Date(stats.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <p className="text-xs text-slate-500 mt-1">{new Date(stats.createdAt).toLocaleTimeString('pt-BR')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Segurança</span>
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-400">Verificado</div>
          <p className="text-xs text-slate-500 mt-1">Sem ameaças detectadas</p>
        </div>
      </div>

      {/* Click Log Table / Referrers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" /> Histórico Recente de Acessos
        </h3>

        {(!stats.clicks || stats.clicks.length === 0) ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Nenhum clique registrado ainda. Compartilhe seu link para começar a coletar estatísticas!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Data / Hora</th>
                  <th className="pb-3 px-4">Origem (Referrer)</th>
                  <th className="pb-3 px-4">Navegador / Dispositivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                {stats.clicks.slice(-15).reverse().map((click, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(click.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-blue-400 truncate max-w-xs">{click.referrer}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{click.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleReport}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Denunciar este link por conteúdo impróprio
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">QR Code do Link</h3>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stats.shortUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-slate-400 break-all font-mono">{stats.shortUrl}</p>
            <div className="flex gap-3">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(stats.shortUrl)}`}
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
    </div>
  );
};
