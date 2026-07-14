/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  X
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[]; // Keys to search through (defaults to searching all string/number fields)
  onRowClick?: (row: T) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  selectedRows?: T[];
  initialPageSize?: number;
  emptyStateText?: string;
  actions?: React.ReactNode; // Extra toolbar items
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Rechercher...',
  searchKeys,
  onRowClick,
  enableSelection = false,
  onSelectionChange,
  selectedRows = [],
  initialPageSize = 10,
  emptyStateText = 'Aucun élément trouvé',
  actions,
}: DataTableProps<T>) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [localSelected, setLocalSelected] = useState<T[]>(selectedRows);

  // Sync selectedRows from props if managed externally
  useEffect(() => {
    if (selectedRows) {
      setLocalSelected(selectedRows);
    }
  }, [selectedRows]);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // 1. Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearch = searchTerm.toLowerCase();
    const targetKeys = searchKeys || columns.map(c => c.key);

    return data.filter((row) => {
      return targetKeys.some((key) => {
        const val = row[key];
        if (val === null || val === undefined) return false;
        
        // Deep string representation checks
        if (typeof val === 'object') {
          try {
            return JSON.stringify(val).toLowerCase().includes(lowerSearch);
          } catch {
            return false;
          }
        }
        return String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm, searchKeys, columns]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    const sorted = [...filteredData];
    const key = sortConfig.key;
    const isAsc = sortConfig.direction === 'asc';

    sorted.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Normalize values for sorting
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA === undefined || valA === null) return isAsc ? 1 : -1;
      if (valB === undefined || valB === null) return isAsc ? -1 : 1;

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // 3. Paginate Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  // Sync selection change to parent
  const handleSelectionChange = (newSelection: T[]) => {
    setLocalSelected(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Toggle selection for a single row
  const toggleRowSelection = (row: T, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering onRowClick
    
    // Check if item is already selected
    const isSelected = localSelected.some(item => {
      // Prefer unique identifier like id, uuid, code, or fallback to object identity
      const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
      if (idKey) {
        return item[idKey] === row[idKey];
      }
      return item === row;
    });

    let updated: T[];
    if (isSelected) {
      updated = localSelected.filter(item => {
        const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
        if (idKey) {
          return item[idKey] !== row[idKey];
        }
        return item !== row;
      });
    } else {
      updated = [...localSelected, row];
    }
    handleSelectionChange(updated);
  };

  // Toggle selection for all visible paginated rows
  const toggleAllPageSelection = () => {
    const allPageSelected = paginatedData.every(row => 
      localSelected.some(item => {
        const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
        if (idKey) return item[idKey] === row[idKey];
        return item === row;
      })
    );

    let updated: T[];
    if (allPageSelected) {
      // Remove all paginated rows from selection
      updated = localSelected.filter(item => 
        !paginatedData.some(row => {
          const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
          if (idKey) return item[idKey] === row[idKey];
          return item === row;
        })
      );
    } else {
      // Add missing paginated rows
      const missing = paginatedData.filter(row => 
        !localSelected.some(item => {
          const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
          if (idKey) return item[idKey] === row[idKey];
          return item === row;
        })
      );
      updated = [...localSelected, ...missing];
    }
    handleSelectionChange(updated);
  };

  // Check if a row is selected
  const isRowSelected = (row: T) => {
    return localSelected.some(item => {
      const idKey = 'id' in item ? 'id' : ('code' in item ? 'code' : '');
      if (idKey) return item[idKey] === row[idKey];
      return item === row;
    });
  };

  // Handle column sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: '', direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Reset page on sort change
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="text-on-surface-muted opacity-40 hover:opacity-100 transition-opacity" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={14} className="text-brand-orange" />;
    }
    if (sortConfig.direction === 'desc') {
      return <ArrowDown size={14} className="text-brand-orange" />;
    }
    return <ArrowUpDown size={14} className="text-on-surface-muted opacity-40" />;
  };

  // Align maps
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search and Toolbar Panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-muted">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="block w-full pl-9 pr-8 py-2 border border-outline bg-surface-elevated text-on-background text-xs font-medium rounded-lg placeholder-on-surface-muted focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:outline-hidden transition-all duration-150"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-muted hover:text-on-surface transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Selected Row Counter Badge */}
      {enableSelection && localSelected.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-2 flex items-center justify-between text-xs font-bold text-brand-orange animate-fadeIn">
          <span>{localSelected.length} élément(s) sélectionné(s)</span>
          <button 
            onClick={() => handleSelectionChange([])} 
            className="text-[10px] uppercase tracking-wider text-on-surface-muted hover:text-brand-orange font-extrabold transition-colors"
          >
            Effacer la sélection
          </button>
        </div>
      )}

      {/* Table Main Wrapper */}
      <div className="bg-surface-elevated border border-outline rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline text-on-surface-muted uppercase font-bold tracking-wider select-none">
                {enableSelection && (
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every(row => isRowSelected(row))
                      }
                      onChange={toggleAllPageSelection}
                      className="w-4 h-4 rounded-sm border-outline bg-surface text-brand-orange focus:ring-brand-orange focus:ring-offset-0 focus:outline-hidden cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`p-4 font-bold text-on-surface-muted ${column.sortable ? 'cursor-pointer hover:bg-surface-soft transition-colors' : ''} ${alignClasses[column.align || 'left']} ${column.className || ''}`}
                    style={{ minWidth: '80px' }}
                  >
                    <div className={`flex items-center gap-1.5 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      <span>{column.header}</span>
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-outline">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => {
                  const selected = isRowSelected(row);
                  return (
                    <tr
                      key={row.id || rowIndex}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`hover:bg-background/45 transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''} ${selected ? 'bg-orange-50/20' : ''}`}
                    >
                      {enableSelection && (
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => toggleRowSelection(row, e as any)}
                            className="w-4 h-4 rounded-sm border-outline text-brand-orange focus:ring-brand-orange focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`p-4 text-on-background ${alignClasses[column.align || 'left']} ${column.className || ''}`}
                        >
                          {column.render 
                            ? column.render(row, rowIndex) 
                            : row[column.key] !== undefined && row[column.key] !== null 
                              ? String(row[column.key]) 
                              : <span className="text-on-surface-muted/40">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0)}
                    className="p-10 text-center text-on-surface-muted font-bold"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-on-surface-muted">
                        <Search size={18} />
                      </div>
                      <p>{emptyStateText}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedData.length > 0 && (
          <div className="px-6 py-4 bg-surface/30 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            {/* Left side: Range stats */}
            <div className="text-xs text-on-surface-muted font-bold">
              Affichage de{' '}
              <span className="text-on-background">
                {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}
              </span>{' '}
              à{' '}
              <span className="text-on-background">
                {Math.min(sortedData.length, currentPage * pageSize)}
              </span>{' '}
              sur <span className="text-on-background">{sortedData.length}</span> éléments
            </div>

            {/* Right side: Controls & Page Selection */}
            <div className="flex items-center gap-6">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-muted font-bold">Afficher</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // reset to page 1 on resize
                  }}
                  className="bg-surface border border-outline rounded-md px-2 py-1 text-xs font-bold text-on-surface focus:ring-1 focus:ring-brand-orange focus:outline-hidden cursor-pointer"
                >
                  {[5, 10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-outline bg-surface text-on-surface hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface transition-colors cursor-pointer"
                  title="Première page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-outline bg-surface text-on-surface hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface transition-colors cursor-pointer"
                  title="Page précédente"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="text-xs font-bold text-on-surface px-2">
                  Page <span className="text-brand-orange">{currentPage}</span> sur{' '}
                  <span className="text-on-background">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-outline bg-surface text-on-surface hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface transition-colors cursor-pointer"
                  title="Page suivante"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-outline bg-surface text-on-surface hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface transition-colors cursor-pointer"
                  title="Dernière page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
