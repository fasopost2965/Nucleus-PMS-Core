/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Bed, Plus, CheckCircle, Users, Sparkles, Wrench, X, ShieldAlert } from 'lucide-react';
import { PageHeader, AlertBanner } from '../components/ui/pms-ui';
import {
  mockRooms,
  mockRoomCategories,
  mockAmenities,
  mockReservations,
  mockGuests,
  mockHousekeepingTasks,
  mockMaintenanceTickets
} from '../mockData';
import { IRoom, IRoomCategory, IAmenity, TRoomStatus } from '../types';
import { calculateRoomStatus } from '../components/rooms/roomUtils';

// Modular Component Imports
import RoomFilters from '../components/rooms/RoomFilters';
import RoomCard from '../components/rooms/RoomCard';
import RoomTable from '../components/rooms/RoomTable';
import RoomForm from '../components/rooms/RoomForm';
import RoomDetailsDrawer from '../components/rooms/RoomDetailsDrawer';

export default function Rooms() {
  // Operational states loaded into React state for REST API readiness
  const [rooms, setRooms] = useState<IRoom[]>(mockRooms);
  const [categories, setCategories] = useState<IRoomCategory[]>(mockRoomCategories);
  const [amenities, setAmenities] = useState<IAmenity[]>(mockAmenities);
  const [reservations, setReservations] = useState(mockReservations);
  const [guests, setGuests] = useState(mockGuests);
  const [housekeepingTasks, setHousekeepingTasks] = useState(mockHousekeepingTasks);
  const [maintenanceTickets, setMaintenanceTickets] = useState(mockMaintenanceTickets);

  // Filter & Layout States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedAmenity, setSelectedAmenity] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Interface & Drawer states
  const [successMsg, setSuccessMsg] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [viewingRoom, setViewingRoom] = useState<IRoom | null>(null);

  // 1. Dynamic derivation of available floors for filters
  const availableFloors = useMemo(() => {
    const floorsSet = new Set(rooms.map(r => r.floor));
    return Array.from(floorsSet).sort();
  }, [rooms]);

  // 2. Real-time dynamic calculation of operational display statuses for ALL rooms
  const roomCalculatedStatuses = useMemo(() => {
    const statuses: Record<string, TRoomStatus> = {};
    rooms.forEach(room => {
      statuses[room.id] = calculateRoomStatus(
        room,
        reservations,
        housekeepingTasks,
        maintenanceTickets
      );
    });
    return statuses;
  }, [rooms, reservations, housekeepingTasks, maintenanceTickets]);

  // 3. Filtering logic applied to the list
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Search term matching (number, bed type, or notes)
      const matchesSearch = 
        room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.bed_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.notes && room.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category match
      const matchesCategory = selectedCategory === 'all' || room.category_id === selectedCategory;
      
      // Dynamic status match
      const currentStatus = roomCalculatedStatuses[room.id];
      const matchesStatus = selectedStatus === 'all' || currentStatus === selectedStatus;
      
      // Floor match
      const matchesFloor = selectedFloor === 'all' || room.floor === selectedFloor;
      
      // Specific Amenity match
      const matchesAmenity = selectedAmenity === 'all' || room.amenities.includes(selectedAmenity);
      
      // Active state match
      const matchesActive = 
        activeFilter === 'all' || 
        (activeFilter === 'active' && room.active) || 
        (activeFilter === 'inactive' && !room.active);

      return matchesSearch && matchesCategory && matchesStatus && matchesFloor && matchesAmenity && matchesActive;
    });
  }, [rooms, searchQuery, selectedCategory, selectedStatus, selectedFloor, selectedAmenity, activeFilter, roomCalculatedStatuses]);

  // 4. Dynamic KPI statistics generation
  const kpis = useMemo(() => {
    let total = rooms.length;
    let available = 0;
    let occupied = 0;
    let cleaning = 0;
    let maintenance = 0;

    rooms.forEach(room => {
      const status = roomCalculatedStatuses[room.id];
      if (status === 'Disponible') available++;
      else if (status === 'Occupée') occupied++;
      else if (status === 'Nettoyage') cleaning++;
      else if (status === 'Maintenance' || status === 'Hors service') maintenance++;
    });

    return { total, available, occupied, cleaning, maintenance };
  }, [rooms, roomCalculatedStatuses]);

  // Create or Update Room Handler
  const handleSaveRoom = (formData: Partial<IRoom>) => {
    if (editingRoom) {
      // Editing
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? {
        ...r,
        ...formData,
        updated_at: new Date().toISOString(),
        updated_by: 'Administrateur'
      } as IRoom : r));

      setSuccessMsg(`La chambre ${formData.room_number} a été modifiée avec succès.`);
    } else {
      // Creating new
      if (rooms.some(r => r.room_number === formData.room_number)) {
        alert('Une chambre avec ce numéro existe déjà !');
        return;
      }

      const newRoom: IRoom = {
        id: `room-${Date.now()}`,
        room_number: formData.room_number!,
        category_id: formData.category_id!,
        floor: formData.floor!,
        capacity: formData.capacity!,
        bed_type: formData.bed_type!,
        area: formData.area!,
        base_price: formData.base_price!,
        amenities: formData.amenities || [],
        notes: formData.notes,
        active: formData.active !== undefined ? formData.active : true,
        prices: formData.prices || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'Administrateur',
        updated_by: 'Administrateur'
      };

      setRooms(prev => [...prev, newRoom]);
      setSuccessMsg(`La chambre ${newRoom.room_number} a été ajoutée au référentiel.`);
    }

    // Reset modals
    setShowFormModal(false);
    setEditingRoom(null);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Toggle Room Active State
  const handleToggleActive = (room: IRoom) => {
    setRooms(prev => prev.map(r => r.id === room.id ? {
      ...r,
      active: !r.active,
      updated_at: new Date().toISOString(),
      updated_by: 'Administrateur'
    } : r));

    const newState = !room.active ? 'activée' : 'désactivée';
    setSuccessMsg(`La chambre ${room.room_number} a été ${newState} avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Delete Room
  const handleDeleteRoom = (room: IRoom) => {
    const isOccupied = roomCalculatedStatuses[room.id] === 'Occupée';
    if (isOccupied) {
      alert(`Impossible de supprimer la chambre ${room.room_number} car elle est actuellement occupée par un client.`);
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer la chambre ${room.room_number} du référentiel ? Cette action est irréversible.`)) {
      setRooms(prev => prev.filter(r => r.id !== room.id));
      setSuccessMsg(`La chambre ${room.room_number} a été retirée du référentiel.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50" id="rooms-module-root">
      
      {/* HEADER ROW */}
      <PageHeader
        title="Gestion des Chambres"
        description="Fiche d'identité et caractéristiques permanentes des chambres physiques de l'hôtel. Les statuts opérationnels sont déduits dynamiquement."
        actionButton={{
          label: 'Nouvelle Chambre',
          onClick: () => {
            setEditingRoom(null);
            setShowFormModal(true);
          },
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* SECTION 1: DYNAMIC STATS BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="rooms-statistics-grid">
          
          {/* Card 1: Total */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
              <Bed size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Chambres</span>
              <span className="text-xl font-black text-slate-900 leading-none">{kpis.total}</span>
            </div>
          </div>

          {/* Card 2: Available */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Disponibles</span>
              <span className="text-xl font-black text-emerald-600 leading-none">{kpis.available}</span>
            </div>
          </div>

          {/* Card 3: Occupied */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Occupées</span>
              <span className="text-xl font-black text-rose-600 leading-none">{kpis.occupied}</span>
            </div>
          </div>

          {/* Card 4: Cleaning */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-left">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">À Nettoyer</span>
              <span className="text-xl font-black text-indigo-600 leading-none">{kpis.cleaning}</span>
            </div>
          </div>

          {/* Card 5: Maintenance / OOS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-left col-span-2 md:col-span-1">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Wrench size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Maintenance / HS</span>
              <span className="text-xl font-black text-amber-600 leading-none">{kpis.maintenance}</span>
            </div>
          </div>

        </div>

        {/* SECTION 2: ROOM CATEGORIES GLANCE CARD LIST */}
        <div className="space-y-3 text-left">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Catégories standards de nuit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              // Count rooms in this category
              const count = rooms.filter(r => r.category_id === cat.id).length;
              
              // Map colors
              const accentColors: Record<string, string> = {
                emerald: 'bg-emerald-500',
                blue: 'bg-blue-500',
                indigo: 'bg-indigo-500',
                amber: 'bg-amber-500',
                rose: 'bg-rose-500'
              };

              return (
                <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${accentColors[cat.color] || 'bg-slate-400'}`}></div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {count} {count > 1 ? 'chambres' : 'chambre'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 h-7 leading-normal">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex justify-between items-baseline pt-2 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold">Max {cat.max_capacity} pax</span>
                    <span className="text-xs font-black text-slate-900 font-mono">
                      {cat.default_price.toLocaleString()} XOF
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: MULTI-CRITERIA FILTERS */}
        <RoomFilters
          categories={categories}
          amenities={amenities}
          floors={availableFloors}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
          selectedAmenity={selectedAmenity}
          setSelectedAmenity={setSelectedAmenity}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* SECTION 4: RENDERED LIST VIEW */}
        <div id="rooms-list-rendered-container">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="rooms-grid-layout">
              {filteredRooms.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
                  Aucune chambre ne correspond à vos filtres actuels.
                </div>
              ) : (
                filteredRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    category={categories.find(c => c.id === room.category_id)}
                    calculatedStatus={roomCalculatedStatuses[room.id] || 'Disponible'}
                    amenities={amenities}
                    onView={(r) => setViewingRoom(r)}
                    onEdit={(r) => {
                      setEditingRoom(r);
                      setShowFormModal(true);
                    }}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteRoom}
                  />
                ))
              )}
            </div>
          ) : (
            <RoomTable
              rooms={filteredRooms}
              categories={categories}
              amenities={amenities}
              calculatedStatuses={roomCalculatedStatuses}
              onView={(r) => setViewingRoom(r)}
              onEdit={(r) => {
                setEditingRoom(r);
                setShowFormModal(true);
              }}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteRoom}
            />
          )}
        </div>

      </div>

      {/* FORM MODAL PANEL (CREATION & EDITION) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="room-form-modal-container">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  {editingRoom ? `Modifier la Chambre ${editingRoom.room_number}` : 'Nouvelle Chambre'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {editingRoom ? 'Modification de la fiche technique permanente.' : 'Ajout d\'une nouvelle entité physique au référentiel.'}
                </p>
              </div>
              <button
                id="close-form-modal-btn"
                onClick={() => {
                  setShowFormModal(false);
                  setEditingRoom(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <RoomForm
                room={editingRoom || undefined}
                categories={categories}
                amenities={amenities}
                onSave={handleSaveRoom}
                onCancel={() => {
                  setShowFormModal(false);
                  setEditingRoom(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SPECIFICATIONS DRAWER PANEL */}
      {viewingRoom && (
        <RoomDetailsDrawer
          room={viewingRoom}
          category={categories.find(c => c.id === viewingRoom.category_id)}
          calculatedStatus={roomCalculatedStatuses[viewingRoom.id] || 'Disponible'}
          amenities={amenities}
          reservations={reservations}
          guests={guests}
          housekeepingTasks={housekeepingTasks}
          maintenanceTickets={maintenanceTickets}
          onClose={() => setViewingRoom(null)}
          onEdit={(r) => {
            setViewingRoom(null);
            setEditingRoom(r);
            setShowFormModal(true);
          }}
        />
      )}

    </div>
  );
}
