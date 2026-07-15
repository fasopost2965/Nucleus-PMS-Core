/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coins, Plus, Search, FileText, TrendingUp, Receipt, ArrowDownCircle, ShieldCheck, Printer, Trash2 } from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';
import { mockInvoices, mockPayments, mockGuests, mockInvoiceItems, mockReservations } from '../mockData';
import { IInvoice, IPayment, IInvoiceItem, IGuest, IReservation } from '../types';
import PrintableReceipt from '../components/ui/PrintableReceipt';

export default function Finance() {
  const [invoices, setInvoices] = useState<IInvoice[]>(mockInvoices);
  const [payments, setPayments] = useState<IPayment[]>(mockPayments);
  const [guests, setGuests] = useState<IGuest[]>(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockGuests;
  });
  const [reservations, setReservations] = useState<IReservation[]>(() => {
    const stored = localStorage.getItem('pms_reservations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockReservations;
  });
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payments' | 'expenses' | 'caisse'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);

  const [currency, setCurrency] = useState<'XOF' | 'EUR'>(() => {
    return (localStorage.getItem('pms_currency') as 'XOF' | 'EUR') || 'XOF';
  });

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency((localStorage.getItem('pms_currency') as 'XOF' | 'EUR') || 'XOF');
    };
    window.addEventListener('pms-currency-changed', handleCurrencyChange);
    return () => window.removeEventListener('pms-currency-changed', handleCurrencyChange);
  }, []);

  const formatAmount = (xofAmount: number) => {
    if (currency === 'EUR') {
      const eurAmount = xofAmount / 655.957;
      return `${eurAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    return `${xofAmount.toLocaleString('fr-FR')} XOF`;
  };

  // New simulated expense state
  const [expenses, setExpenses] = useState([
    { id: 'exp-1', reference: 'DEP-2026-001', category: 'Fournitures', amount: 12500, date: '2026-07-12', user: 'Amadou' },
    { id: 'exp-2', reference: 'DEP-2026-002', category: 'Carburant', amount: 25000, date: '2026-07-11', user: 'Abdoulaye' },
  ]);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expCat, setExpCat] = useState('Fournitures');
  const [expAmt, setExpAmt] = useState(5000);
  const [expDesc, setExpDesc] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = {
      id: `exp-${Date.now()}`,
      reference: `DEP-2026-00${expenses.length + 1}`,
      category: expCat,
      amount: expAmt,
      date: new Date().toISOString().split('T')[0],
      user: 'Amadou'
    };
    setExpenses([newExp, ...expenses]);
    setShowAddExpense(false);
    setSuccessMsg(`Dépense de ${formatAmount(expAmt)} enregistrée.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getGuestName = (guestId: string) => {
    const g = guests.find(guest => guest.id === guestId);
    return g ? `${g.first_name} ${g.last_name}` : 'Client externe';
  };

  const registerInvoicePayment = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return;

    if (inv.balance <= 0) {
      alert('Cette facture est déjà entièrement réglée !');
      return;
    }

    const payAmt = inv.balance;
    const updatedInvoices = invoices.map(i => {
      if (i.id === invId) {
        return { ...i, paid: i.total, balance: 0, status: 'Payée' as const };
      }
      return i;
    });

    const newPayment: IPayment = {
      id: `pay-${Date.now()}`,
      invoice_id: invId,
      reservation_id: inv.reservation_id,
      payment_method: 'Espèces',
      amount: payAmt,
      reference: `Simulé-EPOS-${Math.floor(Math.random() * 10000)}`,
      payment_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      cashier_id: 'usr-admin',
      status: 'Validé'
    };

    setInvoices(updatedInvoices);
    setPayments([newPayment, ...payments]);
    setSuccessMsg(`Encaissement de ${formatAmount(payAmt)} validé pour la facture ${inv.invoice_number}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Module Finance"
        description="Gérer le suivi comptable, enregistrer les règlements de factures, suivre les dépenses d'exploitation et vérifier la caisse."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* FINANCIAL SUMMARY KEY FIGURES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Chiffre d'Affaires du jour"
            value={formatAmount(770000)}
            change="+14.2%"
            changeType="increase"
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Encaissements validés"
            value={formatAmount(385000)}
            change="Sécurisé"
            changeType="neutral"
            icon={ShieldCheck}
            color="green"
          />
          <StatCard
            title="Taxes locales collectées (TVA/Séjour)"
            value={formatAmount(72000)}
            change="+5.1%"
            changeType="increase"
            icon={Receipt}
            color="blue"
          />
        </div>

        {/* SUB NAVIGATION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeSubTab === 'invoices' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Factures émise (Invoices)
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeSubTab === 'payments' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Règlements & Encaissements
            </button>
            <button
              onClick={() => setActiveSubTab('expenses')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeSubTab === 'expenses' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Dépenses courantes
            </button>
            <button
              onClick={() => setActiveSubTab('caisse')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeSubTab === 'caisse' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Caisse (Cash Register)
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
          </div>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          
          {activeSubTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">N° Facture</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Date d'émission</th>
                    <th className="py-3 px-4 text-right">Total HT</th>
                    <th className="py-3 px-4 text-right">Taxes</th>
                    <th className="py-3 px-4 text-right">Total TTC</th>
                    <th className="py-3 px-4 text-right">Reste à payer</th>
                    <th className="py-3 px-4">État</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices
                    .filter(i => i.invoice_number.includes(searchQuery) || getGuestName(i.guest_id).toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-brand-orange hover:underline cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                          {inv.invoice_number}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{getGuestName(inv.guest_id)}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{inv.issued_at}</td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-slate-600">{formatAmount(inv.subtotal)}</td>
                        <td className="py-3.5 px-4 text-right font-medium font-mono text-slate-500">{formatAmount(inv.tax)}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold font-mono text-slate-900">{formatAmount(inv.total)}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-rose-600">{formatAmount(inv.balance)}</td>
                        <td className="py-3.5 px-4">
                          <Badge label={inv.status} type="invoice" status={inv.status} />
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-1">
                          {inv.balance > 0 && (
                            <button
                              onClick={() => registerInvoicePayment(inv.id)}
                              className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[10px] font-bold px-2 py-0.5 rounded"
                            >
                              Encaisser
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="text-slate-400 hover:text-brand-orange hover:bg-slate-50 inline-block p-1.5 rounded transition-colors"
                            title="Imprimer / Visualiser"
                          >
                            <Printer size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSubTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">Réf Paiement</th>
                    <th className="py-3 px-4">Moyen de règlement</th>
                    <th className="py-3 px-4">Date de transaction</th>
                    <th className="py-3 px-4">Référence banque/mobile</th>
                    <th className="py-3 px-4 text-right">Montant encaissé</th>
                    <th className="py-3 px-4">Caissier</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments
                    .filter(p => p.reference?.includes(searchQuery) || p.payment_method.includes(searchQuery))
                    .map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{pay.id.substring(0, 10)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{pay.payment_method}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">{pay.payment_date}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono font-medium">{pay.reference || '-'}</td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-600">{formatAmount(pay.amount)}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-500">{pay.cashier_id === 'usr-admin' ? 'Amadou Koné' : 'Koffi Germain'}</td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => setSelectedPayment(pay)}
                            className="text-slate-400 hover:text-brand-orange hover:bg-slate-50 inline-block p-1.5 rounded transition-colors"
                            title="Imprimer le reçu de paiement"
                          >
                            <Printer size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSubTab === 'expenses' && (
            <div className="space-y-4 p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Dépenses d'exploitation du jour</h3>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5"
                >
                  <Plus size={12} />
                  <span>Ajouter une dépense</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50">
                      <th className="py-2.5 px-4">Référence</th>
                      <th className="py-2.5 px-4">Catégorie</th>
                      <th className="py-2.5 px-4">Date de saisie</th>
                      <th className="py-2.5 px-4">Auteur</th>
                      <th className="py-2.5 px-4 text-right">Montant</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{e.reference}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{e.category}</td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">{e.date}</td>
                        <td className="py-3 px-4 text-slate-500 font-semibold">{e.user}</td>
                        <td className="py-3 px-4 text-right font-black font-mono text-rose-600">{formatAmount(e.amount)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpenses(expenses.filter(ex => ex.id !== e.id))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'caisse' && (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-800 flex justify-between items-center">
                <span>Statut de la Caisse : OUVERTE</span>
                <span>Responsable de caisse : Amadou Koné</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                  <h4 className="font-extrabold text-slate-800">Caisse du jour</h4>
                  <div className="space-y-1.5 text-slate-600 font-semibold">
                    <p className="flex justify-between"><span>Solde d'ouverture (08:00) :</span> <span className="font-mono text-slate-800">{formatAmount(150000)}</span></p>
                    <p className="flex justify-between text-emerald-600"><span>Encaissements espèces (+) :</span> <span className="font-mono">+ {formatAmount(50000)}</span></p>
                    <p className="flex justify-between text-rose-600"><span>Dépenses espèces (-) :</span> <span className="font-mono">- {formatAmount(37500)}</span></p>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <p className="flex justify-between font-bold text-sm text-slate-900"><span>Solde théorique actuel :</span> <span className="font-mono">{formatAmount(162500)}</span></p>
                  </div>
                </div>

                <div className="p-5 border border-slate-200 rounded-xl flex flex-col justify-center items-center text-center space-y-3">
                  <Coins size={28} className="text-brand-orange" />
                  <div>
                    <h4 className="font-bold text-slate-800">Clôture de Caisse</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Simuler la clôture journalière de la caisse pour le transfert comptable.</p>
                  </div>
                  <button 
                    onClick={() => {
                      alert('Rapport de caisse journalier clôturé et imprimé sans erreur.');
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Clôturer la journée
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* EXPENSE DIALOG POPUP */}
        {showAddExpense && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Ajouter une dépense d'exploitation</h3>
                <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Catégorie de dépense</label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  >
                    <option value="Fournitures">Fournitures hôtelières</option>
                    <option value="Carburant">Carburant générateur</option>
                    <option value="Maintenance">Maintenance plomberie/climatisation</option>
                    <option value="Achats restaurant">Achats frais restaurant</option>
                    <option value="Divers">Divers d'exploitation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Montant de la dépense (XOF)</label>
                  <input
                    type="number"
                    required
                    value={expAmt}
                    onChange={(e) => setExpAmt(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Notes / Motif</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Achat de 10 litres de gasoil..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover"
                  >
                    Valider la dépense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRINTABLE RECEIPT MODAL INTEGRATION */}
        {selectedInvoice && (() => {
          const guest = guests.find(g => g.id === selectedInvoice.guest_id) || {
            id: selectedInvoice.guest_id,
            first_name: 'Client',
            last_name: 'externe',
            phone: '',
            email: '',
            vip: false,
            blacklist: false,
          } as IGuest;
          const reservation = reservations.find(r => r.id === selectedInvoice.reservation_id);
          return (
            <PrintableReceipt
              invoice={selectedInvoice}
              guest={guest}
              reservation={reservation}
              onClose={() => setSelectedInvoice(null)}
              defaultCurrency={currency}
            />
          );
        })()}

        {selectedPayment && (() => {
          const inv = invoices.find(i => i.id === selectedPayment.invoice_id) || {
            id: selectedPayment.invoice_id,
            invoice_number: 'FACT-TEMP',
            reservation_id: selectedPayment.reservation_id,
            guest_id: 'unknown',
            subtotal: selectedPayment.amount,
            discount: 0,
            tax: 0,
            total: selectedPayment.amount,
            paid: selectedPayment.amount,
            balance: 0,
            status: 'Payée',
            issued_at: selectedPayment.payment_date
          } as IInvoice;
          
          const guest = guests.find(g => g.id === inv.guest_id) || {
            id: inv.guest_id,
            first_name: 'Client',
            last_name: 'Externe',
            phone: '',
            email: '',
            vip: false,
            blacklist: false,
          } as IGuest;
          
          const reservation = reservations.find(r => r.id === selectedPayment.reservation_id);
          return (
            <PrintableReceipt
              invoice={inv}
              payment={selectedPayment}
              guest={guest}
              reservation={reservation}
              onClose={() => setSelectedPayment(null)}
              defaultCurrency={currency}
            />
          );
        })()}

      </div>
    </div>
  );
}

// Reuse X
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
