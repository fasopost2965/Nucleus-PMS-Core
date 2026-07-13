/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const [localLoading, setLocalLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLocalLoading(true);
      await onConfirm();
    } finally {
      setLocalLoading(false);
    }
  };

  const activeLoading = isLoading || localLoading;

  const typeConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: 'text-danger bg-red-50 border-red-100',
      btnColor: 'bg-danger hover:bg-red-600 focus:ring-red-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning bg-amber-50 border-amber-100',
      btnColor: 'bg-warning hover:bg-amber-600 focus:ring-amber-500 text-white',
    },
    info: {
      icon: Info,
      iconColor: 'text-info bg-blue-50 border-blue-100',
      btnColor: 'bg-brand-orange hover:bg-brand-orange-hover focus:ring-brand-orange/40 text-white',
    },
  };

  const currentType = typeConfig[type];
  const IconComponent = currentType.icon;

  const footer = (
    <>
      <button
        type="button"
        disabled={activeLoading}
        onClick={onClose}
        className="px-4 py-2 border border-outline rounded-lg text-xs font-bold text-on-surface bg-surface hover:bg-surface-soft transition-colors disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        disabled={activeLoading}
        onClick={handleConfirm}
        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 focus:ring-2 focus:ring-offset-2 ${currentType.btnColor} disabled:opacity-50`}
      >
        {activeLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        <span>{confirmText}</span>
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full border flex-shrink-0 ${currentType.iconColor}`}>
          <IconComponent size={24} />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-on-background">{title}</h4>
          <p className="text-xs text-on-surface-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
}
