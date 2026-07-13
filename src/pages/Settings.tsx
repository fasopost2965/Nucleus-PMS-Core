/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Globe, 
  Percent, 
  Upload, 
  Download, 
  RefreshCw, 
  Shield, 
  FileJson,
  CheckCircle,
  Sparkles,
  X
} from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';

export default function SettingsPage() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Settings Form States with LocalStorage Hydration
  const [hotelName, setHotelName] = useState(() => localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
  const [legalName, setLegalName] = useState(() => localStorage.getItem('legalName') || 'Brunch Resto-Bar Vip SARL');
  const [phone, setPhone] = useState(() => localStorage.getItem('hotelPhone') || '+225 07 45 89 12 34');
  const [email, setEmail] = useState(() => localStorage.getItem('hotelEmail') || 'contact@brunchresto.vip');
  const [website, setWebsite] = useState(() => localStorage.getItem('hotelWebsite') || 'www.brunchresto.vip');
  const [address, setAddress] = useState(() => localStorage.getItem('hotelAddress') || 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');

  const [tvaEnabled, setTvaEnabled] = useState(() => localStorage.getItem('tvaEnabled') !== 'false');
  const [tvaRate, setTvaRate] = useState(() => Number(localStorage.getItem('tvaRate') || '18'));
  const [touristTaxEnabled, setTouristTaxEnabled] = useState(() => localStorage.getItem('touristTaxEnabled') !== 'false');
  const [touristTaxAmt, setTouristTaxAmt] = useState(() => Number(localStorage.getItem('touristTaxAmt') || '1000'));

  // Extended App/Hotel configurations
  const [appMode, setAppMode] = useState(() => localStorage.getItem('appMode') || 'production');
  const [backupEnabled, setBackupEnabled] = useState(() => localStorage.getItem('backupEnabled') !== 'false');
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('defaultCurrency') || 'XOF');
  
  // Logo state
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('hotelName', hotelName);
      localStorage.setItem('legalName', legalName);
      localStorage.setItem('hotelPhone', phone);
      localStorage.setItem('hotelEmail', email);
      localStorage.setItem('hotelWebsite', website);
      localStorage.setItem('hotelAddress', address);
      localStorage.setItem('tvaEnabled', String(tvaEnabled));
      localStorage.setItem('tvaRate', String(tvaRate));
      localStorage.setItem('touristTaxEnabled', String(touristTaxEnabled));
      localStorage.setItem('touristTaxAmt', String(touristTaxAmt));
      localStorage.setItem('appMode', appMode);
      localStorage.setItem('backupEnabled', String(backupEnabled));
      localStorage.setItem('defaultCurrency', defaultCurrency);
      if (logo) {
        localStorage.setItem('hotelLogo', logo);
      } else {
        localStorage.removeItem('hotelLogo');
      }

      // Dispatch event to update sidebar logo/name immediately
      window.dispatchEvent(new Event('hotel-config-changed'));

      setSuccessMsg('Les paramètres globaux de l\'hôtel et les préférences de l\'application ont été sauvegardés avec succès.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg('Erreur lors de la sauvegarde locale des paramètres.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // Handle Logo Upload (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('L\'image du logo dépasse la limite conseillée de 1.5 Mo.');
        setTimeout(() => setErrorMsg(''), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
        localStorage.setItem('hotelLogo', base64String);
        window.dispatchEvent(new Event('hotel-config-changed'));
        setSuccessMsg('Logo téléversé et appliqué au système !');
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Restore Default Brand Preset Logo
  const handleSetPresetLogo = () => {
    const defaultVipLogo = 'PRESET_VIP_LOGO';
    setLogo(defaultVipLogo);
    localStorage.setItem('hotelLogo', defaultVipLogo);
    window.dispatchEvent(new Event('hotel-config-changed'));
    setSuccessMsg('Logo Brunch Resto-Bar VIP par défaut restauré.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearLogo = () => {
    setLogo(null);
    localStorage.removeItem('hotelLogo');
    window.dispatchEvent(new Event('hotel-config-changed'));
  };

  // Export Settings as JSON File (allows downloading configurations)
  const handleDownloadConfig = () => {
    const configData = {
      hotelName,
      legalName,
      phone,
      email,
      website,
      address,
      tvaEnabled,
      tvaRate,
      touristTaxEnabled,
      touristTaxAmt,
      appMode,
      backupEnabled,
      defaultCurrency,
      logo,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pms_config_${hotelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setSuccessMsg('Fichier de configuration de l\'établissement téléchargé avec succès !');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Import Settings from JSON File
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.hotelName) setHotelName(parsed.hotelName);
          if (parsed.legalName) setLegalName(parsed.legalName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.website) setWebsite(parsed.website);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.tvaEnabled !== undefined) setTvaEnabled(parsed.tvaEnabled);
          if (parsed.tvaRate !== undefined) setTvaRate(parsed.tvaRate);
          if (parsed.touristTaxEnabled !== undefined) setTouristTaxEnabled(parsed.touristTaxEnabled);
          if (parsed.touristTaxAmt !== undefined) setTouristTaxAmt(parsed.touristTaxAmt);
          if (parsed.appMode) setAppMode(parsed.appMode);
          if (parsed.backupEnabled !== undefined) setBackupEnabled(parsed.backupEnabled);
          if (parsed.defaultCurrency) setDefaultCurrency(parsed.defaultCurrency);
          if (parsed.logo !== undefined) {
            setLogo(parsed.logo);
            if (parsed.logo) {
              localStorage.setItem('hotelLogo', parsed.logo);
            } else {
              localStorage.removeItem('hotelLogo');
            }
          }
          
          setSuccessMsg('Import réussi ! Les configurations importées ont été appliquées et enregistrées.');
          window.dispatchEvent(new Event('hotel-config-changed'));
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          setErrorMsg('Échec de l\'import : format de fichier JSON invalide.');
          setTimeout(() => setErrorMsg(''), 5000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <PageHeader
        title="Configuration de l'Établissement"
        description="Ajuster l'identité légale de l'hôtel, téléverser le logo, paramétrer les taxes hôtelières et exporter les configurations de l'application."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto text-left">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}
        {errorMsg && (
          <AlertBanner text={errorMsg} type="warning" />
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* SECTION A: GENERAL IDENTIFICATION & LOGO (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HOTEL LOGO MODULE */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <Upload size={16} className="text-brand-orange" />
                <span>Identité Visuelle & Logo Officiel</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Logo Frame Preview */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner text-white">
                    {logo === 'PRESET_VIP_LOGO' ? (
                      <div className="text-center p-2 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center font-bold text-lg text-white shadow-lg animate-pulse">
                          B
                        </div>
                        <span className="text-[9px] font-black tracking-wider text-brand-orange mt-1 uppercase">RESTO VIP</span>
                      </div>
                    ) : logo ? (
                      <img src={logo} alt="Logo Hôtel" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-3 text-slate-500 flex flex-col items-center space-y-1">
                        <Settings size={22} className="opacity-40 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="text-[10px] font-bold">Aucun Logo</span>
                      </div>
                    )}
                  </div>
                  {logo && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-105 transition-all cursor-pointer"
                      title="Supprimer le logo"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">Télécharger le logo de l'établissement</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Le logo sera affiché dans le menu de navigation et les factures imprimées (Formats acceptés : PNG, JPG, SVG. Max 1.5Mo).</p>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                    {/* Native File Upload Input Wrapper */}
                    <label className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[11px] font-bold px-3.5 py-1.8 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center space-x-1.5">
                      <Upload size={12} />
                      <span>Choisir un fichier</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleSetPresetLogo}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold px-3.5 py-1.8 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles size={12} className="text-amber-500" />
                      <span>Logo Brunch Resto VIP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* IDENTIFICATION FIELDS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <MapPin size={16} className="text-brand-orange" />
                <span>Coordonnées & Informations Légales</span>
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
                  <label className="text-slate-700">Raison sociale (Nom légal de facturation)</label>
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
                  <label className="text-slate-700 flex items-center space-x-1"><Phone size={12} /> <span>Téléphone direct</span></label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 flex items-center space-x-1"><Mail size={12} /> <span>Email officiel</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 flex items-center space-x-1"><Globe size={12} /> <span>Site Web URL</span></label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs font-semibold font-sans">
                <label className="text-slate-700">Adresse géographique complète d'exploitation</label>
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
                <span>Régime Fiscal & Taxes Locales</span>
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
            
            {/* SAVE ACTION CARD */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
              <Settings size={28} className="mx-auto text-brand-orange" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase">Enregistrer la Configuration</h4>
                <p className="text-[10px] text-slate-400 mt-1">Valider et propager ces réglages sur tout le système en temps réel.</p>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-brand-orange/15"
              >
                <Save size={14} />
                <span>Sauvegarder</span>
              </button>
            </div>

            {/* DOWNLOAD / UPLOAD CONFIGURATION (JSON BACKUP) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <FileJson size={18} className="text-brand-orange" />
                <h4 className="font-extrabold text-slate-800 text-xs uppercase">Sauvegarde externe</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Permet de sauvegarder l'intégralité de vos configurations (identité de l'hôtel, logos, taux fiscaux) sur votre ordinateur ou de les restaurer.</p>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Télécharger la configuration</span>
                </button>

                <label className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center">
                  <Upload size={13} />
                  <span>Importer configuration</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* PREFERENCES DE L'APPLICATION */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Shield size={18} className="text-brand-orange" />
                <h4 className="font-extrabold text-slate-800 text-xs uppercase">Options Système & Cloud</h4>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 text-[10px] uppercase">Mode de fonctionnement</label>
                  <select
                    value={appMode}
                    onChange={(e) => setAppMode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="production">Production (Sécurisé)</option>
                    <option value="demo">Mode Simulation / Démonstration</option>
                    <option value="maintenance">Maintenance hôtelière active</option>
                  </select>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div>
                    <label className="text-slate-800 block text-xs font-bold">Sauvegarde automatique</label>
                    <span className="text-[9px] text-slate-400 font-medium block">Sauvegarde horaire sécurisée</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupEnabled}
                    onChange={(e) => setBackupEnabled(e.target.checked)}
                    className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SYSTEM LOCALES SUMMARY */}
            <div className="bg-slate-900 p-5 rounded-xl border border-[#232529] text-white space-y-3.5">
              <h4 className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Locales hôtelières de l'établissement</h4>
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
