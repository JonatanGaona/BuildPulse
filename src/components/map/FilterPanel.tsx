'use client';
import { useState } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import styles from '../../styles/_filters.module.scss';

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    incidents, 
    filteredIncidents, 
    searchQuery, 
    setSearchQuery, 
    selectedType, 
    setSelectedType 
  } = useIncidentStore();

  const uniqueTypes = Array.from(
    new Map(incidents.map(item => [item.type.key, item.type])).values()
  );

  return (
    <>
      {/* BOTÓN PÍLDORA DISPARADOR*/}
      <button 
        className={styles.filterTriggerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="Filtrar incidencias"
      >
        <SlidersHorizontal size={16} color="#ffffff" />
        <span>Filtros</span>
      </button>

      {/* PANEL FLOTANTE CONDICIONAL */}
      {isOpen && (
        <div className={styles.floatingFilterCard}>
          
          <div className={styles.filterHeader}>
            <span>Filtros de búsqueda</span>
            <button onClick={() => setIsOpen(false)} className={styles.btnClose}>
              <X size={16} />
            </button>
          </div>

          <div className={styles.filterBody}>
            <div className={styles.searchBox}>
              <Search size={16} color="#718096" />
              <input 
                type="text" 
                placeholder="Buscar por título, descripción o ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="#f2b724" />
              <select
                className={styles.categorySelect}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todas las especialidades</option>
                {uniqueTypes.map((type) => (
                  <option key={type.id} value={type.key}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.resultsCounter}>
              <span>Resultados filtrados:</span>
              <div><strong>{filteredIncidents.length}</strong> / {incidents.length}</div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}