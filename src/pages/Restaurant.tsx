/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Utensils, Plus, Check, Clock, Search, Coffee, CheckSquare, Coins, X } from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';
import { IMenuItem, IRestaurantOrder, IRoom } from '../types';
import { api } from '../utils/api';

export default function Restaurant() {
  // Menu items and orders are the real data, loaded from the API. Kitchen
  // tickets still display a fixed per-order dish preview below (there is no
  // order-line-items table in schema.sql to source a real breakdown from) —
  // only each order's status and totals are genuine.
  const [menus, setMenus] = useState<IMenuItem[]>([]);
  const [orders, setOrders] = useState<IRestaurantOrder[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // New menu form state
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Plats');
  const [newPrice, setNewPrice] = useState(5000);
  const [newDesc, setNewDesc] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [menuData, orderData, roomsData] = await Promise.all([
        api.getMenuItems(),
        api.getRestaurantOrders(),
        api.getRooms()
      ]);
      setMenus(menuData);
      setOrders(orderData);
      setRooms(roomsData);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de charger les données du restaurant.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await api.createMenuItem({
        category_id: newCat,
        name: newName,
        description: newDesc,
        selling_price: newPrice
      });
      setShowAddMenu(false);
      setNewName('');
      setNewDesc('');
      setErrorMsg('');
      setSuccessMsg(`Le produit "${newName}" a été ajouté au menu.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Échec de l'ajout de l'article au menu.");
    }
  };

  const updateOrderStatus = async (id: string, newStatus: 'En préparation' | 'Servie' | 'Facturée' | 'Annulée') => {
    try {
      await api.updateRestaurantOrderStatus(id, newStatus);
      setErrorMsg('');
      setSuccessMsg(`Commande mise à jour : ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Échec de la mise à jour de la commande.");
    }
  };

  const toggleMenuAvailability = async (id: string) => {
    const item = menus.find(m => m.id === id);
    if (!item) return;
    try {
      await api.updateMenuItem(id, { available: !item.available });
      setErrorMsg('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Échec de la mise à jour de la disponibilité.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Restauration & Brunch"
        description="Gérer la carte numérique des plats, boissons et formules brunch, et suivre les bons de commandes en cuisine."
        actionButton={{
          label: 'Ajouter au Menu',
          onClick: () => setShowAddMenu(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {errorMsg && (
          <AlertBanner text={errorMsg} type="error" />
        )}
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}
        {isLoading && (
          <AlertBanner text="Chargement du menu et des commandes..." type="info" />
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Commandes actives</span>
            <span className="text-2xl font-extrabold text-brand-orange block mt-1">{orders.filter(o => o.status !== 'Facturée' && o.status !== 'Annulée').length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chiffre d'affaires Resto (Commandes facturées)</span>
            <span className="text-2xl font-extrabold text-slate-700 block mt-1">
              {orders.filter(o => o.status === 'Facturée').reduce((sum, o) => sum + o.total, 0).toLocaleString()} XOF
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Articles au Menu</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{menus.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* MENU ITEMS LIST (Col-span 2) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Carte numérique du restaurant</h3>
              <p className="text-[10px] text-slate-400">Activer/désactiver la vente en direct des plats du Brunch</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menus.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex justify-between space-x-4 bg-slate-50/20">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400"><Coffee size={14} /></span>
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 h-7">{item.description}</p>
                    <span className="text-xs font-black text-brand-orange block mt-2">{item.selling_price.toLocaleString()} XOF</span>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end flex-shrink-0">
                    <span className="text-[9px] text-[#A1A5B7] font-bold uppercase">{item.category_id}</span>
                    <button
                      onClick={() => toggleMenuAvailability(item.id)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        item.available 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {item.available ? 'En vente' : 'Épuisé'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE KITCHEN TICKETS (Col-span 1) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Clock size={16} className="text-brand-orange" />
                <span>Bons de commande en cuisine</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Flux de préparation en temps réel</p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {orders.map((o) => (
                <div key={o.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Bon #{o.order_number}</span>
                    <span className="font-mono text-slate-400 font-medium">{o.created_at.split(' ')[1]}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium space-y-0.5">
                    {/* No order-line-items table exists yet (see schema.sql),
                        so the dish-by-dish breakdown isn't available here —
                        only the order's real status and total below are. */}
                    <p className="italic text-slate-400">Détail des articles non disponible</p>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Chambre : {o.room_id ? (rooms.find(r => r.id === o.room_id)?.room_number || o.room_id) : 'Client Ext.'}
                    </span>
                    <span className="text-xs font-black text-brand-orange">{o.total.toLocaleString()} XOF</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end space-x-1 pt-1.5 border-t border-slate-200">
                    {o.status === 'En attente' && (
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'En préparation')}
                        className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-[9px] px-2 py-0.5 rounded"
                      >
                        Lancer Cuisine
                      </button>
                    )}
                    {o.status === 'En préparation' && (
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'Servie')}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-[9px] px-2 py-0.5 rounded"
                      >
                        Marquer Servie
                      </button>
                    )}
                    {o.status === 'Servie' && (
                      <button 
                        onClick={() => updateOrderStatus(o.id, 'Facturée')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded flex items-center space-x-1"
                      >
                        <Check size={8} />
                        <span>Facturer</span>
                      </button>
                    )}
                    {(o.status === 'Facturée' || o.status === 'Annulée') && (
                      <span className="text-[9px] text-[#A1A5B7] font-bold uppercase py-0.5">{o.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ADD MENU DIALOG OVERLAY */}
        {showAddMenu && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Ajouter un produit à la carte</h3>
                <button onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMenu} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Nom du plat ou boisson</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kedjenou de pintade..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Catégorie</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      <option value="Plats">Plats de résistance</option>
                      <option value="Accompagnements">Accompagnements</option>
                      <option value="Boissons">Boissons fraîches/chaudes</option>
                      <option value="Brunch">Brunch & Desserts</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Prix de vente (XOF)</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Description (ingrédients, allergènes...)</label>
                  <textarea
                    rows={2}
                    placeholder="Descriptif pour le serveur..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover"
                  >
                    Valider l'article
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
