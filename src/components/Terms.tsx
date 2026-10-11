import React from 'react';
import { FileText, Shield, CheckCircle } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Termos de Uso</h1>
            <p className="text-sm text-slate-400">Última atualização: Outubro de 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> 1. Aceitação dos Termos
            </h2>
            <p>
              Ao utilizar a plataforma <strong>Decix Analytics</strong>, você concorda expressamente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui presente, recomendamos que não utilize nossos serviços de encurtamento e análise de URLs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> 2. Descrição do Serviço
            </h2>
            <p>
              O Decix Analytics oferece ferramentas gratuitas para encurtamento de endereços web (URLs) e estatísticas de acesso. O serviço é disponibilizado sem garantias absolutas de disponibilidade ininterrupta, embora mantenhamos padrões elevados de robustez técnica.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> 3. Condutas Proibidas e Uso Indevido
            </h2>
            <p>
              É estritamente proibido utilizar os links do Decix Analytics para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>Disseminação de malware, vírus, phishing ou engenharia social.</li>
              <li>Práticas de spam, fraude ou esquemas financeiros ilícitos.</li>
              <li>Pirataria, violação de direitos autorais ou conteúdo adulto não consentido.</li>
              <li>Atividades que violem leis locais ou internacionais.</li>
            </ul>
            <p>
              Links denunciados e confirmados como maliciosos serão imediatamente desativados ou bloqueados pela nossa equipe de moderação.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> 4. Modificações e Rescisão
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento, bem como suspender ou desativar links que violem nossa política de segurança, sem aviso prévio.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
