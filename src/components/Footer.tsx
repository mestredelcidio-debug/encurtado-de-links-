import React from 'react';
import { Link2, Shield, Heart, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">Decix Analytics</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Plataforma independente, gratuita e segura para encurtamento de links e rastreamento de cliques em tempo real. Sem limites artificiais ou cadastros obrigatórios.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> SSL Seguro & HTTPS
              </span>
              <span>•</span>
              <span>Alta Disponibilidade</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('shortener')} className="hover:text-blue-400 transition-colors">
                  Encurtar URL
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('mylinks')} className="hover:text-blue-400 transition-colors">
                  Meus Links Salvos
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('report')} className="hover:text-blue-400 transition-colors">
                  Denunciar Link Abusivo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal & Privacidade</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('terms')} className="hover:text-blue-400 transition-colors">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('privacy')} className="hover:text-blue-400 transition-colors">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors">
                  Status da API <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Decix Analytics. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Construído com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para simplicidade e velocidade.
          </p>
        </div>
      </div>
    </footer>
  );
};
