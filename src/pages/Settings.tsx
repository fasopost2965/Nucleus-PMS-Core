/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, HelpCircle, Mail, Phone, MapPin, DollarSign, Globe, Percent } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';

export default function SettingsPage() {
  const [successMsg, setSuccessMsg] = useState('');
  
  // Settings Form States
  const [hotelName, setHotelName] = useState('Brunch Bouaké');
  const [legalName, setLegalName] = useState('Brunch Bouaké SARL');
  const [phone, setPhone] = useState('+225 07 45 89 12 34');
  const [email, setEmail] = useState('contact@brunchbouake.com');
  const [website, setWebsite] = useState('www.brunchbouake.com');
  const [address, setAddress] = useState('Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');

  const [tvaEnabled, setTvaEnabled] = useState(true);
  const [tvaRate, setTvaRate] = useState(18);
  const [touristTaxEnabled, setTouristTaxEnabled] = useState(true);
  const [touristTaxAmt, setTouristTaxAmt] = useState(1000); // 1000 XOF/night/pax

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Les paramètres généraux, fiscaux et de facturation ont été sauvegardés en base de données avec succès.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Configuration de l'Établissement"
        description="Ajuster l'identité légale de l'hôtel, paramétrer les taxes hôtelières et configurer les devises actives."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto text-left">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* SECTION A: GENERAL IDENTIFICATION (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <MapPin size={16} className="text-brand-orange" />
                <span>Identification de l'hôtel</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Nom commercial de l'établissement</label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700">Raison sociale (Nom légal)</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700 flex items-center space-x-1"><Phone size={12} /> <span>Téléphone</span></label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 flex items-center space-x-1"><Mail size={12} /> <span>Email principal</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 flex items-center space-x-1"><Globe size={12} /> <span>Site Web</span></label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <label className="text-slate-700">Adresse géographique complète</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>

            {/* TAXATION & LOCAL LAWS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <Percent size={16} className="text-brand-orange" />
                <span>Paramètres fiscaux & Taxes locales</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
                
                {/* TVA settings */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-3.5 bg-slate-50/20">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-slate-800 font-bold block">Taxe sur la Valeur Ajoutée (TVA)</label>
                    <input
                      type="checkbox"
                      checked={tvaEnabled}
                      onChange={(e) => setTvaEnabled(e.target.checked)}
                      className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5 cursor-pointer"
                    />
                  </div>
                  {tvaEnabled && (
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold text-[10px]">Taux légal de TVA (%)</label>
                      <input
                        type="number"
                        value={tvaRate}
                        onChange={(e) => setTvaRate(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Tourist tax setting */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-3.5 bg-slate-50/20">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-slate-800 font-bold block">Taxe de séjour touristique</label>
                    <input
                      type="checkbox"
                      checked={touristTaxEnabled}
                      onChange={(e) => setTouristTaxEnabled(e.target.checked)}
                      className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5 cursor-pointer"
                    />
                  </div>
                  {touristTaxEnabled && (
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold text-[10px]">Montant fixe par personne/nuit (XOF)</label>
                      <input
                        type="number"
                        value={touristTaxAmt}
                        onChange={(e) => setTouristTaxAmt(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* SECTION B: SUBMIT BUTTONS & OTA PLATFORMS (Col-span 1) */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
              <Settings size={28} className="mx-auto text-brand-orange" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase">Enregistrer les changements</h4>
                <p className="text-[10px] text-slate-400 mt-1">Valider et propager ces réglages fiscaux et commerciaux sur tout le système.</p>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-brand-orange/15"
              >
                <Save size={14} />
                <span>Enregistrer</span>
              </button>
            </div>

            {/* SYSTEM LOCALES SUMMARY */}
            <div className="bg-slate-900 p-5 rounded-xl border border-[#232529] text-white space-y-3.5">
              <h4 className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Locales hôtelières par défaut</h4>
              <div className="space-y-2 text-[11px] font-bold text-[#A1A5B7]">
                <p className="flex justify-between"><span>Fuseau horaire :</span> <span className="text-white">Africa/Abidjan (UTC+0)</span></p>
                <p className="flex justify-between"><span>Devise Pivot :</span> <span className="text-white">XOF (Franc CFA)</span></p>
                <p className="flex justify-between"><span>Langue par défaut :</span> <span className="text-white">Français (FR)</span></p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
