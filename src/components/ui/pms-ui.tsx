/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

// StatCard (KPI Widget)
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color?: 'orange' | 'green' | 'blue' | 'red' | 'indigo' | 'amber';
}

export function StatCard({ title, value, change, changeType, icon: Icon, color = 'orange' }: StatCardProps) {
  const colorMap = {
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-brand-orange/10',
      iconText: 'text-brand-orange',
      border: 'border-orange-100',
    },
    green: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-success/10',
      iconText: 'text-success',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-info/10',
      iconText: 'text-info',
      border: 'border-blue-100',
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-danger/10',
      iconText: 'text-danger',
      border: 'border-red-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-[#f3e8ff]',
      iconText: 'text-[#8200da]',
      border: 'border-indigo-100',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-warning/10',
      iconText: 'text-warning',
      border: 'border-amber-100',
    }
  };

  const scheme = colorMap[color];

  return (
    <div className="bg-surface-elevated rounded-lg border border-outline p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-on-background tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg} ${scheme.iconText}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center space-x-1.5 mt-4">
          <span className={`text-xs font-bold flex items-center px-1.5 py-0.5 rounded-sm ${
            changeType === 'increase' 
              ? 'bg-[#dcfce7] text-[#016630]' 
              : changeType === 'decrease' 
                ? 'bg-red-50 text-danger' 
                : 'bg-surface text-on-surface-muted'
          }`}>
            {changeType === 'increase' ? <ArrowUpRight size={12} className="mr-0.5" /> : changeType === 'decrease' ? <ArrowDownRight size={12} className="mr-0.5" /> : null}
            {change}
          </span>
          <span className="text-[10px] text-on-surface-muted font-medium">vs. hier</span>
        </div>
      )}
    </div>
  );
}

// Badge
interface BadgeProps {
  label: string;
  type: 'room' | 'res' | 'invoice' | 'hsk' | 'maint' | 'priority' | 'default';
  status: string;
}

export function Badge({ label, type, status }: BadgeProps) {
  const getColors = () => {
    const s = status.toLowerCase();

    // Aligning exactly with Evreghen Status Badges
    if (s === 'libre' || s === 'disponible' || s === 'validé' || s === 'payée' || s === 'réceptionné') {
      return 'bg-[#dcfce7] text-[#016630] border-[#bbf7d0]/70'; // Production Ready / Success
    }
    if (s === 'occupée' || s === 'en cours' || s === 'critique' || s === 'en séjour') {
      return 'bg-red-50 text-danger border-red-200/70'; // Danger / Alerts
    }
    if (s === 'réservée' || s === 'confirmée' || s === 'haute' || s === 'en préparation' || s === 'partiellement payée') {
      return 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]/70'; // Integrated / Warming Amber
    }
    if (s === 'à nettoyer' || s === 'en attente' || s === 'brouillon' || s === 'nomale' || s === 'normale' || s === 'servie') {
      return 'bg-[#dbeafe] text-[#1447e6] border-[#bfdbfe]/70'; // In Development / Pale Blue
    }
    if (s === 'maintenance' || s === 'inspection' || s === 'contrôle' || s === 'faible' || s === 'signalé' || s === 'émise') {
      return 'bg-[#f3f4f6] text-[#364153] border-[#e5e7eb]/70'; // Planned / Soft Gray
    }
    if (s === 'hors service' || s === 'annulée' || s === 'no show' || s === 'clôturé' || s === 'résolu') {
      return 'bg-surface text-on-surface-muted border-outline'; // Muted Default / Off-road
    }

    return 'bg-surface text-on-surface-muted border-outline';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getColors()}`}>
      {label}
    </span>
  );
}

// PageHeader
interface PageHeaderProps {
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
  };
}

export function PageHeader({ title, description, actionButton, secondaryAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-5 border-b border-outline bg-surface-elevated">
      <div>
        <h2 className="text-xl font-bold text-on-background tracking-tight">{title}</h2>
        <p className="text-xs text-on-surface-muted mt-1">{description}</p>
      </div>
      {(actionButton || secondaryAction) && (
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="flex items-center space-x-1.5 bg-surface hover:bg-surface-soft border border-outline text-on-surface text-xs font-bold px-3.5 py-2 rounded-md transition-all duration-150"
            >
              {secondaryAction.icon && <secondaryAction.icon size={14} />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-3.5 py-2 rounded-md transition-all duration-150 shadow-xs"
            >
              {actionButton.icon && <actionButton.icon size={14} />}
              <span>{actionButton.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// AlertBanner
export function AlertBanner({ text, type = 'info' }: { text: string; type?: 'info' | 'warning' | 'success' | 'error' }) {
  const styles = {
    info: 'bg-[#dbeafe] text-[#1447e6] border-[#bfdbfe]/50',
    warning: 'bg-[#fef9c2] text-[#874b00] border-[#fde047]/50',
    success: 'bg-[#dcfce7] text-[#016630] border-[#bbf7d0]/50',
    error: 'bg-red-50 text-danger border-red-200/50'
  };

  return (
    <div className={`p-3.5 rounded-lg border flex items-center space-x-2 text-xs font-medium ${styles[type]}`}>
      <Info size={14} className="flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
