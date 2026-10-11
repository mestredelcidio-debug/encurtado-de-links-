import React from 'react';
import { BarChart3, ShieldCheck, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { LogoIcon } from './LogoIcon';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  myLinksCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, myLinksCount }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('shortener')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
            <LogoIcon className="w-11 h-11" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Decix <span className="text-blue-500">Analytics</span>
            </span>
            <span className="block text-xs text-slate-400 font-medium">Encurtador Profissional</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('shortener')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'shortener'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Encurtar Link
          </button>

          <button
            onClick={() => setActiveTab('mylinks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'mylinks'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Meus Links
            {myLinksCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded-full border border-blue-500/30">
                {myLinksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Termos
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacidade
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-2 rounded-lg transition-colors"
            title="Denunciar link suspeito"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Denunciar Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
