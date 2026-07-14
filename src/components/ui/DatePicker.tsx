/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  label,
  minDate,
  maxDate,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar navigation state (current month/year view)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value || new Date();
    return d.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const d = value || new Date();
    return d.getFullYear();
  });

  // Sync calendar view with selected value when modal opens
  useEffect(() => {
    if (value) {
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
    }
  }, [value, isOpen]);

  // Handle outside clicks to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Calendar calculations
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    // getDay() returns 0 for Sunday, 1 for Monday etc.
    // Adjusting to 0 for Monday, 6 for Sunday
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  // Navigate months
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    // Check boundaries
    if (minDate && selectedDate < new Date(minDate.setHours(0,0,0,0))) return;
    if (maxDate && selectedDate > new Date(maxDate.setHours(23,59,59,999))) return;

    if (onChange) {
      onChange(selectedDate);
    }
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(undefined);
    }
  };

  // Format date display (DD/MM/YYYY)
  const formatDateDisplay = (date?: Date) => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // Helper to check if two dates are same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  // Generate calendar grid array
  const calendarCells = useMemo(() => {
    const cells: { day: number | null; isCurrent: boolean; disabled: boolean; isToday: boolean; isSelected: boolean }[] = [];
    const today = new Date();

    // Previous month filler cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, isCurrent: false, disabled: true, isToday: false, isSelected: false });
    }

    // Active month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentYear, currentMonth, day);
      
      let isDisabled = false;
      if (minDate && cellDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
        isDisabled = true;
      }
      if (maxDate && cellDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
        isDisabled = true;
      }

      cells.push({
        day,
        isCurrent: true,
        disabled: isDisabled,
        isToday: isSameDay(cellDate, today),
        isSelected: value ? isSameDay(cellDate, value) : false,
      });
    }

    return cells;
  }, [currentMonth, currentYear, daysInMonth, firstDayIndex, minDate, maxDate, value]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-muted mb-1.5">
          {label}
        </label>
      )}

      {/* Input trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between border border-outline bg-surface-elevated px-3.5 py-2 rounded-lg cursor-pointer text-xs font-semibold select-none transition-all duration-150 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-orange/40 focus-within:ring-2 focus-within:ring-brand-orange/20'
        }`}
      >
        <div className="flex items-center space-x-2.5 text-on-background flex-1">
          <CalendarIcon size={14} className="text-on-surface-muted flex-shrink-0" />
          {value ? (
            <span className="text-on-background">{formatDateDisplay(value)}</span>
          ) : (
            <span className="text-on-surface-muted/60">{placeholder}</span>
          )}
        </div>
        {value && !disabled && (
          <button
            onClick={clearDate}
            className="p-0.5 rounded-full hover:bg-surface text-on-surface-muted hover:text-on-surface"
            title="Effacer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 bg-surface-elevated border border-outline shadow-xl rounded-xl p-4 w-64 select-none animate-fadeIn">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md border border-outline bg-surface hover:bg-surface-soft text-on-surface transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-on-background">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md border border-outline bg-surface hover:bg-surface-soft text-on-surface transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Days of week short names */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-on-surface-muted uppercase mb-1.5">
            {DAYS_SHORT.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} />;
              }

              return (
                <button
                  key={`day-${cell.day}`}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => handleDaySelect(cell.day!)}
                  className={`h-7 w-7 text-xs font-bold rounded-md flex items-center justify-center transition-all duration-100 ${
                    cell.isSelected
                      ? 'bg-brand-orange text-white'
                      : cell.disabled
                        ? 'opacity-20 cursor-not-allowed'
                        : cell.isToday
                          ? 'border border-brand-orange text-brand-orange hover:bg-orange-50'
                          : 'hover:bg-surface text-on-background'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
