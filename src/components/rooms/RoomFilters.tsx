import React, { useState } from 'react';
import { Search, Filter, Grid, List, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { IRoomCategory, IAmenity, TRoomStatus } from '../../types';

interface RoomFiltersProps {
  categories: IRoomCategory[];
  amenities: IAmenity[];
  floors: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedFloor: string;
  setSelectedFloor: (f: string) => void;
  selectedAmenity: string;
  setSelectedAmenity: (a: string) => void;
  activeFilter: 'all' | 'active' | 'inactive';
  setActiveFilter: (v: 'all' | 'active' | 'inactive') => void;
  viewMode: 'grid' | 'table';
  setViewMode: (m: 'grid' | 'table') => void;
}

export default function RoomFilters({
  categories,
  amenities,
  floors,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedFloor,
  setSelectedFloor,
  selectedAmenity,
  setSelectedAmenity,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode
}: RoomFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedFloor('all');
    setSelectedAmenity('all');
    setActiveFilter('all');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCategory !== 'all' || 
    selectedStatus !== 'all' || 
    selectedFloor !== 'all' || 
    selectedAmenity !== 'all' || 
    activeFilter !== 'all';

  const statuses: TRoomStatus[] = ['Disponible', 'Occupée', 'Réservée', 'Nettoyage', 'Maintenance', 'Hors service'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4 text-left" id="rooms-filters-container">
      {/* Search and Primary Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            id="search-rooms-input"
            type="text"
            placeholder="Rechercher par N° chambre, type de lit, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 text-xs text-slate-800 rounded-lg border border-slate-200 focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 focus:outline-none transition-all duration-200"
          />
          <Search className="absolute left-3 top-3 text-slate-400" size={14} />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Catégorie:</span>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-orange transition-all duration-200"
            >
              <option value="all">Toutes</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Statut:</span>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-orange transition-all duration-200"
            >
              <option value="all">Tous les statuts</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            id="toggle-advanced-filters-btn"
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter size={12} />
            <span>Filtres {showAdvanced ? 'simples' : 'avancés'}</span>
            {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          )}
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 self-end lg:self-auto">
          <button
            id="view-grid-btn"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            title="Vue Cartes"
          >
            <Grid size={14} />
          </button>
          <button
            id="view-table-btn"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            title="Vue Tableau"
          >
            <List size={14} />
          </button>
        </div>

      </div>

      {/* Advanced Filters Expandable Drawer Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4" id="advanced-filters-panel">
          
          {/* Floor Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Étage</label>
            <select
              id="filter-floor-select"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-orange transition-all duration-200"
            >
              <option value="all">Tous les étages</option>
              {floors.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Amenity Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Équipement requis</label>
            <select
              id="filter-amenity-select"
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-orange transition-all duration-200"
            >
              <option value="all">Aucun équipement spécifique</option>
              {amenities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Active/Inactive Toggle Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">État du référentiel</label>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                id="filter-active-all"
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Tout
              </button>
              <button
                id="filter-active-active"
                type="button"
                onClick={() => setActiveFilter('active')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Actives
              </button>
              <button
                id="filter-active-inactive"
                type="button"
                onClick={() => setActiveFilter('inactive')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeFilter === 'inactive' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Inactives
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
