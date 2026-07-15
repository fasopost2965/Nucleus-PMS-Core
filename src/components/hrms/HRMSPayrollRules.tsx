/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, 
  Globe, 
  Percent, 
  Sliders 
} from 'lucide-react';
import { IHRMSPayrollRule } from '../../types';

interface HRMSPayrollRulesProps {
  payrollRules: IHRMSPayrollRule[];
  activeCountryCode: string;
  setActiveCountryCode: (code: string) => void;
}

export default function HRMSPayrollRules({
  payrollRules,
  activeCountryCode,
  setActiveCountryCode
}: HRMSPayrollRulesProps) {
  
  // Normalisation du code pays pour assurer la compatibilité (ex: CIV -> CI)
  const normalizedCode = activeCountryCode === 'CIV' ? 'CI' : activeCountryCode === 'SEN' ? 'SN' : activeCountryCode;
  const currentRule = payrollRules.find(r => r.country_code === normalizedCode || r.country_code === activeCountryCode);

  const countries = [
    { code: 'CI', label: "Côte d'Ivoire", flag: '🇨🇮', desc: 'Code Général des Impôts (CGI Ivoirien)' },
    { code: 'SN', label: 'Sénégal', flag: '🇸🇳', desc: 'Législation fiscale et sociale de la CSS' },
    { code: 'MA', label: 'Maroc', flag: '🇲🇦', desc: 'Réglementation fiscale de la CNSS' },
    { code: 'FR', label: 'France', flag: '🇫🇷', desc: 'Code du travail & Urssaf' }
  ];

  const getCountryName = (code: string) => {
    switch (code) {
      case 'CI': return "Côte d'Ivoire";
      case 'SN': return "Sénégal";
      case 'MA': return "Maroc";
      case 'FR': return "France";
      default: return code;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="hrms-payroll-rules-root">
      
      {/* Bannière d'information sur l'harmonisation fiscale */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 text-left">
        <Globe className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-[#92400e] font-bold text-sm">Harmonisation Fiscale UEMOA et Localisations (i18n & Multi-devises)</h4>
          <p className="text-xs text-[#7c2d12] leading-relaxed mt-1">
            Les cotisations sociales diffèrent selon les pays d'exercice. Sélectionnez le pays de rattachement légal de l'établissement pour charger instantanément les taux de cotisations CNPS patronales/salariales et le calcul de l'Impôt sur le Traitement des Salaires (ITS).
          </p>
        </div>
      </div>

      {/* Grille principale de configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Détails du barème actif */}
        <div className="lg:col-span-2 space-y-4 text-left">
          {currentRule ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-brand-orange" />
                    Barème Fiscal Actif : {getCountryName(currentRule.country_code)} ({currentRule.default_currency})
                  </h3>
                  <p className="text-xs text-slate-500">Taux de retenues à la source applicables sur les bulletins de paie</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-250 font-bold uppercase px-2.5 py-0.5 rounded font-mono">
                  ISO_{currentRule.country_code}
                </span>
              </div>

              {/* Paramètres de cotisation et d'imposition */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Impôt de Base Général Salaires (ITS / IGR)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Retenue fiscale progressive à la source</p>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">{(currentRule.salary_tax_rate * 100).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700">CNPS Retraite Salariée</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assurance vieillesse déduite du salaire brut</p>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">{(currentRule.cnps_employee_rate * 100).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700">CNPS Retraite Patronale (Hôtel)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Contribution employeur prélevée en supplément</p>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">{(currentRule.cnps_employer_rate * 100).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Plafond National Cotisable</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Base maximale de calcul pour les cotisations de sécurité sociale</p>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {currentRule.cnps_ceiling.toLocaleString('fr-FR')} {currentRule.default_currency}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Contribution Nationale Solidarité</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Taux additionnel d'impôt sur le revenu global</p>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">{(currentRule.national_contribution_rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs italic">
              Sélectionnez une juridiction pour charger les données.
            </div>
          )}
        </div>

        {/* Panneau de sélection de la juridiction active */}
        <div className="space-y-4 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-brand-orange" />
              Changer de Juridiction
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Basculez entre les pays d'implantation pour charger instantanément les tables de fiscalité du moteur de paie.
            </p>

            <div className="space-y-2.5">
              {countries.map(c => {
                const isSelected = normalizedCode === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setActiveCountryCode(c.code)}
                    className={`w-full p-3.5 rounded-xl text-left border transition flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-50/50 border-brand-orange' 
                        : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-brand-orange' : 'text-slate-800'}`}>
                        {c.label} ({c.code})
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
