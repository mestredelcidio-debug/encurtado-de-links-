import React, { useState } from 'react';
import { BarChart2, Copy, Check, ExternalLink, Trash2, Globe, Sparkles } from 'lucide-react';
import { LinkItem } from '../types';

interface MyLinksProps {
  links: LinkItem[];
  onViewStats: (link: LinkItem) => void;
  onClearHistory: () => void;
  onGoHome: () => void;
}

export const MyLinks: React.FC<MyLinksProps> = ({ links, onViewStats, onClearHistory, onGoHome }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (shortUrl: string, code: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Links Salvos</h1>
          <p className="text-slate-400 text-sm">
            Lista de links encurtados recentemente no seu navegador.
          </p>
        </div>

        {links.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={onClearHistory}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Limpar Histórico
            </button>
          </div>
        )}
      </div>

      {links.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white mb-2">Nenhum link encurtado ainda</h3>
            <p className="text-sm text-slate-400 mb-6">
              Você ainda não criou nenhum link nesta sessão. Comece agora mesmo transformando sua primeira URL longa.
            </p>
            <button
              onClick={onGoHome}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Encurtar meu primeiro link
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const isCopied = copiedCode === link.code;
            return (
              <div
                key={link.code}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-400 font-semibold text-base sm:text-lg truncate">
                      {link.shortUrl}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativo
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                    <span className="text-slate-500">Destino:</span>
                    <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-400 truncate">
                      {link.originalUrl}
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Criado em: {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{link.clickCount || 0} cliques</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(link.shortUrl, link.code)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                      isCopied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </button>

                  <button
                    onClick={() => onViewStats(link)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors shadow-md shadow-blue-600/20"
                  >
                    <BarChart2 className="w-3.5 h-3.5" /> Estatísticas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
