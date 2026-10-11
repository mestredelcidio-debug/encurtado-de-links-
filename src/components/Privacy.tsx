import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Política de Privacidade</h1>
            <p className="text-sm text-slate-400">Última atualização: Outubro de 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" /> 1. Compromisso com a Privacidade
            </h2>
            <p>
              O <strong>Decix Analytics</strong> valoriza a sua privacidade. Nossa plataforma foi projetada para minimizar a coleta de dados pessoais, focando estritamente na prestação do serviço de encurtamento e contagem de cliques.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-500" /> 2. Dados Coletados
            </h2>
            <p>
              Durante o uso do serviço, podemos registrar automaticamente:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>Endereços de URLs originais fornecidos para encurtamento.</li>
              <li>Metadados de cliques (data, horário, origem/referrer e user-agent do navegador) para fins estatísticos.</li>
              <li>Endereços IP para proteção contra abusos, fraudes e ataques de negação de serviço.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> 3. Compartilhamento de Dados
            </h2>
            <p>
              Não comercializamos, alugamos ou compartilhamos dados de navegação ou URLs com terceiros, exceto quando exigido por ordem judicial ou leis aplicáveis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" /> 4. Segurança da Informação
            </h2>
            <p>
              Utilizamos criptografia em trânsito (HTTPS) e práticas recomendadas de segurança para proteger os dados armazenados contra acessos não autorizados.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
