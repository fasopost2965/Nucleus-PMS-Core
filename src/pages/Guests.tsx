/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Search, User, Mail, Phone, MapPin, ShieldAlert, Award, FileText, X } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockGuests } from '../mockData';
import { IGuest } from '../types';

export default function Guests() {
  const [guests, setGuests] = useState<IGuest[]>(mockGuests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<IGuest | null>(mockGuests[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New guest form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Autre'>('M');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [nationality, setNationality] = useState('Ivoirienne');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [docType, setDocType] = useState<'CNI' | 'Passeport' | 'Permis' | 'Autre'>('CNI');
  const [docNum, setDocNum] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newGuest: IGuest = {
      id: `guest-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      gender,
      birth_date: birthDate,
      nationality,
      phone,
      email,
      address,
      document_type: docType,
      document_number: docNum,
      vip: isVip,
      blacklist: false
    };

    setGuests([...guests, newGuest]);
    setSelectedGuest(newGuest);
    setShowAddModal(false);
    
    // Clear form
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDocNum('');
    setIsVip(false);

    setSuccessMsg(`Le profil client de ${newGuest.first_name} ${newGuest.last_name} a été enregistré.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion de la Clientèle"
        description="Consulter et créer des profils clients, gérer les préférences de séjour et suivre l'historique de fidélité."
        actionButton={{
          label: 'Nouveau Client',
          onClick: () => setShowAddModal(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* GUESTS DIRECTORY SEARCH & LIST */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, email ou nationalité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              </div>
            </div>

            {/* List cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guests
                .filter(g => 
                  `${g.first_name} ${g.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  g.phone.includes(searchQuery) || 
                  g.nationality.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((g) => {
                  const isSelected = selectedGuest?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuest(g)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-brand-orange bg-orange-50/10 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                            {g.first_name[0]}{g.last_name[0]}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{g.first_name} {g.last_name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{g.nationality}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {g.vip && <Badge label="VIP" type="default" status="confirmée" />}
                          {g.blacklist && <Badge label="Blacklisté" type="default" status="occupée" />}
                        </div>
                      </div>

                      <div className="mt-4 space-y-1 text-slate-600 font-medium text-[11px]">
                        <p className="flex items-center space-x-1.5"><Phone size={12} className="text-slate-400" /> <span>{g.phone}</span></p>
                        <p className="flex items-center space-x-1.5 truncate"><Mail size={12} className="text-slate-400" /> <span>{g.email}</span></p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* GUEST EXTENSIVE FILE PANEL */}
          <div>
            {selectedGuest ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
                {/* Panel header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 flex items-center justify-center font-bold text-base">
                    {selectedGuest.first_name[0]}{selectedGuest.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{selectedGuest.first_name} {selectedGuest.last_name}</h3>
                    <div className="flex space-x-1 mt-1">
                      {selectedGuest.vip && <Badge label="VIP" type="default" status="confirmée" />}
                      {selectedGuest.blacklist && <Badge label="Compte Suspendu" type="default" status="occupée" />}
                    </div>
                  </div>
                </div>

                {/* Panel details */}
                <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Informations Générales</h4>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Genre :</span>
                      <span className="text-slate-800">{selectedGuest.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Né(e) le :</span>
                      <span className="text-slate-800">{selectedGuest.birth_date}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Nationalité :</span>
                      <span className="text-slate-800">{selectedGuest.nationality}</span>
                    </p>
                  </div>

                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Coordonnées</h4>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Téléphone :</span>
                      <span className="text-slate-800 font-mono">{selectedGuest.phone}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Email :</span>
                      <span className="text-slate-800 font-mono truncate max-w-[180px]">{selectedGuest.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Adresse :</span>
                      <span className="text-slate-800 text-right">{selectedGuest.address}</span>
                    </p>
                  </div>

                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Identité légale</h4>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Type de pièce :</span>
                      <span className="text-slate-800 font-bold">{selectedGuest.document_type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Numéro de pièce :</span>
                      <span className="text-slate-800 font-mono font-bold">{selectedGuest.document_number}</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => alert(`Fiche d'historique de séjour exportée pour ${selectedGuest.first_name} ${selectedGuest.last_name}.`)}
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg text-center"
                    >
                      Consulter l'historique complet
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <Users size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold">Sélectionnez un client dans la liste pour voir sa fiche d'identité hôtelière complète.</p>
              </div>
            )}
          </div>

        </div>

        {/* CREATE NEW GUEST DIALOG MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-left">
              <div className="p-5 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider">Nouveau profil client</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGuest} className="p-6 space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700">Nom de famille</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kouamé"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Koffi"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-700">Sexe</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Autre')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-slate-700">Date de naissance</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700">Téléphone</label>
                    <input
                      type="text"
                      placeholder="Ex: +225 07 00 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Email</label>
                    <input
                      type="email"
                      placeholder="client@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-700">Type de pièce</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as 'CNI' | 'Passeport' | 'Permis' | 'Autre')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      <option value="CNI">CNI</option>
                      <option value="Passeport">Passeport</option>
                      <option value="Permis">Permis de conduire</option>
                      <option value="Autre">Autre document</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-slate-700">Numéro de document</label>
                    <input
                      type="text"
                      placeholder="Numéro officiel..."
                      value={docNum}
                      onChange={(e) => setDocNum(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700">Nationalité</label>
                    <input
                      type="text"
                      placeholder="Ex: Ivoirienne"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Adresse de résidence</label>
                    <input
                      type="text"
                      placeholder="Quartier, Ville"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    id="vip-check"
                    checked={isVip}
                    onChange={(e) => setIsVip(e.target.checked)}
                    className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="vip-check" className="text-xs font-bold text-slate-700 cursor-pointer">Classer ce client en tant que VIP</label>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Créer le profil
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
