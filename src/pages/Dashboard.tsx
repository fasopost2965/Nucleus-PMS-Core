/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bed,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  PlusCircle,
  HelpCircle,
  Calendar,
  Users,
  Coins,
  Wrench,
  Sparkles,
  ArrowRight,
  Flame,
  CheckSquare,
  X,
  RefreshCw,
  Maximize2,
  FileText,
  RotateCw
} from 'lucide-react';
import { StatCard, AlertBanner } from '../components/ui/pms-ui';
import { mockRooms, mockReservations, mockActivityLogs, mockGuests } from '../mockData';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getRoomsList, getStock, logManualStockMovement } from '../stockService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [hotelName] = useState(() => localStorage.getItem('hotelName') || 'Brunch Bouaké');
  const isPurged = localStorage.getItem('pms_db_purged') === 'true';

  const [rooms, setRooms] = useState(() => getRoomsList());
  const [stock, setStock] = useState(() => getStock());
  const [reservations, setReservations] = useState(() => {
    const stored = localStorage.getItem('pms_reservations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return isPurged ? [] : mockReservations;
  });
  const [guests, setGuests] = useState(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return isPurged ? [] : mockGuests;
  });
  const [activities, setActivities] = useState(() => isPurged ? [] : mockActivityLogs);
  const [successMsg, setSuccessMsg] = useState('');

  // Currently logged-in user details for welcome banner
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('pms_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Amadou Koné', role: 'Super Administrateur' };
  });

  const [showWelcomeToast, setShowWelcomeToast] = useState(() => {
    return localStorage.getItem('pms_welcome_notified') !== 'true';
  });

  const handleStartTimesheetFromWelcome = () => {
    localStorage.setItem('pms_timesheet_active', 'true');
    localStorage.setItem('pms_timesheet_start_time', Date.now().toString());
    window.dispatchEvent(new Event('pms-timesheet-changed'));
    setSuccessMsg('Votre Timesheet de connexion a été activé avec succès.');
    setShowWelcomeToast(false);
    localStorage.setItem('pms_welcome_notified', 'true');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Modals state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCaisseModal, setShowCaisseModal] = useState(false);
  const [showNightAuditModal, setShowNightAuditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [chartFilter, setChartFilter] = useState<'all' | 'rooms' | 'restaurant'>('all');

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<{
    id: string;
    title: string;
    description: string;
    type: 'critical' | 'warning' | 'info';
    badge: string;
    details: string;
    actionLabel: string;
    actionType: 'maintenance' | 'stock' | 'vip';
  } | null>(null);

  // Night Audit process states
  const [auditStep, setAuditStep] = useState<'idle' | 'running' | 'done'>('idle');
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  const runNightAuditProcess = () => {
    setAuditStep('running');
    setAuditProgress(0);
    setAuditLogs(['Initialisation du module PMS de fin de journée...', 'Connexion aux bases de données Brunch Bouaké...']);

    // Step 1: Backup (1 sec)
    setTimeout(() => {
      setAuditProgress(30);
      setAuditLogs(prev => [...prev, '✓ Base de données sauvegardée avec succès.', 'Scan des réservations en départ aujourd\'hui...']);
    }, 1000);

    // Step 2: Check-Out processing (2 secs)
    setTimeout(() => {
      setAuditProgress(60);
      setAuditLogs(prev => [...prev, '✓ Traitement des départs : 2 chambres libérées automatiquement.', 'Mise à jour des chambres libérées au statut : À nettoyer.', 'Scan des non-présentations (No Shows)...']);
      
      // Update reservations and rooms
      setReservations(prev => prev.map(r => {
        if (r.id === 'res-2') return { ...r, status: 'Terminée' };
        return r;
      }));
      setRooms(prev => prev.map(rm => {
        if (rm.id === 'room-104') return { ...rm, current_status: 'À nettoyer' };
        return rm;
      }));
    }, 2000);

    // Step 3: No-Show processing (3 secs)
    setTimeout(() => {
      setAuditProgress(90);
      setAuditLogs(prev => [...prev, '✓ Enregistrement de 1 réservation non-présentée en No Show.', 'Clôture de l\'exercice financier et archivage journalier...']);
      
      setReservations(prev => prev.map(r => {
        if (r.id === 'res-4') return { ...r, status: 'No Show' };
        return r;
      }));
    }, 3000);

    // Step 4: Done (4 secs)
    setTimeout(() => {
      setAuditProgress(100);
      setAuditLogs(prev => [...prev, '✓ Clôture financière validée.', 'Night Audit terminé avec succès !']);
      
      // Add general activity log
      const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: `act-${Date.now()}`,
        time,
        user: 'Amadou (Super Admin)',
        module: 'Administration',
        action: 'Night Audit',
        details: 'Le Night Audit automatisé de minuit a été complété : Départs libérés, No Shows enregistrés et journée comptable clôturée.',
        type: 'success' as const
      };
      setActivities(prev => [newLog, ...prev]);
      setAuditStep('done');
    }, 4000);
  };

  // Calculate quick stats dynamically from state
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.current_status === 'Occupée').length;
  const maintenanceRooms = rooms.filter(r => r.current_status === 'Maintenance').length;
  const availableRooms = rooms.filter(r => r.current_status === 'Libre').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Calculate pending laundry workload count (sum of dirty stock items)
  const pendingLaundryCount = stock
    .filter(item => item.category_id === 'Linge Sale (Buanderie)' || item.id.endsWith('-sale'))
    .reduce((acc, item) => acc + item.current_stock, 0);

  // Graphical Data
  const occupancyData = isPurged ? [
    { name: 'Lun', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Mar', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Mer', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Jeu', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Ven', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Sam', Standard: 0, Suite: 0, Deluxe: 0 },
    { name: 'Dim', Standard: 0, Suite: 0, Deluxe: 0 },
  ] : [
    { name: 'Lun', Standard: 65, Suite: 50, Deluxe: 70 },
    { name: 'Mar', Standard: 70, Suite: 60, Deluxe: 80 },
    { name: 'Mer', Standard: 80, Suite: 70, Deluxe: 90 },
    { name: 'Jeu', Standard: 75, Suite: 80, Deluxe: 85 },
    { name: 'Ven', Standard: 90, Suite: 90, Deluxe: 95 },
    { name: 'Sam', Standard: 95, Suite: 100, Deluxe: 100 },
    { name: 'Dim', Standard: 85, Suite: 80, Deluxe: 90 },
  ];

  const revenueData = isPurged ? [
    { name: '07/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '08/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '09/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '10/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '11/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '12/07', Chambres: 0, Restaurant: 0, Total: 0 },
    { name: '13/07', Chambres: 0, Restaurant: 0, Total: 0 },
  ] : [
    { name: '07/07', Chambres: 340000, Restaurant: 120000, Total: 460000 },
    { name: '08/07', Chambres: 410000, Restaurant: 165000, Total: 575000 },
    { name: '09/07', Chambres: 280000, Restaurant: 95000, Total: 375000 },
    { name: '10/07', Chambres: 520000, Restaurant: 210000, Total: 730000 },
    { name: '11/07', Chambres: 640000, Restaurant: 295000, Total: 935000 },
    { name: '12/07', Chambres: 480000, Restaurant: 180000, Total: 660000 },
    { name: '13/07', Chambres: 550000, Restaurant: 220000, Total: 770000 },
  ];

  // Quick simulated actions
  const triggerQuickAction = (actionName: string) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `act-${Date.now()}`,
      time,
      user: 'Amadou (Super Admin)',
      module: 'Actions Rapides',
      action: 'Déclenchement',
      details: `Action "${actionName}" exécutée avec succès dans le simulateur.`,
      type: 'success' as const
    };
    setActivities([newLog, ...activities]);
    setSuccessMsg(`Action "${actionName}" simulée avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tableau de bord principal</h1>
          <p className="text-xs text-slate-500 mt-1">{hotelName} PMS • Vue d'ensemble en temps réel de votre établissement</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-white p-1.5 rounded-lg border border-slate-200">
          <Calendar size={14} className="text-slate-500 ml-1.5" />
          <span className="text-xs font-bold text-slate-800 pr-1.5">Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* WELCOME BANNER WITH TIMESHEET PROMPT */}
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 to-[#1e2022] border-l-4 border-brand-orange text-white p-5 rounded-r-xl shadow-lg relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <button
                onClick={() => {
                  setShowWelcomeToast(false);
                  localStorage.setItem('pms_welcome_notified', 'true');
                }}
                className="absolute top-3 right-3 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Ignorer"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-start space-x-4">
                <div className="bg-brand-orange/20 p-2.5 rounded-lg border border-brand-orange/40 text-brand-orange animate-pulse mt-0.5">
                  <Clock size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white">
                    Bonjour {currentUser.name} 👋
                  </h3>
                  <p className="text-xs text-white/95 mt-1 font-bold">
                    Pour continuer vous devez démarrer votre timesheet
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <button
                  onClick={() => {
                    setShowWelcomeToast(false);
                    localStorage.setItem('pms_welcome_notified', 'true');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleStartTimesheetFromWelcome}
                  className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-lg transition-colors flex items-center space-x-1.5 shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Clock size={13} />
                  <span>Démarrer mon Timesheet</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {successMsg && (
        <AlertBanner text={successMsg} type="success" />
      )}

      {/* KPI STATS CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taux d'occupation"
          value={`${occupancyRate}%`}
          change="+4.5%"
          changeType="increase"
          icon={Bed}
          color="orange"
        />
        <StatCard
          title="Chambres Disponibles"
          value={`${availableRooms} / ${totalRooms}`}
          change="Sûr"
          changeType="neutral"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Revenus du jour (estimé)"
          value="770 000 FCFA"
          change="+12.4%"
          changeType="increase"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="Maintenance active"
          value={`${maintenanceRooms} chambre(s)`}
          change="Urgent"
          changeType="decrease"
          icon={Wrench}
          color="red"
        />
      </div>

      {/* COMPACT LOGISTICS / BLANCHISSERIE ALERT STRIP */}
      {pendingLaundryCount > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-center text-xs gap-3 text-left">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg animate-pulse">
              <RotateCw size={14} className="animate-spin-slow" />
            </span>
            <div>
              <span className="font-bold text-slate-800">Alerte de linge sale en attente :</span>
              <span className="text-slate-600 ml-1">
                Il y a <strong className="text-amber-700 font-extrabold">{pendingLaundryCount} pièces</strong> de linge sale en buanderie nécessitant d'être lavées.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/inventory', { state: { tab: 'lingerie' } })}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer flex items-center justify-center space-x-1 flex-shrink-0"
          >
            <span>Lancer la machine dans les Stocks ➔</span>
          </button>
        </div>
      )}

      {/* WIDGETS AND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: REVENUE TREND (Large) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4 hover:shadow-md transition-shadow relative group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Évolution des revenus (7 derniers jours)</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-slate-100 text-slate-600 rounded font-bold uppercase tracking-wider">Interactif</span>
              </h3>
              <p className="text-[10px] text-slate-400">Total cumulé Chambres & Restaurant à Bouaké • Double-cliquez ou cliquez sur Agrandir</p>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="hidden sm:flex space-x-1.5 text-[10px] font-bold text-slate-500 mr-1.5">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-brand-orange rounded-xs inline-block mr-1"></span> Chambres</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#4F46E5] rounded-xs inline-block mr-1"></span> Resto</span>
              </div>
              <button
                onClick={() => {
                  setChartType('bar');
                  setChartFilter('all');
                  setShowChartModal(true);
                }}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-orange hover:border-brand-orange hover:bg-orange-50 transition-all cursor-pointer flex items-center space-x-1.5"
                title="Agrandir en fenêtre modale"
              >
                <Maximize2 size={12} />
                <span className="text-[9px] font-bold">Agrandir</span>
              </button>
            </div>
          </div>
          <div 
            onDoubleClick={() => {
              setChartType('bar');
              setChartFilter('all');
              setShowChartModal(true);
            }}
            className="h-64 cursor-zoom-in"
            title="Double-cliquez pour agrandir l'analyse"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`]} />
                <Legend iconSize={8} fontSize={10} />
                <Bar dataKey="Chambres" fill="#D45D1A" radius={[4, 4, 0, 0]} name="Chambres" />
                <Bar dataKey="Restaurant" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Restaurant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALERTS & URGENT OPERATIONAL TASKS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <AlertTriangle className="text-brand-orange" size={16} />
              <span>Centre d'alertes opérationnelles</span>
            </h3>
            <p className="text-[10px] text-slate-400">Actions prioritaires requises immédiatement • Cliquez pour traiter</p>
          </div>
          
          <div className="space-y-2 flex-1 overflow-y-auto">
            {isPurged ? (
              <div className="flex flex-col items-center justify-center h-full border border-dashed border-slate-200 rounded-lg bg-slate-50 text-center p-4">
                <CheckCircle className="text-emerald-500 mb-2" size={24} />
                <p className="text-xs font-bold text-slate-700">Aucune alerte opérationnelle</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Tout est en ordre. Les alertes s'afficheront ici en cas de maintenance urgente ou de stock faible.
                </p>
              </div>
            ) : (
              <>
                <div 
                  onClick={() => {
                    setSelectedAlert({
                      id: 'maint-2',
                      title: 'Maintenance Critique #maint-2',
                      description: 'Climatiseur Chambre 203 hors-service (Rapport Abdoulaye).',
                      type: 'critical',
                      badge: 'Assigné',
                      details: 'Le climatiseur de la chambre Deluxe 203 présente une fuite de réfrigérant majeure. Un technicien externe (Ets. Saliou) a été planifié pour intervention aujourd\'hui à 15h. La chambre est bloquée à la vente jusqu\'à la résolution de l\'anomalie.',
                      actionLabel: 'Prendre contact avec le technicien',
                      actionType: 'maintenance'
                    });
                    setShowAlertModal(true);
                  }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2.5 hover:bg-red-100/80 hover:border-red-200 transition-all cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-ping"></span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-red-900 group-hover:text-red-950 transition-colors">Maintenance Critique #maint-2</h4>
                    <p className="text-[10px] text-red-700 mt-0.5">Climatiseur Chambre 203 hors-service (Rapport Abdoulaye).</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[8px] bg-red-200 text-red-800 font-bold px-1.5 py-0.5 rounded-sm">Assigné</span>
                      <span className="text-[8px] text-red-600 font-bold underline group-hover:text-red-800">Traiter l'alerte →</span>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setSelectedAlert({
                      id: 'stock-1',
                      title: 'Seuil d\'alerte stock franchi',
                      description: 'Reste : 8 pièces de "Draps de bain Coton Blanc" (Seuil mini: 20).',
                      type: 'warning',
                      badge: 'Stock faible',
                      details: 'Le stock de draps de bain en coton blanc de rechange à Bouaké est descendu en dessous du seuil critique de sécurité (8 pièces restantes contre un stock d\'alerte de 20 pièces). Veuillez passer commande auprès du fournisseur local pour éviter une rupture de service de blanchisserie.',
                      actionLabel: 'Lancer un Bon de Commande Express (25)',
                      actionType: 'stock'
                    });
                    setShowAlertModal(true);
                  }}
                  className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start space-x-2.5 hover:bg-amber-100/80 hover:border-amber-200 transition-all cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-900 group-hover:text-amber-950 transition-colors">Seuil d'alerte stock franchi</h4>
                    <p className="text-[10px] text-amber-700 mt-0.5">Reste : 8 pièces de "Draps de bain Coton Blanc" (Seuil mini: 20).</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[8px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">Stock faible</span>
                      <span className="text-[8px] text-amber-600 font-bold underline group-hover:text-amber-800">Commander →</span>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setSelectedAlert({
                      id: 'vip-1',
                      title: 'Arrivée VIP aujourd\'hui',
                      description: 'Jean-Pierre Duval (Chambre 202 Suite Brunch). Champagne prêt.',
                      type: 'info',
                      badge: 'VIP',
                      details: 'M. Jean-Pierre Duval, client grand voyageur et VIP récurrent de notre établissement, séjournera pour 3 nuits dans notre Suite Brunch 202. Accueil personnalisé requis à la réception par le Manager. La bouteille de champagne de bienvenue est fraîche et prête en chambre.',
                      actionLabel: 'Enregistrer le Check-In VIP',
                      actionType: 'vip'
                    });
                    setShowAlertModal(true);
                  }}
                  className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-2.5 hover:bg-blue-100/80 hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-blue-900 group-hover:text-blue-950 transition-colors">Arrivée VIP aujourd'hui</h4>
                    <p className="text-[10px] text-blue-700 mt-0.5">Jean-Pierre Duval (Chambre 202 Suite Brunch). Champagne prêt.</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[8px] bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded-sm">VIP</span>
                      <span className="text-[8px] text-blue-600 font-bold underline group-hover:text-blue-800">Voir détails →</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 2: OCCUPANCY BY CATEGORY (Small/Medium) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Prévisions d'occupation (%)</h3>
            <p className="text-[10px] text-slate-400">Tendances de taux d'occupation par catégorie</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDlx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D45D1A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D45D1A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSuite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Deluxe" stroke="#D45D1A" fillOpacity={1} fill="url(#colorDlx)" />
                <Area type="monotone" dataKey="Suite" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSuite)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TIMELINE OF RECENT ACTIVITIES */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Clock className="text-slate-600" size={16} />
              <span>Activité récente (Audit)</span>
            </h3>
            <p className="text-[10px] text-slate-400">Flux d'actions en direct enregistrées aujourd'hui</p>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto max-h-56">
            {activities.map((log) => (
              <div key={log.id} className="relative flex space-x-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}></div>
                  <div className="w-px h-full bg-slate-200 mt-1"></div>
                </div>
                <div className="pb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{log.time}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-medium">{log.module}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-medium">{log.details}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Par : {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACCESS BUTTONS PANEL */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Raccourcis & Actions rapides</h3>
            <p className="text-[10px] text-slate-400">Exécuter des processus métier instantanés</p>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <CheckSquare size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Check-in Express</span>
            </button>
            <button
              onClick={() => setShowCaisseModal(true)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Coins size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Clôture Caisse</span>
            </button>
            <button
              onClick={() => setShowNightAuditModal(true)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Clock size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Night Audit (00h)</span>
            </button>
            <button
              onClick={() => setShowStockModal(true)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Sparkles size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Alerte Stock</span>
            </button>
          </div>
        </div>

      </div>

      {/* CHECK-IN EXPRESS MODAL */}
      <AnimatePresence>
        {showCheckInModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-left border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Fast-Track Opérationnel</span>
                  <h3 className="font-extrabold text-sm">Check-in Express</h3>
                </div>
                <button onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-medium">
                  Sélectionnez une arrivée confirmée pour enregistrer l'entrée immédiate du client et occuper la chambre correspondante.
                </p>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {reservations.filter(r => r.status === 'Confirmée').length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-bold">Aucune arrivée confirmée en attente aujourd'hui.</p>
                      <button
                        onClick={() => { setShowCheckInModal(false); navigate('/reservations'); }}
                        className="mt-3 text-xs bg-brand-orange text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-orange/90 transition-all cursor-pointer"
                      >
                        Créer une réservation
                      </button>
                    </div>
                  ) : (
                    reservations.filter(r => r.status === 'Confirmée').map(res => {
                      const room = rooms.find(rm => rm.id === res.room_id);
                      const guest = guests.find(g => g.id === res.guest_id);
                      return (
                        <div key={res.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-xs text-slate-900">{res.reservation_number}</span>
                              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-brand-orange font-extrabold text-[8px] uppercase tracking-wider">Confirmée</span>
                            </div>
                            <h4 className="text-xs font-extrabold text-slate-800">{guest ? `${guest.first_name} ${guest.last_name}` : 'Client'}</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Chambre {room ? room.room_number : '-'} • {res.nights} nuits • Arrivée : {res.arrival_date}</p>
                          </div>
                          <button
                            onClick={() => {
                              // Update reservation state
                              setReservations(prev => prev.map(r => r.id === res.id ? { ...r, status: 'En séjour' } : r));
                              // Update room state to Occupée
                              if (room) {
                                setRooms(prev => prev.map(rm => rm.id === room.id ? { ...rm, current_status: 'Occupée' } : rm));
                              }
                              // Add audit trail log
                              const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                              const newLog = {
                                id: `act-${Date.now()}`,
                                time,
                                user: 'Amadou (Super Admin)',
                                module: 'Réception',
                                action: 'Check-In',
                                details: `Entrée express enregistrée pour ${guest ? `${guest.first_name} ${guest.last_name}` : 'Client'} (Chambre ${room ? room.room_number : '-'}).`,
                                type: 'success' as const
                              };
                              setActivities(prev => [newLog, ...prev]);
                              setSuccessMsg(`Check-in réussi pour la chambre ${room ? room.room_number : '-'}.`);
                              setShowCheckInModal(false);
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                          >
                            <CheckSquare size={12} />
                            <span>Check-In</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setShowCheckInModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* CLÔTURE CAISSE MODAL */}
      <AnimatePresence>
        {showCaisseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-left border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Trésorerie & Audit</span>
                  <h3 className="font-extrabold text-sm">Clôture de Caisse Journalière</h3>
                </div>
                <button onClick={() => setShowCaisseModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold space-y-1">
                  <p>Attention : Cette action clôture le shift actuel et réinitialise les compteurs de recettes quotidiennes de l'établissement.</p>
                </div>

                <div className="space-y-3 font-semibold text-slate-600 text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Résumé financier du jour</h4>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2.5">
                    <div className="flex justify-between">
                      <span>Recettes Chambres (Wave/Espèces/Visas) :</span>
                      <span className="font-bold text-slate-800">550 000 XOF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recettes Restaurant & Bar :</span>
                      <span className="font-bold text-slate-800">220 000 XOF</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-extrabold text-slate-800 text-sm">
                      <span>Total à Clôturer :</span>
                      <span className="text-brand-orange font-black">770 000 XOF</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">Fonds physique compté en caisse (XOF)</label>
                    <input
                      type="number"
                      defaultValue={770000}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-extrabold text-slate-800"
                    />
                  </div>

                  <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded text-brand-orange focus:ring-brand-orange cursor-pointer" />
                    <span className="text-[11px] text-slate-500 font-medium select-none">Je confirme la conformité du comptage physique et valide le dépôt en coffre fort.</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => setShowCaisseModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      const newLog = {
                        id: `act-${Date.now()}`,
                        time,
                        user: 'Amadou (Super Admin)',
                        module: 'Finance',
                        action: 'Clôture Caisse',
                        details: 'Clôture de caisse validée et archivée pour la journée du 13 Juillet (Montant: 770 000 FCFA).',
                        type: 'success' as const
                      };
                      setActivities(prev => [newLog, ...prev]);
                      setSuccessMsg("Clôture de caisse enregistrée avec succès. Les rapports financiers ont été transmis.");
                      setShowCaisseModal(false);
                      setTimeout(() => setSuccessMsg(''), 4000);
                    }}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Confirmer la Clôture
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NIGHT AUDIT MODAL */}
      <AnimatePresence>
        {showNightAuditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-left border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Processus de Fin de Journée</span>
                  <h3 className="font-extrabold text-sm">Night Audit Hôtelier</h3>
                </div>
                <button 
                  onClick={() => { if (auditStep === 'idle' || auditStep === 'done') setShowNightAuditModal(false); }} 
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {auditStep === 'idle' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Le <strong>Night Audit</strong> est une opération critique effectuée chaque nuit à minuit. Il automatise les tâches administratives, met à jour le statut des chambres et génère les rapports journaliers.
                    </p>
                    <div className="p-3 bg-brand-orange/5 border border-brand-orange/10 rounded-lg space-y-1.5 text-xs text-slate-700 font-bold">
                      <h4 className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Actions qui seront exécutées :</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                        <li>Sauvegarde sécurisée de l'état de l'établissement</li>
                        <li>Mise à jour des départs du jour non-enregistrés vers le statut <strong>Terminée</strong></li>
                        <li>Changement de statut des arrivées non présentées vers le statut <strong>No Show</strong></li>
                        <li>Rétablissement des chambres libérées en statut <strong>À nettoyer</strong></li>
                        <li>Fermeture de l'exercice financier de la journée</li>
                      </ul>
                    </div>
                    <div className="pt-4 flex justify-between border-t border-slate-100">
                      <button
                        onClick={() => setShowNightAuditModal(false)}
                        className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => runNightAuditProcess()}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Clock size={13} />
                        <span>Lancer le Night Audit</span>
                      </button>
                    </div>
                  </div>
                )}

                {auditStep === 'running' && (
                  <div className="py-6 space-y-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="animate-spin text-brand-orange" size={32} />
                      <h4 className="font-extrabold text-slate-800 text-sm">Traitement en cours... ({auditProgress}%)</h4>
                    </div>
                    
                    {/* Simulated Log Feed */}
                    <div className="p-4 bg-slate-950 font-mono text-left rounded-lg text-[10px] text-emerald-400 space-y-1.5 h-36 overflow-y-auto">
                      {auditLogs.map((l, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                          <span className={l.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {auditStep === 'done' && (
                  <div className="space-y-4 text-center">
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                        <CheckSquare size={24} />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Night Audit complété avec succès !</h4>
                      <p className="text-[11px] text-slate-500 mt-1">L'exercice de la journée à Bouaké est maintenant clôturé.</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2 font-semibold text-slate-600">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rapport de clôture hôtelière</h5>
                      <div className="flex justify-between">
                        <span>Arrivées non-présentées traitées (No-Show) :</span>
                        <span className="font-bold text-slate-800">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chambres libérées automatiquement (Check-Out) :</span>
                        <span className="font-bold text-slate-800">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nouvelles chambres à nettoyer (Ménage) :</span>
                        <span className="font-bold text-emerald-600">+2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chiffre d'affaires consolidé de la journée :</span>
                        <span className="font-bold text-slate-800">770 000 FCFA</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                      <button
                        onClick={() => {
                          setShowNightAuditModal(false);
                          setAuditStep('idle');
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2 rounded-lg cursor-pointer"
                      >
                        Terminer & Mettre à jour le tableau de bord
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STOCK ALERT MODAL */}
      <AnimatePresence>
        {showStockModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-left border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Alerte Stocks</span>
                  <h3 className="font-extrabold text-sm">Contrôle des Niveaux de Stock</h3>
                </div>
                <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-medium">
                  Les articles suivants ont franchi leur seuil critique d'alerte et nécessitent une réévaluation ou une commande fournisseur immédiate :
                </p>

                <div className="space-y-3 font-semibold text-slate-600 text-xs">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-900">Draps de bain Coton Blanc</h4>
                      <p className="text-[10px] text-rose-700 mt-0.5 font-bold">Stock actuel : <span className="font-extrabold">8 pièces</span> (Seuil mini : 20)</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Fournisseur : Établissement Saliou Bouaké</p>
                    </div>
                    <button
                      onClick={() => {
                        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        const newLog = {
                          id: `act-${Date.now()}`,
                          time,
                          user: 'Amadou (Super Admin)',
                          module: 'Stock',
                          action: 'Bon de commande',
                          details: 'Bon de commande automatique initié pour 25 pièces de "Draps de bain Coton Blanc".',
                          type: 'warning' as const
                        };
                        setActivities(prev => [newLog, ...prev]);
                        setSuccessMsg("Bon de commande fournisseur généré et transmis par e-mail.");
                        setShowStockModal(false);
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Commander (25)
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between opacity-70">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Bouteilles d'eau 1.5L (Awa)</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Stock actuel : 45 bouteilles (Seuil mini : 30)</p>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">Stock OK</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => { setShowStockModal(false); navigate('/inventory'); }}
                    className="px-3.5 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Aller à l'inventaire complet
                  </button>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHART MODAL DETAIL VIEW */}
      <AnimatePresence>
        {showChartModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden text-left border border-slate-100 my-8"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Module Analytique PMS</span>
                    <h3 className="font-extrabold text-sm">Évolution des revenus — Vue détaillée</h3>
                  </div>
                </div>
                <button onClick={() => setShowChartModal(false)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Chart Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtre de catégorie</span>
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setChartFilter('all')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Tous les revenus
                      </button>
                      <button
                        onClick={() => setChartFilter('rooms')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartFilter === 'rooms' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Chambres
                      </button>
                      <button
                        onClick={() => setChartFilter('restaurant')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartFilter === 'restaurant' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Restaurant
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Type de graphique</span>
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Colonnes
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartType === 'line' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Lignes
                      </button>
                      <button
                        onClick={() => setChartType('area')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          chartType === 'area' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Aires
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Rendered Chart */}
                <div className="h-80 bg-white p-4 border border-slate-200 rounded-xl relative">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={revenueData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()} FCFA`} />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`]} />
                        <Legend />
                        {(chartFilter === 'all' || chartFilter === 'rooms') && (
                          <Bar dataKey="Chambres" fill="#D45D1A" radius={[4, 4, 0, 0]} name="Chambres" />
                        )}
                        {(chartFilter === 'all' || chartFilter === 'restaurant') && (
                          <Bar dataKey="Restaurant" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Restaurant" />
                        )}
                      </BarChart>
                    ) : chartType === 'line' ? (
                      <LineChart data={revenueData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()} FCFA`} />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`]} />
                        <Legend />
                        {(chartFilter === 'all' || chartFilter === 'rooms') && (
                          <Line type="monotone" dataKey="Chambres" stroke="#D45D1A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Chambres" />
                        )}
                        {(chartFilter === 'all' || chartFilter === 'restaurant') && (
                          <Line type="monotone" dataKey="Restaurant" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Restaurant" />
                        )}
                      </LineChart>
                    ) : (
                      <AreaChart data={revenueData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="modalColorChambres" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D45D1A" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#D45D1A" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="modalColorResto" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()} FCFA`} />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`]} />
                        <Legend />
                        {(chartFilter === 'all' || chartFilter === 'rooms') && (
                          <Area type="monotone" dataKey="Chambres" stroke="#D45D1A" strokeWidth={2.5} fillOpacity={1} fill="url(#modalColorChambres)" name="Chambres" />
                        )}
                        {(chartFilter === 'all' || chartFilter === 'restaurant') && (
                          <Area type="monotone" dataKey="Restaurant" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#modalColorResto)" name="Restaurant" />
                        )}
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Analytical breakdown table */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tableau récapitulatif des recettes quotidiennes</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-600 font-semibold">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Chambres (FCFA)</th>
                          <th className="p-3 text-right">Restaurant & Bar (FCFA)</th>
                          <th className="p-3 text-right bg-slate-100/50 text-slate-700">Total Quotidien (FCFA)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {revenueData.map((row) => (
                          <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{row.name}</td>
                            <td className="p-3 text-right font-mono text-slate-700">{row.Chambres.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono text-slate-700">{row.Restaurant.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono font-extrabold text-slate-900 bg-slate-50/30">{row.Total.toLocaleString()}</td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-slate-50 font-extrabold text-slate-900 border-t-2 border-slate-200">
                          <td className="p-3">Cumul global</td>
                          <td className="p-3 text-right font-mono text-brand-orange">
                            {revenueData.reduce((acc, r) => acc + r.Chambres, 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-indigo-600">
                            {revenueData.reduce((acc, r) => acc + r.Restaurant, 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-900 bg-slate-100/40">
                            {revenueData.reduce((acc, r) => acc + r.Total, 0).toLocaleString()} FCFA
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Mise à jour : En temps réel • Établissement : {hotelName}
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        const newLog = {
                          id: `act-${Date.now()}`,
                          time,
                          user: 'Amadou (Super Admin)',
                          module: 'Analytique',
                          action: 'Exportation',
                          details: 'Exportation complète du rapport d\'évolution des revenus de 7 jours au format Excel.',
                          type: 'success' as const
                        };
                        setActivities(prev => [newLog, ...prev]);
                        setSuccessMsg("Exportation réussie ! Le fichier Excel est en cours de téléchargement.");
                        setShowChartModal(false);
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }}
                      className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-2 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>Exporter Excel</span>
                    </button>
                    <button
                      onClick={() => setShowChartModal(false)}
                      className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      Fermer l'analyse
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPERATIONAL ALERT MODAL VIEW */}
      <AnimatePresence>
        {showAlertModal && selectedAlert && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-left border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={
                    selectedAlert.type === 'critical' ? 'text-red-500' : selectedAlert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  } size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Traitement Opérationnel</span>
                    <h3 className="font-extrabold text-sm">Alerte : {selectedAlert.id}</h3>
                  </div>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      selectedAlert.type === 'critical' ? 'bg-red-100 text-red-800' : selectedAlert.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedAlert.badge}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">{selectedAlert.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {selectedAlert.description}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium space-y-1.5 leading-relaxed">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Description détaillée du problème</span>
                  <p>{selectedAlert.details}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      let detailsMsg = '';
                      
                      if (selectedAlert.actionType === 'maintenance') {
                        detailsMsg = 'Intervention programmée pour le climatiseur de la chambre 203. Notifications transmises au chef d\'équipe technique.';
                      } else if (selectedAlert.actionType === 'stock') {
                        detailsMsg = 'Bon de commande fournisseurs créé pour 25 pièces de "Draps de bain Coton Blanc" (Fournisseur: Ets Saliou Bouaké).';
                      } else {
                        detailsMsg = 'Fiche de bienvenue VIP imprimée et check-in planifié pour la Suite 202.';
                      }

                      const newLog = {
                        id: `act-${Date.now()}`,
                        time,
                        user: 'Amadou (Super Admin)',
                        module: selectedAlert.actionType === 'maintenance' ? 'Maintenance' : selectedAlert.actionType === 'stock' ? 'Stock' : 'Réception',
                        action: 'Alerte résolue',
                        details: detailsMsg,
                        type: 'success' as const
                      };

                      setActivities(prev => [newLog, ...prev]);
                      setSuccessMsg(`Alerte "${selectedAlert.title}" prise en charge avec succès.`);
                      setShowAlertModal(false);
                      setTimeout(() => setSuccessMsg(''), 4000);
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer ${
                      selectedAlert.type === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' : selectedAlert.type === 'warning' ? 'bg-brand-orange hover:bg-brand-orange-hover text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {selectedAlert.actionLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
