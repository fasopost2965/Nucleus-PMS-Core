/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Search, User, Mail, Phone, MapPin, ShieldAlert, Award, FileText, X, CalendarDays, ArrowRight, TrendingUp, DollarSign, Bed, History, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockGuests, mockReservations, mockRooms } from '../mockData';
import { IGuest, IReservation, IRoom } from '../types';
import { api } from '../utils/api';
import { AnimatePresence, motion } from 'motion/react';

export default function Guests() {
  const [guests, setGuests] = useState<IGuest[]>(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockGuests;
  });
  const [reservations, setReservations] = useState(() => {
    const stored = localStorage.getItem('pms_reservations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockReservations;
  });
  const [rooms, setRooms] = useState<IRoom[]>(() => {
    const stored = localStorage.getItem('pms_rooms');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockRooms;
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<IGuest | null>(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return mockGuests[0];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
  const [guestType, setGuestType] = useState<'Individuel' | 'Entreprise' | 'Corporate'>('Individuel');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [deferredAuthorized, setDeferredAuthorized] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState('30 Jours Fin de Mois');
  const [creditLimit, setCreditLimit] = useState(500000);
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
      blacklist: false,
      guest_type: guestType,
      company_name: guestType !== 'Individuel' ? companyName : undefined,
      tax_id: guestType !== 'Individuel' ? taxId : undefined,
      deferred_payment_authorized: guestType !== 'Individuel' ? deferredAuthorized : false,
      payment_terms: guestType !== 'Individuel' ? paymentTerms : undefined,
      credit_limit: guestType !== 'Individuel' ? creditLimit : undefined
    };

    const updatedGuests = [...guests, newGuest];
    setGuests(updatedGuests);
    localStorage.setItem('pms_guests', JSON.stringify(updatedGuests));
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
    setGuestType('Individuel');
    setCompanyName('');
    setTaxId('');
    setDeferredAuthorized(false);
    setPaymentTerms('30 Jours Fin de Mois');
    setCreditLimit(500000);

    setSuccessMsg(`Le profil client de ${newGuest.first_name} ${newGuest.last_name} a été enregistré.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [reservationsData, roomsData] = await Promise.all([
          api.getReservations(),
          api.getRooms()
        ]);

        if (Array.isArray(reservationsData) && reservationsData.length > 0) {
          setReservations(reservationsData as IReservation[]);
          localStorage.setItem('pms_reservations', JSON.stringify(reservationsData));
        }

        if (Array.isArray(roomsData) && roomsData.length > 0) {
          setRooms(roomsData as IRoom[]);
          localStorage.setItem('pms_rooms', JSON.stringify(roomsData));
        }
      } catch (error) {
        console.error('Chargement Guests API échoué :', error);
        setLoadError('Impossible de charger les données clients. Mode dégradé activé.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex space-x-1">
                            {g.vip && <Badge label="VIP" type="default" status="confirmée" />}
                            {g.blacklist && <Badge label="Blacklisté" type="default" status="occupée" />}
                          </div>
                          {g.guest_type && g.guest_type !== 'Individuel' && (
                            <Badge 
                              label={g.guest_type === 'Entreprise' ? '🏢 Entreprise' : '💼 Corporate'} 
                              type="default" 
                              status={g.guest_type === 'Entreprise' ? 'disponible' : 'en attente'} 
                            />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-slate-600 font-medium text-[11px] border-t border-slate-50 pt-3">
                        <div className="space-y-1">
                          <p className="flex items-center space-x-1.5"><Phone size={12} className="text-slate-400" /> <span>{g.phone}</span></p>
                          <p className="flex items-center space-x-1.5 truncate max-w-[150px]"><Mail size={12} className="text-slate-400" /> <span>{g.email}</span></p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGuest(g);
                            setShowHistoryModal(true);
                          }}
                          className="bg-brand-orange text-white hover:bg-brand-orange-hover text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-xs hover:shadow-sm self-start sm:self-auto"
                        >
                          <History size={11} />
                          <span>Historique</span>
                        </button>
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
                    <div className="flex flex-wrap gap-1 mt-1 items-center">
                      {selectedGuest.vip && <Badge label="VIP" type="default" status="confirmée" />}
                      {selectedGuest.blacklist && <Badge label="Compte Suspendu" type="default" status="occupée" />}
                      {selectedGuest.guest_type && selectedGuest.guest_type !== 'Individuel' && (
                        <Badge 
                          label={selectedGuest.guest_type === 'Entreprise' ? '🏢 Entreprise' : '💼 Corporate'} 
                          type="default" 
                          status={selectedGuest.guest_type === 'Entreprise' ? 'disponible' : 'en attente'} 
                        />
                      )}
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

                  {selectedGuest.guest_type && selectedGuest.guest_type !== 'Individuel' && (
                    <div className="space-y-2 border-b border-slate-100 pb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h4 className="text-[10px] text-brand-orange font-black uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>🏢 Détails de Facturation Différée</span>
                      </h4>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Entreprise :</span>
                        <span className="text-slate-800 font-bold">{selectedGuest.company_name || '-'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">RCCM / NIF :</span>
                        <span className="text-slate-800 font-mono font-bold">{selectedGuest.tax_id || '-'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Conditions :</span>
                        <span className="text-slate-800 font-semibold">{selectedGuest.payment_terms || '30 Jours Fin de Mois'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Limite crédit :</span>
                        <span className="text-slate-800 font-mono font-extrabold text-brand-orange">{(selectedGuest.credit_limit || 0).toLocaleString()} XOF</span>
                      </p>
                      <p className="flex justify-between items-center pt-1">
                        <span className="text-slate-400">Paiement différé :</span>
                        <span>
                          {selectedGuest.deferred_payment_authorized ? (
                            <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Autorisé ✅</span>
                          ) : (
                            <span className="text-red-700 font-extrabold text-[10px] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Suspendu ❌</span>
                          )}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      onClick={() => setShowHistoryModal(true)}
                      className="w-full bg-brand-orange text-white hover:bg-brand-orange-hover border border-brand-orange/20 font-bold text-xs py-2 rounded-lg text-center transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <History size={13} />
                      <span>Consulter l'historique complet</span>
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
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-left border border-slate-100 my-8"
              >
                {/* Modal Header */}
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                      <Users size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block">Fiche Biométrique PMS</span>
                      <h3 className="font-extrabold text-sm">Enregistrement d'un Nouveau Client</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFirstName('Mariam');
                        setLastName('Diallo');
                        setGender('F');
                        setBirthDate('1994-10-18');
                        setPhone('+225 05 88 99 22 11');
                        setEmail('mariam.diallo@outlook.com');
                        setNationality('Ivoirienne');
                        setAddress('Cocody Cité des Arts, Abidjan');
                        setDocType('Passeport');
                        setDocNum('PD2004812');
                        setIsVip(true);
                        setGuestType('Entreprise');
                        setCompanyName('Société Nationale de Distribution');
                        setTaxId('CI-BKE-2026-M-4321');
                        setDeferredAuthorized(true);
                        setPaymentTerms('30 Jours Fin de Mois');
                        setCreditLimit(1500000);
                      }}
                      className="bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-brand-orange/20 transition-all cursor-pointer flex items-center space-x-1.5"
                      title="Pré-remplir le formulaire avec des données de test"
                    >
                      <Sparkles size={11} />
                      <span>Remplir Démo</span>
                    </button>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LEFT COLUMN: DYNAMIC AVATAR & BIOMETRIC PREVIEW */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Aperçu dynamique de la carte</span>
                    
                    {/* Interactive Avatar Frame */}
                    <div className="relative">
                      <motion.div
                        animate={{
                          borderColor: gender === 'F' ? '#EC4899' : gender === 'M' ? '#4F46E5' : '#64748B',
                          scale: isVip ? [1, 1.03, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-white shadow-md relative`}
                      >
                        <span className={`text-2xl font-black ${gender === 'F' ? 'text-pink-600' : gender === 'M' ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {firstName ? firstName[0].toUpperCase() : ''}{lastName ? lastName[0].toUpperCase() : 'G'}
                        </span>
                        
                        {/* VIP Hologram Badge */}
                        {isVip && (
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-md border-2 border-white animate-pulse">
                            <Award size={14} />
                          </span>
                        )}
                      </motion.div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        {firstName || lastName ? `${firstName} ${lastName}` : 'Nouveau Client'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {nationality || 'Nationalité non spécifiée'}
                      </p>
                    </div>

                    <div className="w-full pt-3 border-t border-slate-200/60 space-y-2 text-left text-[11px] font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Sexe :</span>
                        <span className="text-slate-800 font-bold">{gender === 'M' ? 'Masculin' : gender === 'F' ? 'Féminin' : 'Autre'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Pièce d'identité :</span>
                        <span className="text-slate-800 font-mono">{docNum ? `${docType} : ${docNum}` : 'Non spécifiée'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Type :</span>
                        <span className={`font-bold ${isVip ? 'text-amber-500' : 'text-slate-700'}`}>
                          {isVip ? 'Client VIP ★' : 'Régulier'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: RICH FIELDS INPUT (Span 2) */}
                  <form onSubmit={handleCreateGuest} className="md:col-span-2 space-y-4 text-xs font-semibold text-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-700 flex items-center space-x-1">
                          <span>Nom de famille</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Diallo"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-700 flex items-center space-x-1">
                          <span>Prénom</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Mariam"
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
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-slate-700">Téléphone</label>
                          {phone && (
                            <span className={`text-[10px] font-bold flex items-center space-x-0.5 ${
                              phone.replace(/[^0-9]/g, '').length >= 8 ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {phone.replace(/[^0-9]/g, '').length >= 8 ? (
                                <><CheckCircle2 size={10} /> <span>Correct</span></>
                              ) : (
                                <><AlertCircle size={10} /> <span>Incomplet</span></>
                              )}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Ex: +225 05 88 99 22 11"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-slate-700">Email</label>
                          {email && (
                            <span className={`text-[10px] font-bold flex items-center space-x-0.5 ${
                              /\S+@\S+\.\S+/.test(email) ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {/\S+@\S+\.\S+/.test(email) ? (
                                <><CheckCircle2 size={10} /> <span>Valide</span></>
                              ) : (
                                <><AlertCircle size={10} /> <span>Invalide</span></>
                              )}
                            </span>
                          )}
                        </div>
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
                          onChange={(e) => setDocType(e.target.value as any)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                        >
                          <option value="CNI">CNI</option>
                          <option value="Passeport">Passeport</option>
                          <option value="Permis">Permis</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-700">Numéro de pièce</label>
                        <input
                          type="text"
                          placeholder="Numéro officiel..."
                          value={docNum}
                          onChange={(e) => setDocNum(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono uppercase"
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

                    <div className="flex items-center space-x-2.5 py-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        id="vip-check-modal"
                        checked={isVip}
                        onChange={(e) => setIsVip(e.target.checked)}
                        className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="vip-check-modal" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center space-x-1">
                        <span>Classer ce client en tant que VIP</span>
                        <span className="text-amber-500 font-extrabold">(Accès prioritaire)</span>
                      </label>
                    </div>

                    {/* CLIENT TYPE SELECTOR */}
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Type de Client / Compte</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Individuel', 'Entreprise', 'Corporate'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setGuestType(type);
                              if (type !== 'Individuel' && !companyName) {
                                setCompanyName('');
                                setDeferredAuthorized(true);
                              }
                            }}
                            className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                              guestType === type
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {type === 'Individuel' ? '👤 Individuel' : type === 'Entreprise' ? '🏢 Entreprise' : '💼 Corporate'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CORPORATE / ENTERPRISE OPTIONS PANEL */}
                    {guestType !== 'Individuel' && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-left transition-all">
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider block">🏢 Options Entreprise & Paiement Différé</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-700 text-xs">Nom de l'entreprise <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Orange Côte d'Ivoire"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-700 text-xs">Identifiant Fiscal (NIF / RCCM)</label>
                            <input
                              type="text"
                              placeholder="Ex: CI-ABJ-2026-B-1234"
                              value={taxId}
                              onChange={(e) => setTaxId(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-700 text-xs font-semibold">Conditions de paiement</label>
                            <select
                              value={paymentTerms}
                              onChange={(e) => setPaymentTerms(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                            >
                              <option value="15 Jours Net">15 Jours Net</option>
                              <option value="30 Jours Fin de Mois">30 Jours Fin de Mois</option>
                              <option value="45 Jours Fin de Mois">45 Jours Fin de Mois</option>
                              <option value="Paiement à réception de facture">Paiement à réception</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-700 text-xs font-semibold">Limite d'encours de crédit (XOF)</label>
                            <input
                              type="number"
                              placeholder="500000"
                              value={creditLimit}
                              onChange={(e) => setCreditLimit(Number(e.target.value))}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5 pt-1.5 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            id="deferred-check"
                            checked={deferredAuthorized}
                            onChange={(e) => setDeferredAuthorized(e.target.checked)}
                            className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="deferred-check" className="text-[11px] font-extrabold text-slate-700 cursor-pointer flex items-center space-x-1">
                            <span className="text-brand-orange">Autoriser le paiement différé</span>
                            <span className="text-slate-400 font-medium">(Les factures pourront être en attente de règlement)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors"
                      >
                        Créer le profil
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CUSTOMER STAY HISTORY MODAL VIEW */}
        <AnimatePresence>
          {showHistoryModal && selectedGuest && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden text-left border border-slate-100 my-8"
              >
                {/* Modal Header */}
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                      <History size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block">Parcours Client Établi</span>
                      <h3 className="font-extrabold text-sm">Historique Complet : {selectedGuest.first_name} {selectedGuest.last_name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Dynamic Statistics Block */}
                  {(() => {
                    const stays = reservations.filter(r => r.guest_id === selectedGuest.id);
                    const totalStays = stays.length;
                    const totalNights = stays.reduce((sum, s) => sum + s.nights, 0);
                    const totalSpent = stays.reduce((sum, s) => sum + s.total_amount, 0);
                    
                    const roomCounts: { [key: string]: number } = {};
                    stays.forEach(s => { roomCounts[s.room_id] = (roomCounts[s.room_id] || 0) + 1; });
                    let favRoomNum = '-';
                    let maxStays = 0;
                    Object.entries(roomCounts).forEach(([rId, count]) => {
                      if (count > maxStays) {
                        maxStays = count;
                        const rm = rooms.find(r => String(r.id) === String(rId));
                        if (rm) favRoomNum = rm.room_number;
                      }
                    });

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                            <CalendarDays size={10} className="text-slate-400" />
                            <span>Séjours Totaux</span>
                          </span>
                          <p className="text-xl font-black text-slate-900">{totalStays} {totalStays > 1 ? 'séjours' : 'séjour'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                            <Bed size={10} className="text-slate-400" />
                            <span>Nuits passées</span>
                          </span>
                          <p className="text-xl font-black text-slate-900">{totalNights} nuits</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                            <DollarSign size={10} className="text-emerald-500" />
                            <span>Total Dépensé</span>
                          </span>
                          <p className="text-xl font-black text-emerald-600 font-mono">{totalSpent.toLocaleString()} XOF</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                            <Award size={10} className="text-amber-500" />
                            <span>Chambre Favorite</span>
                          </span>
                          <p className="text-xl font-black text-amber-600">Chambre {favRoomNum}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* List of Historic Stays */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Chronologie des réservations et nuitées</h4>
                    {(() => {
                      const stays = reservations.filter(r => r.guest_id === selectedGuest.id);
                      if (stays.length === 0) {
                        return (
                          <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2.5">
                            <History size={24} className="mx-auto text-slate-400" />
                            <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                              Aucun séjour historique n'a encore été enregistré pour ce profil client récemment créé. Créez une nouvelle réservation pour ce client pour l'associer à l'hôtel.
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {stays.map((stay) => {
                            const room = rooms.find(r => String(r.id) === String(stay.room_id));
                            return (
                              <div key={stay.id} className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-extrabold text-slate-950 text-xs">{stay.reservation_number}</span>
                                    <Badge label={stay.status} type="res" status={stay.status} />
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-semibold">
                                    Du <span className="font-bold text-slate-700">{stay.arrival_date}</span> au <span className="font-bold text-slate-700">{stay.departure_date}</span> ({stay.nights} nuits)
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    Équipement : Chambre {room ? room.room_number : stay.room_id} • {stay.adults} Adulte(s) {stay.children > 0 ? `• ${stay.children} Enfant(s)` : ''}
                                  </p>
                                </div>
                                <div className="text-right text-xs">
                                  <span className="font-mono font-black text-slate-900">{stay.total_amount.toLocaleString()} XOF</span>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Acompte: {stay.deposit.toLocaleString()} XOF • Solde: {stay.balance.toLocaleString()} XOF
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions / Export Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Établissement agréé : Brunch Bouaké SARL</p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                          const newLog = {
                            id: `act-export-${Date.now()}`,
                            time,
                            user: 'Amadou (Super Admin)',
                            module: 'Clientèle',
                            action: 'Exportation Fiche',
                            details: `Fiche d'identité hôtelière et historique complet exportés pour ${selectedGuest.first_name} ${selectedGuest.last_name}.`,
                            type: 'success' as const
                          };
                          // Save trace to simulated actions or toast
                          setSuccessMsg(`Fiche hôtelière de ${selectedGuest.first_name} ${selectedGuest.last_name} exportée avec succès !`);
                          setShowHistoryModal(false);
                          setTimeout(() => setSuccessMsg(''), 4000);
                        }}
                        className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <FileText size={13} />
                        <span>Télécharger Fiche PDF</span>
                      </button>
                      <button
                        onClick={() => setShowHistoryModal(false)}
                        className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg text-center transition-all cursor-pointer"
                      >
                        Fermer l'historique
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
