/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarDays, Plus, Search, Filter, Trash2, CheckSquare, XCircle, Users, Bed, Coins, ArrowRight, X, UserPlus, ToggleLeft, Sparkles } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockReservations, mockGuests, mockRooms, mockBookingSources } from '../mockData';
import { IReservation, TReservationStatus } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

export default function Reservations() {
  const location = useLocation();
  const toast = useToast();

  const [reservations, setReservations] = useState<IReservation[]>(() => {
    const stored = localStorage.getItem('pms_reservations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockReservations;
  });
  
  const [guests, setGuests] = useState<any[]>(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockGuests;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);
  const [clientSource, setClientSource] = useState<'existing' | 'new'>('existing');
  
  // New Client info states
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNationality, setNewNationality] = useState('Ivoirienne');
  const [newGender, setNewGender] = useState<'M' | 'F' | 'Autre'>('M');

  const [selectedGuestId, setSelectedGuestId] = useState(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return 'guest-1';
  });

  const [guestHistory, setGuestHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (clientSource === 'existing' && selectedGuestId) {
      setLoadingHistory(true);
      api.getGuestHistory(selectedGuestId)
        .then(history => {
          setGuestHistory(history);
        })
        .catch(err => {
          console.error("Error fetching guest history:", err);
          setGuestHistory([]);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    } else {
      setGuestHistory([]);
    }
  }, [selectedGuestId, clientSource]);

  const [selectedRoomId, setSelectedRoomId] = useState('room-102');
  const [selectedSourceId, setSelectedSourceId] = useState('src-direct');
  const [arrivalDate, setArrivalDate] = useState('2026-07-15');
  const [departureDate, setDepartureDate] = useState('2026-07-18');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(3);
  const [discount, setDiscount] = useState(0);
  const [deposit, setDeposit] = useState(35000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wave' | 'orange_money' | 'card'>('cash');

  // Automatically compute nights based on dates
  useEffect(() => {
    const start = new Date(arrivalDate);
    const end = new Date(departureDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNights(diffDays);
      } else {
        setNights(1);
      }
    }
  }, [arrivalDate, departureDate]);

  // Trigger modal opening if passed from layout quick action
  useEffect(() => {
    if (location.state && (location.state as any).openCreateModal) {
      setShowCreateModal(true);
      // Clear state so it won't open again on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleStep2Next = () => {
    if (!arrivalDate || !departureDate) {
      toast.showWarning("Veuillez sélectionner les dates d'arrivée et de départ.");
      return;
    }

    const start = new Date(arrivalDate);
    const end = new Date(departureDate);

    if (start >= end) {
      toast.showWarning("La date d'arrivée doit être strictement antérieure à la date de départ.");
      return;
    }

    if (!selectedRoomId) {
      toast.showWarning("Veuillez sélectionner une chambre valide.");
      return;
    }

    const roomObj = mockRooms.find(r => r.id === selectedRoomId);
    if (!roomObj) {
      toast.showWarning("La chambre sélectionnée est introuvable.");
      return;
    }

    setStep(3);
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!arrivalDate || !departureDate) {
      toast.showWarning("Veuillez sélectionner les dates d'arrivée et de départ.");
      return;
    }

    const start = new Date(arrivalDate);
    const end = new Date(departureDate);

    if (start >= end) {
      toast.showWarning("La date d'arrivée doit être strictement antérieure à la date de départ.");
      return;
    }

    if (!selectedRoomId) {
      toast.showWarning("Veuillez sélectionner une chambre valide.");
      return;
    }

    const roomObj = mockRooms.find(r => r.id === selectedRoomId);
    if (!roomObj) {
      toast.showWarning("La chambre sélectionnée est introuvable ou invalide.");
      return;
    }
    
    let guestId = selectedGuestId;
    let guestObj = guests.find(g => g.id === selectedGuestId);

    if (clientSource === 'new') {
      if (!newFirstName.trim() || !newLastName.trim()) {
        toast.showWarning('Le prénom et le nom du nouveau client sont requis.');
        return;
      }

      // Create new guest
      const newGuest = {
        id: `guest-${Date.now()}`,
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        gender: newGender,
        birth_date: '1990-01-01',
        nationality: newNationality,
        phone: newPhone.trim(),
        email: newEmail.trim(),
        address: '',
        document_type: 'CNI',
        document_number: '',
        vip: false,
        blacklist: false,
        guest_type: 'Individuel'
      };

      // Add to guests state & localStorage
      const updatedGuests = [...guests, newGuest];
      setGuests(updatedGuests);
      localStorage.setItem('pms_guests', JSON.stringify(updatedGuests));

      guestId = newGuest.id;
      guestObj = newGuest;
    }

    if (!roomObj || !guestObj) {
      toast.showError('Informations de chambre ou de client invalides.');
      return;
    }

    const rate = roomObj.base_price;
    const subtotal = rate * nights;
    const taxes = Math.round(subtotal * 0.05); // simulated hotel tax
    const total = subtotal - discount + taxes;
    const balance = total - deposit;

    const newRes: IReservation = {
      id: `res-${Date.now()}`,
      reservation_number: `RES-2026-000${reservations.length + 1}`,
      guest_id: guestId,
      room_id: selectedRoomId,
      booking_source_id: selectedSourceId,
      status: 'Confirmée',
      arrival_date: arrivalDate,
      departure_date: departureDate,
      adults,
      children,
      nights,
      room_rate: rate,
      discount,
      tax_amount: taxes,
      total_amount: total,
      deposit,
      balance,
      remarks: 'Réservation créée lors de la démonstration.'
    };

    const updatedList = [newRes, ...reservations];
    setReservations(updatedList);
    localStorage.setItem('pms_reservations', JSON.stringify(updatedList));
    setStep(1);
    setShowCreateModal(false);
    toast.showSuccess(`La réservation ${newRes.reservation_number} a été créée avec succès pour ${guestObj.first_name} ${guestObj.last_name}.`);
    
    // Reset form & state
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('');
    setNewEmail('');
    setNewGender('M');
    setNewNationality('Ivoirienne');
    setClientSource('existing');
  };

  const updateReservationStatus = (id: string, newStatus: TReservationStatus) => {
    const updatedList = reservations.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setReservations(updatedList);
    localStorage.setItem('pms_reservations', JSON.stringify(updatedList));
    toast.showSuccess(`Statut de la réservation mis à jour : ${newStatus}`);
  };

  const deleteReservation = (id: string) => {
    if (confirm('Voulez-vous supprimer définitivement cette réservation ?')) {
      const updatedList = reservations.filter(r => r.id !== id);
      setReservations(updatedList);
      localStorage.setItem('pms_reservations', JSON.stringify(updatedList));
      toast.showSuccess('Réservation supprimée avec succès.');
    }
  };

  const selectedRoomObj = mockRooms.find(r => r.id === selectedRoomId);
  const selectedGuestObj = clientSource === 'existing'
    ? guests.find(g => g.id === selectedGuestId)
    : {
        id: 'new-guest-temp',
        first_name: newFirstName || 'Nouveau',
        last_name: newLastName || 'Client',
        email: newEmail || 'adresse@email.com',
        phone: newPhone || 'Téléphone non renseigné',
        nationality: newNationality,
        vip: false
      };
  const selectedSourceObj = mockBookingSources.find(s => s.id === selectedSourceId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion des Réservations"
        description="Gérer le calendrier, valider les acomptes et suivre les flux d'arrivées/départs."
        actionButton={{
          label: 'Nouvelle Réservation',
          onClick: () => setShowCreateModal(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* RESERVATIONS TABLE WORKSPACE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          
          {/* Filtering row */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">État:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tous les états</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En attente">En attente</option>
                <option value="Confirmée">Confirmée</option>
                <option value="En séjour">En séjour</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
                <option value="No Show">No Show</option>
              </select>
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Rechercher par n° de réservation ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">N° Réservation</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Chambre</th>
                  <th className="py-3 px-4">Arrivée - Départ</th>
                  <th className="py-3 px-4">Nuits</th>
                  <th className="py-3 px-4">Montant Total</th>
                  <th className="py-3 px-4">Acompte</th>
                  <th className="py-3 px-4">État</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations
                  .filter(r => statusFilter === 'all' || r.status === statusFilter)
                  .filter(r => {
                    const guest = guests.find(g => g.id === r.guest_id);
                    const guestName = guest ? `${guest.first_name} ${guest.last_name}` : '';
                    return r.reservation_number.includes(searchQuery) || guestName.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((res) => {
                    const guest = guests.find(g => g.id === res.guest_id);
                    const room = mockRooms.find(rm => rm.id === res.room_id);
                    const source = mockBookingSources.find(s => s.id === res.booking_source_id);
                    
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{res.reservation_number}</td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{guest ? `${guest.first_name} ${guest.last_name}` : 'Inconnu'}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Source: {source ? source.name : 'Direct'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-700 text-sm">{room ? room.room_number : '-'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">{res.arrival_date} au {res.departure_date}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-bold">{res.nights}n</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800 font-mono">{(res.total_amount).toLocaleString()} XOF</td>
                        <td className="py-3.5 px-4 font-bold text-slate-500 font-mono">{(res.deposit).toLocaleString()} XOF</td>
                        <td className="py-3.5 px-4">
                          <Badge label={res.status} type="res" status={res.status} />
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-1">
                          {res.status === 'Confirmée' && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'En séjour')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded"
                              title="Arrivée"
                            >
                              Check-In
                            </button>
                          )}
                          {res.status === 'En séjour' && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'Terminée')}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded"
                              title="Départ"
                            >
                              Check-Out
                            </button>
                          )}
                          {['Brouillon', 'En attente', 'Confirmée'].includes(res.status) && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'Annulée')}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded"
                              title="Annuler"
                            >
                              Annuler
                            </button>
                          )}
                          <button
                            onClick={() => deleteReservation(res.id)}
                            className="text-slate-400 hover:text-red-500 inline-block p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* STEPPED CREATION DIALOG OVERLAY */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-left border border-slate-100"
              >
                
                {/* Modal Header */}
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Assistant Intelligent</span>
                    <h3 className="font-extrabold text-sm">Nouvelle réservation</h3>
                  </div>
                  <button onClick={() => { setShowCreateModal(false); setStep(1); }} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                    <X size={18} />
                  </button>
                </div>

                {/* Progress Stepper Bar */}
                <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400">
                  <div className={`flex items-center space-x-1.5 transition-colors ${step >= 1 ? 'text-brand-orange font-extrabold' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                    <span>Client & Source</span>
                  </div>
                  <ArrowRight size={10} className="text-slate-300" />
                  <div className={`flex items-center space-x-1.5 transition-colors ${step >= 2 ? 'text-brand-orange font-extrabold' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                    <span>Dates & Chambre</span>
                  </div>
                  <ArrowRight size={10} className="text-slate-300" />
                  <div className={`flex items-center space-x-1.5 transition-colors ${step >= 3 ? 'text-brand-orange font-extrabold' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                    <span>Tarifs & Règlement</span>
                  </div>
                </div>

                {/* Modal Body / Steps */}
                <form onSubmit={handleCreateReservation} className="p-6 text-left">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-4"
                      >
                        {/* Selector of Client Source */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Source du Client / Réservation</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setClientSource('existing')}
                              className={`p-2.5 rounded-lg border text-center transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                                clientSource === 'existing'
                                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange font-bold text-xs ring-2 ring-brand-orange/10'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold'
                              }`}
                            >
                              <Users size={14} />
                              <span>Client Existant</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setClientSource('new')}
                              className={`p-2.5 rounded-lg border text-center transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                                clientSource === 'new'
                                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange font-bold text-xs ring-2 ring-brand-orange/10'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold'
                              }`}
                            >
                              <UserPlus size={14} />
                              <span>Nouveau Client (Saisie à zéro)</span>
                            </button>
                          </div>
                        </div>

                        {clientSource === 'existing' ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                                <Users size={13} className="text-brand-orange" />
                                <span>Sélectionner le Client</span>
                              </label>
                              <select
                                value={selectedGuestId}
                                onChange={(e) => setSelectedGuestId(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 focus:outline-none transition-all cursor-pointer font-medium"
                              >
                                {guests.map(g => (
                                  <option key={g.id} value={g.id}>{g.first_name} {g.last_name} ({g.nationality})</option>
                                ))}
                              </select>
                            </div>

                            {/* CLIENT DYNAMIC DETAILS CARD */}
                            {selectedGuestObj && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-brand-orange/5 rounded-lg border border-brand-orange/10 flex items-center space-x-3 text-xs"
                              >
                                <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-extrabold text-xs">
                                  {selectedGuestObj.first_name[0]}{selectedGuestObj.last_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-slate-800">{selectedGuestObj.first_name} {selectedGuestObj.last_name}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange font-extrabold text-[8px] uppercase tracking-wider">
                                      {selectedGuestObj.id === 'guest-1' ? 'VIP' : 'Régulier'}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 text-[10px] truncate mt-0.5">{selectedGuestObj.email} • {selectedGuestObj.phone}</p>
                                </div>
                              </motion.div>
                            )}

                            {/* HABITUÉ ALERT BADGE */}
                            {guestHistory.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1 mt-2"
                              >
                                <div className="flex items-center space-x-1.5 font-extrabold">
                                  <Sparkles size={13} className="text-amber-600 animate-pulse" />
                                  <span>Alerte : Client Habitué ✨</span>
                                </div>
                                <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                                  Ce client est un habitué ! Il a déjà effectué <strong className="font-extrabold text-amber-900">{guestHistory.length} séjour(s)</strong> chez nous. Assurez un accueil d'excellence.
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3.5 border border-slate-100 bg-slate-50/30 p-4 rounded-xl">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                              <UserPlus size={14} className="text-brand-orange" />
                              <span>Informations du Nouveau Client</span>
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Prénom <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  value={newFirstName}
                                  onChange={(e) => setNewFirstName(e.target.value)}
                                  placeholder="Prénom"
                                  className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Nom de famille <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  value={newLastName}
                                  onChange={(e) => setNewLastName(e.target.value)}
                                  placeholder="Nom"
                                  className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Téléphone</label>
                                <input
                                  type="tel"
                                  value={newPhone}
                                  onChange={(e) => setNewPhone(e.target.value)}
                                  placeholder="+225 07..."
                                  className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">E-mail</label>
                                <input
                                  type="email"
                                  value={newEmail}
                                  onChange={(e) => setNewEmail(e.target.value)}
                                  placeholder="client@domaine.com"
                                  className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Nationalité</label>
                                <input
                                  type="text"
                                  value={newNationality}
                                  onChange={(e) => setNewNationality(e.target.value)}
                                  placeholder="Ivoirienne"
                                  className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Genre</label>
                                <div className="flex space-x-1">
                                  {['M', 'F', 'Autre'].map((g) => (
                                    <button
                                      key={g}
                                      type="button"
                                      onClick={() => setNewGender(g as any)}
                                      className={`flex-1 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                        newGender === g
                                          ? 'border-brand-orange bg-brand-orange/5 text-brand-orange font-bold'
                                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      {g}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Canal de réservation</label>
                          <select
                            value={selectedSourceId}
                            onChange={(e) => setSelectedSourceId(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 focus:outline-none transition-all cursor-pointer font-medium"
                          >
                            {mockBookingSources.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                            ))}
                          </select>
                        </div>

                        {/* CANAL DETAILS WIDGET */}
                        {selectedSourceObj && (
                          <div className="text-[10px] text-slate-500 italic bg-slate-50 px-3 py-2 rounded-md">
                            Source : <span className="font-bold text-slate-700">{selectedSourceObj.name}</span> • Type de canal : <span className="text-brand-orange font-bold">{selectedSourceObj.type}</span>.
                          </div>
                        )}

                        <div className="pt-4 flex justify-end border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
                          >
                            Étape suivante
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                            <Bed size={13} className="text-brand-orange" />
                            <span>Sélectionner la Chambre disponible</span>
                          </label>
                          <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 focus:outline-none transition-all cursor-pointer font-medium"
                          >
                            {mockRooms.filter(r => r.current_status === 'Libre' || r.current_status === 'Disponible' || !r.current_status).map(r => (
                              <option key={r.id} value={r.id}>Chambre {r.room_number} - {r.bed_type} ({r.base_price.toLocaleString()} XOF)</option>
                            ))}
                          </select>
                        </div>

                        {/* ROOM DETAILS DYNAMIC PREVIEW CARD */}
                        {selectedRoomObj && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-center justify-between text-xs text-slate-700"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-600">
                                <Bed size={15} />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800">Chambre {selectedRoomObj.room_number}</h5>
                                <p className="text-[10px] text-slate-500">{selectedRoomObj.bed_type} • Capacité : {selectedRoomObj.capacity} pers.</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-emerald-600">{selectedRoomObj.base_price.toLocaleString()} XOF</span>
                              <p className="text-[9px] text-slate-400">/ nuit</p>
                            </div>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Date Arrivée</label>
                            <input
                              type="date"
                              value={arrivalDate}
                              onChange={(e) => setArrivalDate(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Date Départ</label>
                            <input
                              type="date"
                              value={departureDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nuits</label>
                            <div className="text-xs font-extrabold text-brand-orange px-1 py-1.5 bg-white border border-slate-200 rounded text-center">
                              {nights} nuits
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Adultes</label>
                            <input
                              type="number"
                              min={1}
                              max={4}
                              value={adults}
                              onChange={(e) => setAdults(Number(e.target.value))}
                              className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-xs focus:border-brand-orange focus:outline-none text-center font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Enfants</label>
                            <input
                              type="number"
                              min={0}
                              max={4}
                              value={children}
                              onChange={(e) => setChildren(Number(e.target.value))}
                              className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-xs focus:border-brand-orange focus:outline-none text-center font-bold"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-between border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Précédent
                          </button>
                          <button
                            type="button"
                            onClick={handleStep2Next}
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
                          >
                            Étape suivante
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                              <Coins size={13} className="text-brand-orange" />
                              <span>Remise (XOF)</span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={discount}
                              onChange={(e) => setDiscount(Number(e.target.value))}
                              className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-bold text-slate-800"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Acompte payé (XOF)</label>
                            <input
                              type="number"
                              min={0}
                              value={deposit}
                              onChange={(e) => setDeposit(Number(e.target.value))}
                              className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none transition-all font-bold text-slate-800"
                            />
                          </div>
                        </div>

                        {/* INTERACTIVE MODE DE PAIEMENT SELECTOR */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Mode de règlement de l'acompte</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'cash', label: 'Espèces', color: 'border-emerald-200 text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10' },
                              { id: 'wave', label: 'Wave', color: 'border-sky-200 text-sky-600 bg-sky-500/5 hover:bg-sky-500/10' },
                              { id: 'orange_money', label: 'Orange', color: 'border-orange-200 text-orange-600 bg-orange-500/5 hover:bg-orange-500/10' },
                              { id: 'card', label: 'Carte', color: 'border-slate-200 text-slate-600 bg-slate-500/5 hover:bg-slate-500/10' },
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={`border p-2 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                  paymentMethod === m.id 
                                    ? 'border-brand-orange ring-2 ring-brand-orange/20 bg-white font-extrabold text-slate-800 shadow-xs' 
                                    : 'opacity-70 bg-white ' + m.color
                                }`}
                              >
                                <span className="text-[10px] font-bold leading-none">{m.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Calculated values summary */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-2.5 font-semibold text-slate-600">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Résumé de facturation</h4>
                          <div className="flex justify-between text-slate-500">
                            <span>Tarif de base :</span>
                            <span>{selectedRoomObj ? selectedRoomObj.base_price.toLocaleString() : '35 000'} XOF / nuit</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Séjour ({nights} nuits) :</span>
                            <span>{((selectedRoomObj ? selectedRoomObj.base_price : 35000) * nights).toLocaleString()} XOF</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              <span>Remise exceptionnelle :</span>
                              <span>- {discount.toLocaleString()} XOF</span>
                            </div>
                          )}
                          <div className="flex justify-between text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            <span>Acompte enregistré ({paymentMethod.toUpperCase()}) :</span>
                            <span>{deposit.toLocaleString()} XOF</span>
                          </div>
                          <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-800">
                            <span>Solde restant à payer :</span>
                            <span>{Math.max(0, ((selectedRoomObj ? selectedRoomObj.base_price : 35000) * nights) - discount - deposit).toLocaleString()} XOF</span>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-between border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Précédent
                          </button>
                          <button
                            type="submit"
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                          >
                            Valider & Confirmer la réservation
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
