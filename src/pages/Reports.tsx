/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart3, Download, Search, HelpCircle, FileSpreadsheet, Eye, Printer, Calendar } from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';

export default function Reports() {
  const [successMsg, setSuccessMsg] = useState('');
  const [reportType, setReportType] = useState('monthly');

  const triggerExport = (format: 'pdf' | 'excel' | 'csv') => {
    setSuccessMsg(`Fichier de rapport au format .${format} généré et téléchargé virtuellement avec succès.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const performanceReports = [
    { period: 'Juillet 2026', ca: '15 420 000 FCFA', occupied_nights: 168, occupancy_rate: '74%', tax: '771 000 FCFA' },
    { period: 'Juin 2026', ca: '12 850 000 FCFA', occupied_nights: 144, occupancy_rate: '68%', tax: '642 500 FCFA' },
    { period: 'Mai 2026', ca: '11 120 000 FCFA', occupied_nights: 120, occupancy_rate: '61%', tax: '556 000 FCFA' },
    { period: 'Avril 2026', ca: '9 450 000 FCFA', occupied_nights: 98, occupancy_rate: '55%', tax: '472 500 FCFA' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Rapports & Statistiques"
        description="Générer des rapports financiers, analyser les taux d'occupation des chambres et exporter les bilans comptables de l'établissement."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Téléchargements rapides de rapports</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => triggerExport('pdf')}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer"
              >
                <Download size={14} />
                <span>Rapport d'activité PDF</span>
              </button>
              <button
                onClick={() => triggerExport('excel')}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Fichier de caisse Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left flex items-center space-x-3">
            <Calendar size={28} className="text-brand-orange" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase">Clôture Mensuelle</h4>
              <p className="text-[11px] text-slate-500 mt-1">Les chiffres de la période actuelle (Juillet 2026) seront gelés définitivement lors du Night Audit du 31 Juillet à minuit.</p>
            </div>
          </div>
        </div>

        {/* PERFORMANCE LOG TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Bilan des performances mensuelles hôtelières</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Devise d'établissement : XOF</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">Période d'activité</th>
                  <th className="py-3 px-4 text-right">Chiffre d'Affaires total</th>
                  <th className="py-3 px-4 text-center">Nuitées vendues</th>
                  <th className="py-3 px-4 text-center">Taux d'occupation moyen</th>
                  <th className="py-3 px-4 text-right">Taxes perçues (5%)</th>
                  <th className="py-3 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{report.period}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-800">{report.ca}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{report.occupied_nights} nuits</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{report.occupancy_rate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-500">{report.tax}</td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => alert(`Aperçu à l'écran du rapport pour ${report.period} simulé.`)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Visualiser"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => alert(`Lancement de l'impression physique du rapport ${report.period}`)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Imprimer"
                      >
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
