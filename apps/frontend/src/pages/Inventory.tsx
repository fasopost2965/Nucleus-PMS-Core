/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Boxes, Plus, Search, HelpCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, Home } from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';
import { mockStockItems, mockSuppliers } from '../mockData';
import { IStockItem } from '../types';

export default function Inventory() {
  const [stock, setStock] = useState<IStockItem[]>(mockStockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAdjModal, setShowAdjModal] = useState(false);

  // Adjustment states
  const [selectedItemId, setSelectedItemId] = useState('stk-3'); // sheets has low stock!
  const [adjType, setAdjType] = useState<'in' | 'out'>('in');
  const [adjQty, setAdjAmt] = useState(15);

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    setStock(stock.map(item => {
      if (item.id === selectedItemId) {
        const delta = adjType === 'in' ? adjQty : -adjQty;
        return {
          ...item,
          current_stock: Math.max(0, item.current_stock + delta)
        };
      }
      return item;
    }));

    setShowAdjModal(false);
    setSuccessMsg(`Ajustement de stock enregistré avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getSupplierName = (id: string) => {
    return mockSuppliers.find(s => s.id === id)?.company_name || 'SOCOCE';
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion des Stocks & Épicerie"
        description="Suivre l'inventaire en temps réel des consommables hôteliers (draps, eau, boissons, savon) et des approvisionnements fournisseurs."
        actionButton={{
          label: 'Ajuster les Stocks',
          onClick: () => setShowAdjModal(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valeur estimée du stock</span>
            <span className="text-2xl font-extrabold text-brand-orange block mt-1">1 240 000 FCFA</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Produits sous seuil d'alerte</span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1">1</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fournisseurs Enregistrés</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{mockSuppliers.length}</span>
          </div>
        </div>

        {/* INVENTORY REGISTER TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Registre des articles en stock</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Rechercher par article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
              />
              <Search className="absolute left-3 top-2 text-slate-400" size={12} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">SKU</th>
                  <th className="py-3 px-4">Nom de l'article</th>
                  <th className="py-3 px-4">Famille</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4 text-right">Prix d'achat</th>
                  <th className="py-3 px-4 text-center">Unité</th>
                  <th className="py-3 px-4 text-center">Quantité actuelle</th>
                  <th className="py-3 px-4 text-center">Seuil mini</th>
                  <th className="py-3 px-6 text-right">Alerte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stock
                  .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.includes(searchQuery))
                  .map((item) => {
                    const isLow = item.current_stock < item.minimum_stock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-500">{item.sku}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">{item.category_id}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">{getSupplierName(item.supplier_id)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold">{(item.purchase_price).toLocaleString()} XOF</td>
                        <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{item.unit}</td>
                        <td className={`py-3.5 px-4 text-center font-black text-sm font-mono ${isLow ? 'text-red-600 bg-red-50/30' : 'text-slate-800'}`}>{item.current_stock}</td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-bold font-mono">{item.minimum_stock}</td>
                        <td className="py-3.5 px-6 text-right">
                          {isLow ? (
                            <Badge label="Seuil franchi" type="default" status="critique" />
                          ) : (
                            <Badge label="Normal" type="default" status="libre" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUPPLIERS DIRECTORY DISPLAY */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Fournisseurs Agrées (Bouaké)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockSuppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/20">
                <h4 className="font-extrabold text-xs text-slate-900">{s.company_name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Contact : {s.contact_name}</p>
                <div className="mt-3 text-[10px] text-slate-600 space-y-1">
                  <p>Tél : <span className="font-mono">{s.phone}</span></p>
                  <p>Email : <span className="font-mono">{s.email}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADJUST DIALOG MODAL */}
        {showAdjModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Ajuster les stocks</h3>
                <button onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Sélectionner l'article</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  >
                    {stock.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (Stock actuel: {item.current_stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Type de mouvement</label>
                    <select
                      value={adjType}
                      onChange={(e) => setAdjType(e.target.value as 'in' | 'out')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      <option value="in">Entrée (+) / Livraison</option>
                      <option value="out">Sortie (-) / Consommation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Quantité</label>
                    <input
                      type="number"
                      required
                      value={adjQty}
                      onChange={(e) => setAdjAmt(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjModal(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover"
                  >
                    Enregistrer le mouvement
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
