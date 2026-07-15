/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeNotificationProps {
  userName: string;
  timesheetActive: boolean;
  onStartTimesheet: () => void;
}

export default function WelcomeNotification({ 
  userName, 
  timesheetActive, 
  onStartTimesheet 
}: WelcomeNotificationProps) {
  
  if (timesheetActive) {
    return (
      <div className="bg-[#EBFDF5] border border-emerald-200 rounded-xl p-4 text-left flex items-center space-x-3 shadow-xs">
        <div className="bg-emerald-500 text-white p-2 rounded-lg">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h3 className="text-xs font-black text-emerald-950">Bonjour {userName} 👋</h3>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
            Votre temps de service (Timesheet) est actuellement actif et enregistré dans les rapports. Bon travail !
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-start space-x-3">
        <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg border border-amber-200 mt-0.5 shrink-0 animate-pulse">
          <Clock size={18} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-black text-amber-950">Bonjour {userName} 👋</h3>
          <p className="text-[10px] text-amber-800 font-bold">
            Bienvenue ! Veuillez démarrer votre temps de service (Timesheet) pour commencer.
          </p>
          <p className="text-[9px] text-amber-600 font-bold mt-1 bg-amber-500/10 rounded px-2 py-0.5 inline-block">
            ⚠️ Attention : N'oubliez pas de vous déconnecter de votre session avant de quitter votre poste.
          </p>
        </div>
      </div>
      
      <button
        onClick={onStartTimesheet}
        className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-xs shadow-amber-500/15"
      >
        <Clock size={12} />
        <span>Démarrer mon Timesheet</span>
      </button>
    </motion.div>
  );
}
