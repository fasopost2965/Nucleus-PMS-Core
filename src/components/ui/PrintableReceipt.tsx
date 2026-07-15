/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  Copy, 
  CheckCircle, 
  FileText, 
  CreditCard, 
  Smartphone, 
  Coins, 
  DollarSign, 
  ClipboardCheck,
  ChevronDown,
  Globe,
  RefreshCw
} from 'lucide-react';
import { IInvoice, IPayment, IInvoiceItem, IGuest, IReservation } from '../../types';
import { mockInvoiceItems } from '../../mockData';

interface PrintableReceiptProps {
  invoice: IInvoice;
  payment?: IPayment; // If provided, highlights this payment transaction as a receipt
  guest: IGuest;
  reservation?: IReservation;
  invoiceItems?: IInvoiceItem[];
  onClose: () => void;
  defaultCurrency?: 'XOF' | 'EUR';
}

export default function PrintableReceipt({
  invoice,
  payment,
  guest,
  reservation,
  invoiceItems: propInvoiceItems,
  onClose,
  defaultCurrency = 'XOF'
}: PrintableReceiptProps) {
  const [receiptFormat, setReceiptFormat] = useState<'A4' | 'thermal'>('A4');
  const [currency, setCurrency] = useState<'XOF' | 'EUR'>(defaultCurrency);
  const [copied, setCopied] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([]);
  const [documentType, setDocumentType] = useState<'standard' | 'avoir'>('standard');

  // Load hotel identity dynamically from Settings
  const [hotelName, setHotelName] = useState(() => localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
  const [legalName, setLegalName] = useState(() => localStorage.getItem('legalName') || 'Brunch Resto-Bar Vip SARL');
  const [hotelPhone, setHotelPhone] = useState(() => localStorage.getItem('hotelPhone') || '+225 07 45 89 12 34');
  const [hotelEmail, setHotelEmail] = useState(() => localStorage.getItem('hotelEmail') || 'contact@brunchresto.vip');
  const [hotelWebsite, setHotelWebsite] = useState(() => localStorage.getItem('hotelWebsite') || 'www.brunchresto.vip');
  const [hotelAddress, setHotelAddress] = useState(() => localStorage.getItem('hotelAddress') || 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');
  const [hotelLogo, setHotelLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));

  // Load custom template settings dynamically
  const [invoiceTemplate, setInvoiceTemplate] = useState(() => localStorage.getItem('invoiceTemplate') || 'modern');
  const [invoiceShowLogo, setInvoiceShowLogo] = useState(() => localStorage.getItem('invoiceShowLogo') !== 'false');
  const [invoiceShowIdDoc, setInvoiceShowIdDoc] = useState(() => localStorage.getItem('invoiceShowIdDoc') !== 'false');
  const [invoiceShowBankDetails, setInvoiceShowBankDetails] = useState(() => localStorage.getItem('invoiceShowBankDetails') !== 'false');
  const [invoiceShowSignatures, setInvoiceShowSignatures] = useState(() => localStorage.getItem('invoiceShowSignatures') !== 'false');
  const [invoiceShowNotes, setInvoiceShowNotes] = useState(() => localStorage.getItem('invoiceShowNotes') !== 'false');
  const [invoiceCustomNotes, setInvoiceCustomNotes] = useState(() => localStorage.getItem('invoiceCustomNotes') || "• TVA au taux de 18% appliquée sur l'ensemble des prestations assujetties.\n• Taxe de séjour hôtelière collectée pour le compte de la municipalité.\n• En cas de litige, seul le tribunal de commerce compétent est saisi.");
  const [invoiceAvoirCustomNotes, setInvoiceAvoirCustomNotes] = useState(() => localStorage.getItem('invoiceAvoirCustomNotes') || "• Cet avoir est à valoir sur vos prochains séjours ou remboursable sous conditions.\n• Document d'annulation/rectification commerciale.");
  const [invoiceBankDetails, setInvoiceBankDetails] = useState(() => localStorage.getItem('invoiceBankDetails') || "NSIA BANQUE CI: CI123 45678 901234567890 12\nOrange Money: +225 07 45 89 12 34\nWave Transfer: +225 07 45 89 12 34");

  useEffect(() => {
    const handleReload = () => {
      setHotelName(localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
      setLegalName(localStorage.getItem('legalName') || 'Brunch Resto-Bar Vip SARL');
      setHotelPhone(localStorage.getItem('hotelPhone') || '+225 07 45 89 12 34');
      setHotelEmail(localStorage.getItem('hotelEmail') || 'contact@brunchresto.vip');
      setHotelWebsite(localStorage.getItem('hotelWebsite') || 'www.brunchresto.vip');
      setHotelAddress(localStorage.getItem('hotelAddress') || 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');
      setHotelLogo(localStorage.getItem('hotelLogo'));

      setInvoiceTemplate(localStorage.getItem('invoiceTemplate') || 'modern');
      setInvoiceShowLogo(localStorage.getItem('invoiceShowLogo') !== 'false');
      setInvoiceShowIdDoc(localStorage.getItem('invoiceShowIdDoc') !== 'false');
      setInvoiceShowBankDetails(localStorage.getItem('invoiceShowBankDetails') !== 'false');
      setInvoiceShowSignatures(localStorage.getItem('invoiceShowSignatures') !== 'false');
      setInvoiceShowNotes(localStorage.getItem('invoiceShowNotes') !== 'false');
      setInvoiceCustomNotes(localStorage.getItem('invoiceCustomNotes') || "• TVA au taux de 18% appliquée sur l'ensemble des prestations assujetties.\n• Taxe de séjour hôtelière collectée pour le compte de la municipalité.\n• En cas de litige, seul le tribunal de commerce compétent est saisi.");
      setInvoiceAvoirCustomNotes(localStorage.getItem('invoiceAvoirCustomNotes') || "• Cet avoir est à valoir sur vos prochains séjours ou remboursable sous conditions.\n• Document d'annulation/rectification commerciale.");
      setInvoiceBankDetails(localStorage.getItem('invoiceBankDetails') || "NSIA BANQUE CI: CI123 45678 901234567890 12\nOrange Money: +225 07 45 89 12 34\nWave Transfer: +225 07 45 89 12 34");
    };

    window.addEventListener('hotel-config-changed', handleReload);
    return () => window.removeEventListener('hotel-config-changed', handleReload);
  }, []);

  // Load items
  useEffect(() => {
    if (propInvoiceItems && propInvoiceItems.length > 0) {
      setInvoiceItems(propInvoiceItems);
    } else {
      // Find from mock data
      const found = mockInvoiceItems.filter(item => item.invoice_id === invoice.id);
      if (found.length > 0) {
        setInvoiceItems(found);
      } else {
        // Fallback dynamic item
        setInvoiceItems([{
          id: `dynamic-${invoice.id}`,
          invoice_id: invoice.id,
          item_type: 'Chambre',
          item_id: reservation?.room_id || 'room-101',
          description: `Hébergement - Chambre ${reservation?.room_id?.replace('room-', '') || '101'} (${reservation?.nights || 1} nuitée(s))`,
          quantity: reservation?.nights || 1,
          unit_price: reservation?.room_rate || (invoice.subtotal / (reservation?.nights || 1)),
          tax: invoice.tax,
          total: invoice.subtotal
        }]);
      }
    }
  }, [invoice, propInvoiceItems, reservation]);

  // Sync with main app currency if changed
  useEffect(() => {
    const mainCurrency = localStorage.getItem('pms_currency') as 'XOF' | 'EUR';
    if (mainCurrency) {
      setCurrency(mainCurrency);
    }
  }, []);

  const formatAmount = (xofAmount: number) => {
    if (currency === 'EUR') {
      const eurAmount = xofAmount / 655.957;
      return `${eurAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    return `${xofAmount.toLocaleString('fr-FR')} XOF`;
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'Carte': return <CreditCard size={14} className="text-blue-600" />;
      case 'Mobile Money': return <Smartphone size={14} className="text-orange-600" />;
      case 'Espèces': return <Coins size={14} className="text-emerald-600" />;
      default: return <DollarSign size={14} className="text-slate-600" />;
    }
  };

  // Raw plain text receipt formatting for copy
  const handleCopyRawText = () => {
    const mult = documentType === 'avoir' ? -1 : 1;
    const lines: string[] = [];
    lines.push(`=================================`);
    lines.push(`     ${hotelName.toUpperCase()}      `);
    lines.push(`=================================`);
    lines.push(`${hotelAddress}`);
    lines.push(`Tel: ${hotelPhone}`);
    lines.push(`Nom légal: ${legalName}`);
    lines.push(`---------------------------------`);
    lines.push(`REÇU CLIENT : ${payment ? 'PAIEMENT' : documentType === 'avoir' ? "FACTURE D'AVOIR" : 'FACTURE'}`);
    lines.push(`N° Facture : ${invoice.invoice_number}`);
    if (payment) {
      lines.push(`Réf Paiement : ${payment.id.substring(0, 10).toUpperCase()}`);
      lines.push(`Date : ${payment.payment_date}`);
    } else {
      lines.push(`Date Facture : ${invoice.issued_at}`);
    }
    lines.push(`Client : ${guest.first_name} ${guest.last_name}`);
    if (reservation) {
      lines.push(`Chambre : ${reservation.room_id.replace('room-', '')}`);
      lines.push(`Séjour : ${reservation.arrival_date} au ${reservation.departure_date}`);
    }
    lines.push(`---------------------------------`);
    lines.push(`Détails des prestations :`);
    invoiceItems.forEach(item => {
      lines.push(`- ${item.description}`);
      lines.push(`  ${item.quantity} x ${formatAmount(item.unit_price * mult)} = ${formatAmount(item.total * mult)}`);
    });
    lines.push(`---------------------------------`);
    lines.push(`Sous-Total HT : ${formatAmount(invoice.subtotal * mult)}`);
    lines.push(`Remise : - ${formatAmount(invoice.discount * mult)}`);
    lines.push(`Taxes (TVA + Séjour) : ${formatAmount(invoice.tax * mult)}`);
    lines.push(`TOTAL TTC : ${formatAmount(invoice.total * mult)}`);
    lines.push(`---------------------------------`);
    if (payment) {
      lines.push(`PAYÉ CE JOUR : ${formatAmount(payment.amount * mult)}`);
      lines.push(`Mode : ${payment.payment_method}`);
      if (payment.reference) lines.push(`Réf : ${payment.reference}`);
    }
    lines.push(`Déjà réglé : ${formatAmount(invoice.paid * mult)}`);
    lines.push(`SOLDE RESTANT : ${formatAmount(invoice.balance * mult)}`);
    lines.push(`=================================`);
    lines.push(`    MERCI DE VOTRE VISITE !      `);
    lines.push(`=================================`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static" id="printable-receipt-modal">
      
      {/* Outer Card with controls on top */}
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-4 border border-slate-200 print:my-0 print:shadow-none print:rounded-none print:border-none print:bg-white" id="receipt-modal-inner">
        
        {/* Top Control Dashboard - HIDDEN WHEN PRINTING */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-orange/20 rounded-lg">
              <FileText size={16} className="text-brand-orange" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Générateur de Justificatif Client
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Facturation & encaissements réceptifs</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700">
              <button
                onClick={() => setReceiptFormat('A4')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  receiptFormat === 'A4' ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A4 Facture
              </button>
              <button
                onClick={() => setReceiptFormat('thermal')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  receiptFormat === 'thermal' ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ticket 80mm
              </button>
            </div>

            {/* Document Type toggle */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700">
              <button
                onClick={() => setDocumentType('standard')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  documentType === 'standard' ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setDocumentType('avoir')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  documentType === 'avoir' ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Avoir (Crédit)
              </button>
            </div>

            {/* Currency toggle */}
            <button
              onClick={() => setCurrency(prev => prev === 'XOF' ? 'EUR' : 'XOF')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
              title="Changer de devise"
            >
              <Globe size={11} className="text-slate-400" />
              <span>{currency}</span>
              <RefreshCw size={10} className="text-slate-500 animate-spin-hover" />
            </button>

            {/* Actions */}
            <button
              onClick={handleCopyRawText}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white p-1.5 rounded-lg border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Copier le texte brut (WhatsApp)"
            >
              {copied ? <ClipboardCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span className="hidden xs:inline">{copied ? 'Copié !' : 'Partager'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-brand-orange/10"
            >
              <Printer size={12} />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Sheet Body */}
        <div 
          className="flex-1 bg-white overflow-y-auto p-4 md:p-8 flex items-center justify-center print:p-0 print:overflow-visible print:bg-white"
          id="receipt-print-wrapper"
        >
          {/* Custom print styling scope */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #receipt-printable-area, #receipt-printable-area * {
                visibility: visible;
              }
              #receipt-printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              #printable-receipt-modal {
                position: absolute;
                background: white !important;
                padding: 0 !important;
              }
              #receipt-modal-inner {
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          `}} />

          {/* PRINTABLE CONTAINER */}
          <div 
            id="receipt-printable-area" 
            className={`bg-white transition-all text-slate-800 text-left font-sans ${
              receiptFormat === 'A4' 
                ? 'w-full max-w-2xl border border-slate-100 p-6 md:p-10 shadow-xs rounded-xl print:border-none print:shadow-none print:p-0' 
                : 'w-[320px] mx-auto border border-dashed border-slate-300 p-4 font-mono text-[11px] print:border-none'
            }`}
          >
            {receiptFormat === 'A4' ? (
              /* ========================================================= */
              /* A4 FACTURE CORPORATE LAYOUT                               */
              /* ========================================================= */
              <div className="space-y-6">
                
                {/* Header info */}
                <div className={`flex justify-between items-start ${
                  invoiceTemplate === 'classic' 
                    ? 'border-b-4 border-double border-slate-800 pb-4'
                    : invoiceTemplate === 'minimal'
                    ? 'border-b border-slate-900 pb-3'
                    : 'border-b border-slate-100 pb-6 bg-slate-50/50 p-4 rounded-xl'
                }`}>
                  <div className="space-y-1.5">
                    {invoiceShowLogo && (
                      <div className="mb-2">
                        {hotelLogo ? (
                          <img src={hotelLogo} alt="Logo" className="max-h-12 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className="font-sans font-black text-[10px] px-2 py-0.5 bg-brand-orange text-white rounded uppercase tracking-widest">
                              {hotelName.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <h1 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{hotelName}</h1>
                    <p className="text-[10px] text-slate-500 font-semibold leading-normal font-sans">
                      {hotelAddress}<br />
                      Tél: {hotelPhone}<br />
                      Email: {hotelEmail}<br />
                      Nom légal: {legalName} • NIF: 3024824H
                    </p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="flex flex-col items-end gap-1">
                      {documentType === 'avoir' ? (
                        <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                          Facture d'Avoir / Crédit
                        </span>
                      ) : payment ? (
                        <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                          Justificatif de Règlement
                        </span>
                      ) : (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs border ${
                          invoice.balance <= 0 
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                            : 'bg-amber-100 border-amber-200 text-amber-800'
                        }`}>
                          Facture {invoice.status}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xs font-black font-mono text-slate-900 mt-1.5 uppercase">
                      {documentType === 'avoir' 
                        ? `AVOIR-${invoice.invoice_number.substring(4)}` 
                        : payment 
                        ? `REÇU #${payment.id.substring(0, 10).toUpperCase()}` 
                        : invoice.invoice_number}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold font-sans">
                      Date d'émission : {payment ? payment.payment_date : invoice.issued_at}
                    </p>
                  </div>
                </div>

                {/* Info block - Guest & Reservation */}
                <div className={`grid grid-cols-2 gap-6 py-4 ${
                  invoiceTemplate === 'classic' 
                    ? 'border-b-2 border-slate-800'
                    : invoiceTemplate === 'minimal'
                    ? 'border-b border-slate-300'
                    : 'border-b border-slate-100'
                }`}>
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Facturé à (Client)</h4>
                    <div className="space-y-0.5 text-slate-600 font-semibold text-xs">
                      <p className="font-black text-slate-900 text-sm">{guest.first_name} {guest.last_name}</p>
                      <p>Tél: {guest.phone}</p>
                      <p>Email: {guest.email}</p>
                      <p>Addresse: {guest.address || 'Bouaké, Côte d\'Ivoire'}</p>
                      {invoiceShowIdDoc && guest.document_number && (
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase font-mono">
                          {guest.document_type || 'ID'} : {guest.document_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prestation hôtelière</h4>
                    {reservation ? (
                      <div className="space-y-0.5 text-slate-600 font-semibold text-xs text-right">
                        <p>Réservation : <span className="font-bold text-slate-800">{reservation.reservation_number}</span></p>
                        <p>Chambre attribuée : <span className="font-bold text-slate-800">N° {reservation.room_id.replace('room-', '')}</span></p>
                        <p>Dates : <span className="font-bold text-slate-800">{reservation.arrival_date} au {reservation.departure_date}</span></p>
                        <p>Nuitées : <span className="font-bold text-slate-800">{reservation.nights} nuit(s)</span></p>
                        <p>Occupants : <span className="font-bold text-slate-800">{reservation.adults} Adulte(s) {reservation.children > 0 && `• ${reservation.children} Enfant(s)`}</span></p>
                      </div>
                    ) : (
                      <div className="space-y-0.5 text-slate-600 font-semibold text-xs text-right">
                        <p>Référence Dossier: <span className="font-bold text-slate-800">#RES-{invoice.reservation_id.substring(4).toUpperCase()}</span></p>
                        <p>Prestations directes comptoir</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prestation Details Table */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Folio détaillé des charges hôtelières</h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={
                        invoiceTemplate === 'classic'
                          ? 'border-t-2 border-b-2 border-slate-800 text-slate-900 font-extrabold uppercase bg-slate-50'
                          : invoiceTemplate === 'minimal'
                          ? 'border-b-2 border-slate-900 text-slate-950 font-black uppercase bg-transparent'
                          : 'border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/60'
                      }>
                        <th className="py-2.5 px-3">Description Prestation</th>
                        <th className="py-2.5 px-3 text-center">Qté</th>
                        <th className="py-2.5 px-3 text-right">Tarif Unitaire</th>
                        <th className="py-2.5 px-3 text-right">TVA (18%)</th>
                        <th className="py-2.5 px-3 text-right">Total TTC</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-semibold text-slate-700 ${
                      invoiceTemplate === 'classic'
                        ? 'divide-slate-300'
                        : invoiceTemplate === 'minimal'
                        ? 'divide-slate-400'
                        : 'divide-slate-100'
                    }`}>
                      {invoiceItems.map((item) => {
                        const itemMult = documentType === 'avoir' ? -1 : 1;
                        return (
                          <tr key={item.id} className={invoiceTemplate === 'modern' ? 'hover:bg-slate-50/30' : ''}>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{item.description}</span>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-black font-mono">{item.item_type}</span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatAmount(item.unit_price * itemMult)}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-400">
                              {formatAmount((item.tax || Math.round(item.total * 0.18)) * itemMult)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatAmount(item.total * itemMult)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal, tax details and stamps */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-semibold ${
                  invoiceTemplate === 'classic'
                    ? 'border-t-2 border-slate-800'
                    : invoiceTemplate === 'minimal'
                    ? 'border-t-2 border-slate-900'
                    : 'border-t border-slate-100'
                }`}>
                  
                  {/* Payment Stamp or History */}
                  <div className="space-y-4">
                    {documentType === 'avoir' ? (
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <h4 className="text-[9px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Avoir Financier
                        </h4>
                        <p className="text-[10px] leading-relaxed font-medium text-amber-900">
                          Cet avoir de rectification commerciale sera imputé sur la comptabilité hôtelière pour le client {guest.first_name} {guest.last_name}.
                        </p>
                      </div>
                    ) : payment ? (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden">
                        {/* Stamp watermark */}
                        <div className="absolute -right-3 -bottom-3 rotate-12 opacity-10">
                          <CheckCircle size={80} className="text-emerald-800" />
                        </div>
                        <h4 className="text-[9px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Enregistrement de Règlement
                        </h4>
                        <div className="space-y-1 text-slate-600 font-medium text-[11px]">
                          <p className="flex justify-between">
                            <span>Montant versé :</span>
                            <span className="font-bold text-emerald-700 font-mono text-xs">{formatAmount(payment.amount)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Mode de paiement :</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              {getPaymentIcon(payment.payment_method)}
                              {payment.payment_method}
                            </span>
                          </p>
                          {payment.reference && (
                            <p className="flex justify-between">
                              <span>Référence :</span>
                              <span className="font-mono font-bold text-slate-500 text-[10px] truncate max-w-[150px]">{payment.reference}</span>
                            </p>
                          )}
                          <p className="flex justify-between">
                            <span>Caissier :</span>
                            <span className="font-bold text-slate-700">{payment.cashier_id === 'usr-admin' ? 'Amadou Koné' : 'Koffi G.'}</span>
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Dynamic Legal & Terms Notes */}
                    {invoiceShowNotes && (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mentions légales & Conditions</h4>
                        <p className="text-[10px] leading-relaxed font-medium text-slate-500 whitespace-pre-line font-sans">
                          {documentType === 'avoir' ? invoiceAvoirCustomNotes : invoiceCustomNotes}
                        </p>
                      </div>
                    )}

                    {/* Paid history */}
                    {documentType !== 'avoir' && !payment && invoice.paid > 0 && (
                      <div className="border border-slate-100 p-3 rounded-xl space-y-1 bg-slate-50/20 text-[11px]">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Historique des règlements</span>
                        <div className="flex justify-between text-slate-600">
                          <span>Acompte perçu :</span>
                          <span className="font-mono font-bold text-slate-800">{formatAmount(invoice.paid)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial calculation */}
                  <div className="space-y-2.5 text-slate-600 pl-0 md:pl-6">
                    <div className="flex justify-between text-slate-500">
                      <span>Sous-Total Hors Taxes (HT) :</span>
                      <span className="font-mono font-bold text-slate-700">{formatAmount(invoice.subtotal * (documentType === 'avoir' ? -1 : 1))}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-brand-orange font-bold">
                        <span>Remise commerciale accordée (-) :</span>
                        <span className="font-mono font-black">- {formatAmount(invoice.discount * (documentType === 'avoir' ? -1 : 1))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Montant des Taxes (TVA 18%) :</span>
                      <span className="font-mono font-bold text-slate-700">{formatAmount(invoice.tax * (documentType === 'avoir' ? -1 : 1))}</span>
                    </div>
                    <div className="h-px bg-slate-200"></div>
                    <div className="flex justify-between font-black text-slate-900 text-sm">
                      <span>Montant Total TTC :</span>
                      <span className="font-mono text-slate-950 text-base">{formatAmount(invoice.total * (documentType === 'avoir' ? -1 : 1))}</span>
                    </div>
                    
                    {documentType !== 'avoir' && (
                      <>
                        <div className="flex justify-between text-emerald-600">
                          <span>Montant cumulé réglé :</span>
                          <span className="font-mono font-bold">
                            {formatAmount(payment ? Math.max(invoice.paid, payment.amount) : invoice.paid)}
                          </span>
                        </div>
                        <div className="h-0.5 bg-slate-300"></div>
                      </>
                    )}
                    
                    {/* Final Balance Stamp */}
                    {(() => {
                      if (documentType === 'avoir') {
                        return (
                          <div className="flex justify-between p-2.5 rounded-lg border bg-brand-orange/5 border-brand-orange/10 text-brand-orange font-black text-center justify-center gap-2 items-center text-xs">
                            <FileText size={14} />
                            <span>AVOIR DE {formatAmount(invoice.total)} ENREGISTRÉ</span>
                          </div>
                        );
                      }

                      const balanceAfterCurrentPayment = payment 
                        ? Math.max(0, invoice.total - (invoice.paid + (payment.amount === invoice.paid ? 0 : payment.amount)))
                        : invoice.balance;

                      const isSettled = balanceAfterCurrentPayment <= 0 || invoice.status === 'Payée';

                      return (
                        <div className={`flex justify-between p-2.5 rounded-lg border ${
                          isSettled 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-black text-center justify-center gap-2 items-center text-xs' 
                            : 'bg-rose-50 border-rose-100 text-rose-700 font-black text-xs'
                        }`}>
                          {isSettled ? (
                            <>
                              <CheckCircle size={14} className="text-emerald-600" />
                              <span>FACTURE ENTIÈREMENT PAYÉE</span>
                            </>
                          ) : (
                            <>
                              <span>RESTE À PAYER (SOLDE) :</span>
                              <span className="font-mono">{formatAmount(balanceAfterCurrentPayment)}</span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bank details insertion */}
                {invoiceShowBankDetails && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">RIB & Coordonnées de Paiement</span>
                    <p className="text-[10px] font-mono leading-relaxed font-bold text-slate-600 whitespace-pre-line">
                      {invoiceBankDetails}
                    </p>
                  </div>
                )}

                {/* Signatures */}
                {invoiceShowSignatures && (
                  <div className="grid grid-cols-2 gap-6 pt-10 text-center text-[10px] text-slate-400 font-bold border-t border-slate-100 mt-6">
                    <div className="space-y-10">
                      <span className="block text-slate-500 uppercase tracking-wider">Le Caissier / Réceptionniste</span>
                      <div className="border-b border-dashed border-slate-300 mx-8"></div>
                      <p className="font-black text-slate-400">Signature & Cachet Officiel</p>
                    </div>
                    <div className="space-y-10">
                      <span className="block text-slate-500 uppercase tracking-wider">Le Client (Pour approbation)</span>
                      <div className="border-b border-dashed border-slate-300 mx-8"></div>
                      <p className="font-black text-slate-400">Nom & Signature</p>
                    </div>
                  </div>
                )}

                {/* Bottom polite text */}
                <div className="text-center pt-6 border-t border-slate-100 text-[9px] text-slate-400 font-extrabold leading-relaxed uppercase tracking-wider">
                  Merci de votre aimable confiance !<br />
                  Chaque instant de votre séjour à {hotelName} est un privilège pour nos équipes.
                </div>

              </div>
            ) : (
              /* ========================================================= */
              /* THERMAL PRINTER (80mm) TICKET LAYOUT                      */
              /* ========================================================= */
              <div className="space-y-4">
                
                {/* Compact Ticket Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-xs font-black uppercase tracking-tight">** HOTEL BRUNCH **</h1>
                  <p className="text-[9px] leading-normal">
                    QUARTIER COMMERCE, BOUAKE, CI<br />
                    TEL: +225 31 63 00 00<br />
                    RCCM: CI-BKE-2026-B-104
                  </p>
                  <p className="text-[10px] font-bold">--------------------------------</p>
                  <h2 className="text-[10px] font-black uppercase">
                    {payment ? '*** REÇU CAISSE ***' : '*** TICKET FACTURE ***'}
                  </h2>
                  <p className="text-[9px] font-mono font-bold">
                    N° {payment ? payment.id.substring(0, 10).toUpperCase() : invoice.invoice_number}
                  </p>
                  <p className="text-[9px] font-mono">
                    Date : {payment ? payment.payment_date : invoice.issued_at}
                  </p>
                </div>

                <div className="space-y-1 border-t border-b border-dashed border-slate-400 py-2">
                  <p className="flex justify-between"><span>CLIENT :</span> <span className="font-bold uppercase truncate max-w-[150px]">{guest.first_name} {guest.last_name}</span></p>
                  {reservation && (
                    <>
                      <p className="flex justify-between"><span>CHAMBRE :</span> <span className="font-bold">N° {reservation.room_id.replace('room-', '')}</span></p>
                      <p className="flex justify-between"><span>NUITEES :</span> <span>{reservation.nights} nuit(s)</span></p>
                    </>
                  )}
                  <p className="flex justify-between"><span>STATUT :</span> <span className="font-bold uppercase">{invoice.status}</span></p>
                </div>

                {/* Folio products */}
                <div className="space-y-1.5">
                  <p className="font-bold">PRESTATIONS DETAIL :</p>
                  {invoiceItems.map((item, idx) => (
                    <div key={item.id || idx} className="space-y-0.5">
                      <p className="font-bold text-[10px] uppercase">{item.description}</p>
                      <p className="flex justify-between font-mono pl-2 text-[10px]">
                        <span>{item.quantity} x {formatAmount(item.unit_price)}</span>
                        <span>{formatAmount(item.total)}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 font-semibold">
                  <p className="flex justify-between"><span>TOTAL BRUT HT :</span> <span className="font-mono">{formatAmount(invoice.subtotal)}</span></p>
                  {invoice.discount > 0 && (
                    <p className="flex justify-between text-slate-500"><span>REMISE (-) :</span> <span className="font-mono">-{formatAmount(invoice.discount)}</span></p>
                  )}
                  <p className="flex justify-between"><span>TAXES (TVA+SEJ) :</span> <span className="font-mono">{formatAmount(invoice.tax)}</span></p>
                  <div className="h-px bg-slate-300"></div>
                  <p className="flex justify-between font-black text-xs"><span>TOTAL TTC :</span> <span className="font-mono text-xs">{formatAmount(invoice.total)}</span></p>
                </div>

                {/* Cashier payment detailed block */}
                <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-[10px]">
                  {payment && (
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200 space-y-1 font-bold">
                      <p className="flex justify-between text-slate-800">
                        <span>REGLÉ CE JOUR :</span>
                        <span className="font-mono">{formatAmount(payment.amount)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>MODE REGLEMENT :</span>
                        <span>{payment.payment_method}</span>
                      </p>
                      {payment.reference && (
                        <p className="flex justify-between font-normal">
                          <span>REF :</span>
                          <span className="truncate max-w-[120px] font-mono text-[9px]">{payment.reference}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <p className="flex justify-between"><span>CUMUL DES REGLEMENTS :</span> <span className="font-mono font-bold">{formatAmount(invoice.paid)}</span></p>
                  {invoice.balance > 0 ? (
                    <p className="flex justify-between font-black text-rose-700 bg-rose-50 p-1 rounded">
                      <span>RESTE A PAYER :</span>
                      <span className="font-mono">{formatAmount(invoice.balance)}</span>
                    </p>
                  ) : (
                    <p className="text-center font-black text-emerald-700 bg-emerald-50 p-1 rounded uppercase tracking-wider">
                      *** FACTURE SOLDEE ***
                    </p>
                  )}
                </div>

                {/* Barcode representation */}
                <div className="text-center pt-3 space-y-1">
                  <div className="inline-block bg-[#111] text-white p-2 text-[9px] tracking-[4px] font-mono leading-none rounded uppercase">
                    |||||| {invoice.invoice_number.replace('-', '')} ||||||
                  </div>
                  <p className="text-[8px] text-slate-400 uppercase">Logiciel PMS - Hôtel Brunch</p>
                </div>

                <div className="text-center text-[9px] pt-2">
                  *** MERCI DE VOTRE VISITE ***<br />
                  A BIENTOT !
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
