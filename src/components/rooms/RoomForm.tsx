import React, { useState, useEffect } from 'react';
import { IRoom, IRoomCategory, IAmenity, IRoomTariff } from '../../types';
import { renderAmenityIcon } from './roomUtils';

interface RoomFormProps {
  room?: IRoom; // Defined if we are editing an existing room
  categories: IRoomCategory[];
  amenities: IAmenity[];
  onSave: (roomData: Partial<IRoom>) => void;
  onCancel: () => void;
}

export default function RoomForm({
  room,
  categories,
  amenities,
  onSave,
  onCancel
}: RoomFormProps) {
  const isEditing = !!room;

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [floor, setFloor] = useState('1er Étage');
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState('Lit Double');
  const [area, setArea] = useState(25);
  const [basePrice, setBasePrice] = useState(35000);
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Tariff state
  const [priceWeekend, setPriceWeekend] = useState(38000);
  const [priceSeason, setPriceSeason] = useState(45000);
  const [priceCorporate, setPriceCorporate] = useState(32000);
  const [priceOta, setPriceOta] = useState(40000);

  // Initialize form fields with room data or category defaults
  useEffect(() => {
    if (room) {
      setRoomNumber(room.room_number);
      setCategoryId(room.category_id);
      setFloor(room.floor);
      setCapacity(room.capacity);
      setBedType(room.bed_type);
      setArea(room.area);
      setBasePrice(room.base_price);
      setNotes(room.notes || '');
      setActive(room.active);
      setSelectedAmenities(room.amenities || []);

      // Pull multi-tariffs if they exist
      const weekendTariff = room.prices.find(p => p.rate_type === 'weekend')?.amount;
      const seasonTariff = room.prices.find(p => p.rate_type === 'season')?.amount;
      const corporateTariff = room.prices.find(p => p.rate_type === 'corporate')?.amount;
      const otaTariff = room.prices.find(p => p.rate_type === 'ota')?.amount;

      if (weekendTariff !== undefined) setPriceWeekend(weekendTariff);
      if (seasonTariff !== undefined) setPriceSeason(seasonTariff);
      if (corporateTariff !== undefined) setPriceCorporate(corporateTariff);
      if (otaTariff !== undefined) setPriceOta(otaTariff);
    } else {
      // Create defaults
      setRoomNumber('');
      const defaultCat = categories[0]?.id || 'cat-std';
      setCategoryId(defaultCat);
      setFloor('1er Étage');
      setNotes('');
      setActive(true);
      setSelectedAmenities([]);
      
      const catObj = categories.find(c => c.id === defaultCat);
      if (catObj) {
        setCapacity(catObj.max_capacity);
        setBasePrice(catObj.default_price);
        setBedType(defaultCat === 'cat-twin' ? '2 Lits Simples' : 'Lit Double');
        setArea(25);
        setPriceWeekend(Math.round(catObj.default_price * 1.1));
        setPriceSeason(Math.round(catObj.default_price * 1.3));
        setPriceCorporate(Math.round(catObj.default_price * 0.9));
        setPriceOta(Math.round(catObj.default_price * 1.15));
      }
    }
  }, [room, categories]);

  // If category changes during creation, update fields dynamically to match category default presets
  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    
    // Only auto-fill presets if creating a new room, or if the user confirms
    const catObj = categories.find(c => c.id === catId);
    if (catObj) {
      setCapacity(catObj.max_capacity);
      setBasePrice(catObj.default_price);
      setBedType(catId === 'cat-twin' ? '2 Lits Simples' : 'Lit Double');
      
      // Auto estimate secondary tariffs based on default standard ratios
      setPriceWeekend(Math.round(catObj.default_price * 1.1));
      setPriceSeason(Math.round(catObj.default_price * 1.3));
      setPriceCorporate(Math.round(catObj.default_price * 0.9));
      setPriceOta(Math.round(catObj.default_price * 1.15));

      if (catId === 'cat-std') setArea(22);
      else if (catId === 'cat-twin') setArea(25);
      else if (catId === 'cat-dlx') setArea(32);
      else if (catId === 'cat-ste') setArea(45);
      else if (catId === 'cat-fam') setArea(55);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };

  const selectAllAmenities = () => {
    setSelectedAmenities(amenities.map(a => a.id));
  };

  const selectNoneAmenities = () => {
    setSelectedAmenities([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    // Assemble dynamic prices array
    const prices: IRoomTariff[] = [
      { rate_type: 'normal', amount: basePrice },
      { rate_type: 'weekend', amount: priceWeekend },
      { rate_type: 'season', amount: priceSeason },
      { rate_type: 'corporate', amount: priceCorporate },
      { rate_type: 'ota', amount: priceOta }
    ];

    const resultData: Partial<IRoom> = {
      room_number: roomNumber,
      category_id: categoryId,
      floor,
      capacity: Number(capacity),
      bed_type: bedType,
      area: Number(area),
      base_price: Number(basePrice),
      notes: notes,
      active,
      amenities: selectedAmenities,
      prices
    };

    onSave(resultData);
  };

  // Group amenities by category for clean user selection
  const groupedAmenities = amenities.reduce((acc, current) => {
    if (!acc[current.category]) {
      acc[current.category] = [];
    }
    acc[current.category].push(current);
    return acc;
  }, {} as Record<string, IAmenity[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left" id="rooms-edit-create-form">
      
      {/* SECTION 1: PHYSICAL CHARACTERISTICS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">
          Caractéristiques physiques
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Room Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Numéro de chambre <span className="text-red-500">*</span></label>
            <input
              id="form-room-number"
              type="text"
              required
              placeholder="Ex: 105"
              disabled={isEditing} // Avoid changing the physical ID key of room
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Catégorie <span className="text-red-500">*</span></label>
            <select
              id="form-category-select"
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Floor */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Étage <span className="text-red-500">*</span></label>
            <select
              id="form-floor-select"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            >
              <option value="Rez-de-chaussée">Rez-de-chaussée</option>
              <option value="1er Étage">1er Étage</option>
              <option value="2ème Étage">2ème Étage</option>
              <option value="3ème Étage">3ème Étage</option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Bed Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Configuration lits</label>
            <input
              id="form-bed-type"
              type="text"
              placeholder="Ex: Lit King Size"
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Capacité maximale (pax)</label>
            <input
              id="form-capacity"
              type="number"
              min="1"
              max="10"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* Area */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Superficie (m²)</label>
            <input
              id="form-area"
              type="number"
              min="5"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* SECTION 2: MULTI-PRICING AND TARIFICATION */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">
          Tarification & Grilles de prix (XOF)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          
          {/* Standard Base Price */}
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-bold text-slate-800 block">Standard (Semaine) <span className="text-red-500">*</span></label>
            <input
              id="form-base-price"
              type="number"
              min="1000"
              step="500"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full border-2 border-brand-orange/40 rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange focus:outline-none bg-brand-orange/[0.01]"
            />
          </div>

          {/* Weekend price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Tarif Week-end</label>
            <input
              id="form-weekend-price"
              type="number"
              min="1000"
              step="500"
              value={priceWeekend}
              onChange={(e) => setPriceWeekend(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* High Season Price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Haute Saison</label>
            <input
              id="form-season-price"
              type="number"
              min="1000"
              step="500"
              value={priceSeason}
              onChange={(e) => setPriceSeason(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* Corporate Price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Tarif Corporate</label>
            <input
              id="form-corp-price"
              type="number"
              min="1000"
              step="500"
              value={priceCorporate}
              onChange={(e) => setPriceCorporate(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* OTA / Booking.com Price */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Tarif OTA (Booking)</label>
            <input
              id="form-ota-price"
              type="number"
              min="1000"
              step="500"
              value={priceOta}
              onChange={(e) => setPriceOta(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* SECTION 3: REUSABLE AMENITIES SELECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Équipements de la chambre
          </h3>
          <div className="space-x-2 text-[10px] font-bold">
            <button
              id="form-select-all-amenities"
              type="button"
              onClick={selectAllAmenities}
              className="text-brand-orange hover:underline"
            >
              Tout cocher
            </button>
            <span className="text-slate-300">•</span>
            <button
              id="form-select-none-amenities"
              type="button"
              onClick={selectNoneAmenities}
              className="text-slate-400 hover:underline"
            >
              Tout décocher
            </button>
          </div>
        </div>

        <div className="space-y-4" id="amenities-selection-groups">
          {Object.entries(groupedAmenities).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-1.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {categoryName}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {items.map(amenity => {
                  const isChecked = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      id={`amenity-toggle-${amenity.id}`}
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`px-3 py-2 border rounded-lg text-xs flex items-center gap-2 transition-all font-semibold ${
                        isChecked
                          ? 'border-brand-orange bg-brand-orange/[0.03] text-brand-orange font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isChecked ? 'text-brand-orange' : 'text-slate-400'}>
                        {renderAmenityIcon(amenity.icon, '', 13)}
                      </span>
                      <span>{amenity.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: NOTES & REFERENTIAL STATUS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1.5">
          Notes internes & État du référentiel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Notes Internes */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block">Notes de service ou consignes particulières</label>
            <textarea
              id="form-notes"
              rows={3}
              placeholder="Ex: Préférer les lits séparés si possible. Bruit léger provenant de la rue, s'assurer que le double vitrage est bien fermé."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-none resize-none"
            />
          </div>

          {/* Active status */}
          <div className="space-y-2 flex flex-col justify-center">
            <label className="text-xs font-bold text-slate-700 block">État dans l'annuaire</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                id="form-active-checkbox"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-brand-orange border-slate-300 focus:ring-brand-orange focus:outline-none"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Chambre Active</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Si décoché, elle sera visible en 'Hors service' et indisponible aux réservations.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ACTION ACTIONS AT FOOTER */}
      <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
        <button
          id="form-cancel-btn"
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
        <button
          id="form-submit-btn"
          type="submit"
          className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-lg shadow-sm transition-colors"
        >
          {isEditing ? 'Enregistrer les modifications' : 'Créer la chambre'}
        </button>
      </div>

    </form>
  );
}
