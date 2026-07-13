/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (range: { startDate?: Date; endDate?: Date }) => void;
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

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Sélectionner une période',
  label,
  minDate,
  maxDate,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar month view
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = startDate || new Date();
    return d.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const d = startDate || new Date();
    return d.getFullYear();
  });

  // Sync calendar month view when opening or startDate changes
  useEffect(() => {
    if (startDate) {
      setCurrentMonth(startDate.getMonth());
      setCurrentYear(startDate.getFullYear());
    }
  }, [startDate, isOpen]);

  // Outside click listener
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
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  // Navigations
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

  // Day Selection Flow
  const handleDaySelect = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0,0,0,0);

    // Enforce limits
    if (minDate && clickedDate < new Date(minDate.setHours(0,0,0,0))) return;
    if (maxDate && clickedDate > new Date(maxDate.setHours(23,59,59,999))) return;

    if (!startDate || (startDate && endDate)) {
      // Step 1: select starting date
      if (onChange) {
        onChange({ startDate: clickedDate, endDate: undefined });
      }
    } else {
      // Step 2: select end date
      const startMs = startDate.getTime();
      const clickMs = clickedDate.getTime();

      if (clickMs < startMs) {
        // If they click a day before start, it becomes the new start date
        if (onChange) {
          onChange({ startDate: clickedDate, endDate: undefined });
        }
      } else {
        // Successful range selected!
        const endOfRange = new Date(clickedDate);
        endOfRange.setHours(23,59,59,999);
        if (onChange) {
          onChange({ startDate, endDate: endOfRange });
        }
        setIsOpen(false); // Close modal on full selection
      }
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ startDate: undefined, endDate: undefined });
    }
  };

  // Preset filter range helper
  const selectPresetRange = (preset: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let start = new Date(today);
    let end = new Date(today);

    switch (preset) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case 'this_week': {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        start = new Date(today.setDate(diff));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'next_7':
        end.setDate(today.getDate() + 6);
        break;
      case 'next_30':
        end.setDate(today.getDate() + 29);
        break;
      default:
        return;
    }

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    if (onChange) {
      onChange({ startDate: start, endDate: end });
    }
    setIsOpen(false);
  };

  // Format ranges
  const formatDateDisplay = (date?: Date) => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const displayString = useMemo(() => {
    if (!startDate) return '';
    if (startDate && !endDate) {
      return `${formatDateDisplay(startDate)} — ...`;
    }
    return `${formatDateDisplay(startDate)} au ${formatDateDisplay(endDate)}`;
  }, [startDate, endDate]);

  // Date state match checkers
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const isBetween = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  // Create calendar cells with range statuses
  const calendarCells = useMemo(() => {
    const cells: { 
      day: number | null; 
      disabled: boolean; 
      isToday: boolean; 
      isStart: boolean; 
      isEnd: boolean; 
      isRange: boolean;
    }[] = [];
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, disabled: true, isToday: false, isStart: false, isEnd: false, isRange: false });
    }

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
        disabled: isDisabled,
        isToday: isSameDay(cellDate, today),
        isStart: startDate ? isSameDay(cellDate, startDate) : false,
        isEnd: endDate ? isSameDay(cellDate, endDate) : false,
        isRange: isBetween(cellDate),
      });
    }

    return cells;
  }, [currentMonth, currentYear, daysInMonth, firstDayIndex, minDate, maxDate, startDate, endDate]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-muted mb-1.5">
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between border border-outline bg-surface-elevated px-3.5 py-2 rounded-lg cursor-pointer text-xs font-semibold select-none transition-all duration-150 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-orange/40 focus-within:ring-2 focus-within:ring-brand-orange/20'
        }`}
      >
        <div className="flex items-center space-x-2.5 text-on-background flex-1">
          <CalendarIcon size={14} className="text-on-surface-muted flex-shrink-0" />
          {startDate ? (
            <span className="text-on-background">{displayString}</span>
          ) : (
            <span className="text-on-surface-muted/60">{placeholder}</span>
          )}
        </div>
        {startDate && !disabled && (
          <button
            onClick={clearSelection}
            className="p-0.5 rounded-full hover:bg-surface text-on-surface-muted hover:text-on-surface"
            title="Effacer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 bg-surface-elevated border border-outline shadow-2xl rounded-xl p-4 flex gap-4 select-none animate-fadeIn w-max">
          
          {/* Preset options menu */}
          <div className="flex flex-col gap-1.5 border-r border-outline pr-4 w-36">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-muted mb-1">Raccourcis</span>
            <button
              onClick={(e) => selectPresetRange('today', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={(e) => selectPresetRange('yesterday', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              Hier
            </button>
            <button
              onClick={(e) => selectPresetRange('this_week', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              Cette semaine
            </button>
            <button
              onClick={(e) => selectPresetRange('this_month', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              Ce mois
            </button>
            <button
              onClick={(e) => selectPresetRange('next_7', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              7 prochains jours
            </button>
            <button
              onClick={(e) => selectPresetRange('next_30', e)}
              className="text-left text-xs font-bold px-2 py-1.5 rounded-md hover:bg-surface text-on-surface transition-colors"
            >
              30 prochains jours
            </button>
          </div>

          {/* Calendar pane */}
          <div className="w-56">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-md border border-outline bg-surface hover:bg-surface-soft text-on-surface transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-on-background">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-md border border-outline bg-surface hover:bg-surface-soft text-on-surface transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-on-surface-muted uppercase mb-1.5">
              {DAYS_SHORT.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (cell.day === null) {
                  return <div key={`empty-${idx}`} />;
                }

                const isEndpoint = cell.isStart || cell.isEnd;

                return (
                  <button
                    key={`day-${cell.day}`}
                    type="button"
                    disabled={cell.disabled}
                    onClick={() => handleDaySelect(cell.day!)}
                    className={`h-7 w-7 text-xs font-bold flex items-center justify-center transition-all duration-100 ${
                      isEndpoint
                        ? 'bg-brand-orange text-white rounded-md'
                        : cell.isRange
                          ? 'bg-brand-orange/10 text-brand-orange rounded-none'
                          : cell.disabled
                            ? 'opacity-20 cursor-not-allowed'
                            : cell.isToday
                              ? 'border border-brand-orange text-brand-orange rounded-md hover:bg-orange-50'
                              : 'hover:bg-surface text-on-background rounded-md'
                    }`}
                    style={{
                      // Visual merge styling for in-between ranges
                      borderTopLeftRadius: cell.isRange ? '0px' : undefined,
                      borderBottomLeftRadius: cell.isRange ? '0px' : undefined,
                      borderTopRightRadius: cell.isRange ? '0px' : undefined,
                      borderBottomRightRadius: cell.isRange ? '0px' : undefined,
                    }}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
